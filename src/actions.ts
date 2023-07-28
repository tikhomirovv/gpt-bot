import { BotContext, UserSession } from "./types/app"
import Logger from "js-logger"
import { message } from "telegraf/filters"
import { code } from "telegraf/format"
import { getSession, resetSession } from "./session"
import { convert, download, remove } from "./voice"
import { openai } from "./openai"
import { chatMessage } from "./chat"
import { FmtString } from "telegraf/format"
import { characterKeyboard, helpKeyboard, termsKeyboard } from "./keyboard"
import { getCharacterMessage } from "./character"
import messages from "./messages"
import * as packageJson from "../package.json"
import config from "config"
import userRepository from "./db/repository/user"

export const start = async (ctx: BotContext) => {
  const session = await getSession(ctx)
  const hello = messages.m("start.hello", { username: session.firstname })
  const botVersion: string = packageJson.version.replace(/\./g, "\\.")
  const version = `🤖 *GPT\\-бот v${botVersion}*`
  const aboutMessage = messages.m("start.about")
  ctx.replyWithMarkdownV2(hello + "\n\n" + aboutMessage + "\n\n" + version)
}

export const help = async (ctx: BotContext) => {
  const helpMessage = messages.m("help")
  ctx.replyWithMarkdownV2(helpMessage, helpKeyboard)
}

export const balance = async (ctx: BotContext) => {
  const session = await getSession(ctx)
  const user = await userRepository.getByTelegramId(session.telegramId)
  if (user) {
    const message = messages.m("balance.info", {
      id: user._id,
      balance: user.tokens.balance,
      used: user.tokens.used,
    })
    ctx.replyWithMarkdownV2(message)
  }
}

export async function hearsVoice(ctx: BotContext) {
  const typing = sendTypingInterval(ctx)
  try {
    if (!ctx.has(message("voice"))) {
      throw new Error("Attempted to process the voice, but it is not there")
    }
    const session = await getSession(ctx)

    // 1. Get file-link, download, convert
    const waitMessage = await ctx.reply(code(messages.m("waiting.audio")))
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
    const ogg = await download(link.href, session.userId)
    const mp3 = await convert(ogg)
    await remove(ogg)

    // 2. Transcription
    const text = await openai.transcription(mp3)
    await remove(mp3)
    await editMessage(
      ctx,
      { chat_id: waitMessage.chat.id, message_id: waitMessage.message_id },
      code(text),
    )

    // 3. Get answer
    const answer = await sendToChat(ctx, session, text)
    await ctx.reply(answer, { reply_to_message_id: ctx.message.message_id })
  } catch (e: any) {
    errorReply(ctx, e)
  } finally {
    clearInterval(typing)
  }
}

export async function hearsText(ctx: BotContext) {
  const typing = sendTypingInterval(ctx)
  try {
    if (!ctx.has(message("text"))) {
      throw new Error("No text in message")
    }
    const session = await getSession(ctx)
    const waitMessage = await ctx.reply(code(messages.m("waiting.text")), {
      reply_to_message_id: ctx.message.message_id,
    })
    const answer = await sendToChat(ctx, session, ctx.message.text)
    await editMessage(
      ctx,
      { chat_id: waitMessage.chat.id, message_id: waitMessage.message_id },
      answer,
    )
  } catch (e: any) {
    errorReply(ctx, e)
  } finally {
    clearInterval(typing)
  }
}

export async function reset(ctx: BotContext) {
  try {
    const session = await resetSession(ctx)
    Logger.debug("Reset session: ", session)
    await ctx.reply(messages.m("reset"))
  } catch (e: any) {
    errorReply(ctx, e)
  }
}

export async function character(ctx: BotContext) {
  try {
    await ctx.reply(messages.m("character"), characterKeyboard)
  } catch (e: any) {
    errorReply(ctx, e)
  }
}

export async function terms(ctx: BotContext & { match?: RegExpExecArray }) {
  try {
    const currentPage = ctx.match ? parseInt(ctx.match[1]) : 1
    const pages: string[] = config.get("terms")

    const session = await getSession(ctx)
    const isAgreed = await userRepository.getTermsIsAgreed(session.telegramId)
    const keyboard = termsKeyboard(currentPage, pages.length, isAgreed)
    const text =
      pages[currentPage - 1] + `\n\n*\\[${currentPage}/${pages.length}\\]*`
    if (ctx.callbackQuery?.id) {
      await ctx.telegram.editMessageText(
        ctx.chat!.id,
        ctx.callbackQuery.message!.message_id,
        undefined,
        text,
        {
          ...keyboard,
          parse_mode: "MarkdownV2",
          disable_web_page_preview: true,
        },
      )
    } else {
      await ctx.replyWithMarkdownV2(text, keyboard)
    }
  } catch (e: any) {
    errorReply(ctx, e)
  }
}
export async function termsOk(ctx: BotContext & { match: RegExpExecArray }) {
  try {
    const isAgreed = !!parseInt(ctx.match[1])
    const session = await getSession(ctx)
    await userRepository.setTermsIsAgreed(session.telegramId, isAgreed)
    const text = isAgreed
      ? messages.m("terms.accepted")
      : messages.m("terms.notAccepted")
    const termsMessage = ctx.callbackQuery?.message
    if (termsMessage) {
      ctx.deleteMessage(termsMessage.message_id)
    }

    await ctx.reply(text)
    return
  } catch (e: any) {
    errorReply(ctx, e)
  }
}

export async function characterCallback(
  ctx: BotContext & { match: RegExpExecArray },
) {
  try {
    const action = ctx.match[1]
    const session = await resetSession(ctx)
    const message = await getCharacterMessage(+action)
    const answer = await sendToChat(ctx, session, message)
    await ctx.answerCbQuery()
    await ctx.reply(answer)
    return
  } catch (e: any) {
    errorReply(ctx, e)
  }
}

// Need to be closed
const sendTypingInterval = (ctx: BotContext): NodeJS.Timer => {
  const interval = 5000 // https://core.telegram.org/bots/api#sendchataction
  return setInterval(() => {
    ctx.telegram.sendChatAction(ctx.chat!.id, "typing")
  }, interval)
}

const editMessage = (
  ctx: BotContext,
  waitMessage: { chat_id: number; message_id: number },
  text: string | FmtString,
) => {
  return ctx.telegram.editMessageText(
    waitMessage.chat_id,
    waitMessage.message_id,
    undefined,
    text,
  )
}

const sendToChat = async (
  ctx: BotContext,
  session: UserSession,
  text: string,
): Promise<string> => {
  try {
    return await chatMessage(session, text)
  } catch (e) {
    await ctx.reply(messages.m("error.gpt"))
    Logger.error(e)
    throw e
  }
}

const errorReply = (ctx: BotContext, error: any) => {
  ctx.reply(messages.m("error.fatal"))
  Logger.error("Fatal error", error)
}

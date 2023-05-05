import { BotContext, ChatMessage, ChatRole } from "./types"
import Logger from "js-logger"
import { message } from "telegraf/filters"
import { code } from 'telegraf/format'
import { getSession, newSession, resetSession } from "./session"
import { convert, download, remove } from "./voice"
import { Message } from "telegraf/typings/core/types/typegram"
import { openai } from "./openai"
import { chatMessage } from "./chat"
import { FmtString } from "telegraf/format"
import { getRandomFromArray } from "./utils"

export const help = async (ctx: BotContext) => {
    const session = await getSession(ctx)
    const message = `
*telegramId*: ${session.telegramId}
*firstname*: ${session.firstname}
    `
    ctx.replyWithMarkdownV2(message)
}

export const start = async (ctx: BotContext) => {
    const session = await getSession(ctx)
    ctx.replyWithMarkdownV2('👋 Приветики, *' + session.firstname + '*\\!');
}

export async function hearsVoice(ctx: BotContext) {
    try {
        if (!ctx.has(message("voice"))) {
            Logger.warn("Попытка обработать голос, но его нет")
            return
        }
        const session = await getSession(ctx)
        const waitMessage = await ctx.reply(code("🤔 ..."))
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const userId = String(ctx.message.from.id)
        const ogg = await download(link.href, userId)
        const mp3 = await convert(ogg)
        await remove(ogg)
        const text = await openai.transcription(mp3)
        await editMessage(ctx, waitMessage, code(text))
        await remove(mp3)
        const answer = await chatMessage(session, text)
        await ctx.reply(answer)
    } catch (e: any) {
        errorReply(ctx, e)
    }
}

export async function hearsText(ctx: BotContext) {
    try {
        if (!ctx.has(message("text"))) {
            Logger.warn("Попытка обработать текст, но его нет")
            return
        }
        const session = await getSession(ctx)
        const waitMessage = await ctx.reply(getRandomFromArray([
            code("🧠 ..."),
            code("⏳ ..."),
            code("🤔 ..."),
        ]))
        const answer = await chatMessage(session, ctx.message.text)
        await editMessage(ctx, waitMessage, answer)
    } catch (e: any) {
        errorReply(ctx, e)
    }
}

export async function reset(ctx: BotContext) {
    try {
        const session = await resetSession(ctx)
        Logger.debug("Reset session: ", session)
        await ctx.reply(getRandomFromArray([
            "Ладно, закроем тему 👌",
            "Вот это называется спонтанная амнезия - сразу все забыл 🤷‍♂️",
            "Давай поговорим о чём-нибудь другом 💭",
            "Нить разговора безвозвратно утеряна 🙈",
            "Ой, опять забыл, кто я, где я и о чем мы говорим 😵",
        ]))
    } catch (e: any) {
        errorReply(ctx, e)
    }
}

const editMessage = (ctx: BotContext, waitMessage: Message.TextMessage, text: string | FmtString) => {
    return ctx.telegram.editMessageText(
        waitMessage.chat.id,
        waitMessage.message_id,
        undefined, // Use undefined to keep the original markup
        text
    );
}

const errorReply = (ctx: BotContext, error: any) => {
    ctx.reply("🤬 Мне больно, смотри логи")
    Logger.error("Error", error)
}
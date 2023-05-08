import { BotContext, UserSession } from "./types/app"
import Logger from "js-logger"
import { message } from "telegraf/filters"
import { code } from 'telegraf/format'
import { getSession, resetSession } from "./session"
import { convert, download, remove } from "./voice"
import { Message } from "telegraf/typings/core/types/typegram"
import { openai } from "./openai"
import { chatMessage } from "./chat"
import { FmtString } from "telegraf/format"
import { characterKeyboard, helpKeyboard } from "./keyboard"
import { getCharacterSystemMessage } from "./settings"
import messages from "./messages"
import * as packageJson from '../package.json';
import { ChatRole } from "./types/chat"

export const start = async (ctx: BotContext) => {
    const session = await getSession(ctx)
    ctx.reply(messages.m('start.hello', { username: session.firstname }));
}

export const help = async (ctx: BotContext) => {
    const session = await getSession(ctx)
    const botVersion: string = packageJson.version.replace(/\./g, '\\.');
    let message = `🤖 *GPT\\-бот v${botVersion}*`
    const helpMessage = messages.m('help')
    message += helpMessage ? "\n\n" + helpMessage : `\n*ID*: ${session.userId}`
    ctx.replyWithMarkdownV2(message, helpKeyboard)
}

export async function hearsVoice(ctx: BotContext) {
    try {
        if (!ctx.has(message("voice"))) {
            throw new Error("Попытка обработать голос, но его нет")
        }
        const session = await getSession(ctx)
        ctx.telegram.sendChatAction(ctx.chat.id, 'typing')
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const userId = String(ctx.message.from.id)
        const ogg = await download(link.href, userId)
        const mp3 = await convert(ogg)
        await remove(ogg)
        const text = await openai.transcription(mp3)
        await ctx.reply(code(text))
        await ctx.telegram.sendChatAction(ctx.chat.id, 'typing')
        await remove(mp3)
        const answer = await sendToChat(ctx, session, text)
        await ctx.reply(answer, { reply_to_message_id: ctx.message.message_id })
    } catch (e: any) {
        errorReply(ctx, e)
    }
}

export async function hearsText(ctx: BotContext) {
    try {
        if (!ctx.has(message("text"))) {
            throw new Error("No text in message")
        }
        const session = await getSession(ctx)
        await ctx.telegram.sendChatAction(ctx.chat.id, 'typing')
        const answer = await sendToChat(ctx, session, ctx.message.text)
        ctx.reply(answer, { reply_to_message_id: ctx.message.message_id })
    } catch (e: any) {
        errorReply(ctx, e)
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

export async function settings(ctx: BotContext) {
    try {
        await ctx.reply(messages.m("settings"), characterKeyboard)
    } catch (e: any) {
        errorReply(ctx, e)
    }
}

export async function characterCallback(ctx: BotContext & { match: RegExpExecArray }) {
    try {
        const action = ctx.match[1]
        const session = await resetSession(ctx)
    
        const message = await getCharacterSystemMessage(+action)
        const answer = await sendToChat(ctx, session, message)
        await ctx.answerCbQuery()
        await ctx.reply(answer)
        
        // системные сообщения работают не очень хорошо
        // гораздо лучше отправлять в чат текстом
        // session.systemMessages.character.push({ content: message, role: ChatRole.System })
        return
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

const sendToChat = async (ctx: BotContext, session: UserSession, text: string): Promise<string> => {
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
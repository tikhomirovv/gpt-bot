import { BotContext, ChatMessage, ChatRole } from "./types"
import Logger from "js-logger"
import { message } from "telegraf/filters"
import { code } from 'telegraf/format'
import { newSession } from "./session"
import { convert, download, remove } from "./voice"
import { Message } from "telegraf/typings/core/types/typegram"
import { openai } from "./openai"
import { MiddlewareFn } from "telegraf"
import { chatMessage } from "./chat"
import { FmtString } from "telegraf/format"

export const checkSession: MiddlewareFn<BotContext> = (ctx: BotContext, next: (() => Promise<void>)): Promise<unknown> | void => {
    ctx.session ??= newSession(ctx.from)
    Logger.debug("Session: ", ctx.session)
    next()
}

export const help = (ctx: BotContext) => {
    const message = `
*telegramId*: ${ctx.session.telegramId}
*firstname*: ${ctx.session.firstname}
    `
    ctx.replyWithMarkdownV2(message)
}

export const start = (ctx: BotContext) => {
    ctx.replyWithMarkdownV2('👋 Приветики, *' + ctx.session.firstname + '*\\!');
}

export async function hearsVoice(ctx: BotContext) {
    try {
        if (!ctx.has(message("voice"))) {
            Logger.warn("Попытка обработать голос, но его нет")
            return
        }
        const waitMessage = await ctx.reply(code("🤔 ..."))
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const userId = String(ctx.message.from.id)
        const ogg = await download(link.href, userId)
        const mp3 = await convert(ogg)
        await remove(ogg)
        const text = await openai.transcription(mp3)
        await editMessage(ctx, waitMessage, code(text))
        await remove(mp3)
        const answer = await chatMessage(ctx, text)
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
        const waitMessage = await ctx.reply(code("🤔 ..."))
        const answer = await chatMessage(ctx, ctx.message.text)
        await editMessage(ctx, waitMessage, answer)
    } catch (e: any) {
        errorReply(ctx, e)
    }
}

export async function reset(ctx: BotContext) {
    try {
        ctx.session = newSession(ctx.from)
        Logger.debug("Reset session: ", ctx.session)
        await ctx.reply("Представим, что ничего не было и начнём всё сначала 👌")
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
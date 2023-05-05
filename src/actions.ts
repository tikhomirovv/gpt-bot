import { BotContext, ChatMessage, ChatRole } from "./types"
import Logger from "js-logger"
import { message } from "telegraf/filters"
import { code } from 'telegraf/format'
import { getSession, resetSession } from "./session"
import { convert, download, remove } from "./voice"
import { Message } from "telegraf/typings/core/types/typegram"
import { openai } from "./openai"
import { chatMessage } from "./chat"
import { FmtString } from "telegraf/format"
import { characterKeyboard, helpKeyboard, roleKeyboard, settingsKeyboard } from "./keyboard"
import { SettingsAction, getCharacterSystemMessages, getRoleSystemMessages } from "./settings"
import messages from "./messages"
import * as packageJson from '../package.json';

export const start = async (ctx: BotContext) => {
    const session = await getSession(ctx)
    ctx.reply(messages.m('start.hello', { username: session.firstname }));
}

export const help = async (ctx: BotContext) => {
    const session = await getSession(ctx)
    const botVersion: string = packageJson.version.replace(/\./g, '\\.');
    let message = `🤖 *GPT\\-бот v${botVersion}*`
    const helpMessage = messages.m('help')
    message += helpMessage ? "\n\n" + helpMessage : ""
    message += `\n
*ID*: ${session.userId}
    `
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
        try {
            const answer = await chatMessage(session, text)
            await ctx.reply(answer, { reply_to_message_id: ctx.message.message_id })
        } catch (e) {
            await ctx.reply(messages.m("error.gpt"))
            Logger.error(e)
        }
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
        try {
            const answer = await chatMessage(session, ctx.message.text)
            ctx.reply(answer, { reply_to_message_id: ctx.message.message_id })
        } catch (e) {
            await ctx.reply(messages.m("error.gpt"))
            Logger.error(e)

        }
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
        await ctx.reply(messages.m("settings"), settingsKeyboard)
    } catch (e: any) {
        errorReply(ctx, e)
    }
}

export async function settingsCallback(ctx: BotContext) {
    try {
        // @ts-ignore
        const action = ctx.callbackQuery?.data;
        switch (action) {
            case SettingsAction.SelectRole:
                ctx.editMessageReplyMarkup(roleKeyboard.reply_markup)
                break
            case SettingsAction.SelectCharacter:
                ctx.editMessageReplyMarkup(characterKeyboard.reply_markup)
                break
            default:
                throw new Error(`No action \`${action}\``)
        }
    } catch (e: any) {
        errorReply(ctx, e)
    }
}

export async function roleCallback(ctx: BotContext) {
    try {
        // @ts-ignore
        const action = ctx.callbackQuery?.data;
        const session = await getSession(ctx)
        const systemMessages = await getRoleSystemMessages(action)
        session.systemMessages.role = systemMessages.map(content => ({ content, role: ChatRole.System }))
        await ctx.answerCbQuery(messages.m("role.changed"))
        return ctx.deleteMessage()
    } catch (e: any) {
        errorReply(ctx, e)
    }
}

export async function characterCallback(ctx: BotContext) {
    try {
        // @ts-ignore
        const action = ctx.callbackQuery?.data;
        const session = await getSession(ctx)
        const systemMessages = await getCharacterSystemMessages(action)
        session.systemMessages.character = systemMessages.map(content => ({ content, role: ChatRole.System }))
        await ctx.answerCbQuery(messages.m("character.changed"))
        return ctx.deleteMessage()
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
    ctx.reply(messages.m("error.fatal"))
    Logger.error("Fatal error", error)
}
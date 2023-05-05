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
import { getRandomFromArray } from "./utils"
import { characterKeyboard, roleKeyboard, settingsKeyboard } from "./keyboard"
import { SettingsAction, getCharacterSystemMessages, getRoleSystemMessages } from "./settings"

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
        const answer = await chatMessage(session, text)
        await ctx.reply(answer, { reply_to_message_id: ctx.message.message_id })
    } catch (e: any) {
        errorReply(ctx, e)
    }
}

export async function hearsText(ctx: BotContext) {
    try {
        if (!ctx.has(message("text"))) {
            throw new Error("Попытка обработать текст, но его нет")
        }
        const session = await getSession(ctx)
        await ctx.telegram.sendChatAction(ctx.chat.id, 'typing')
        const answer = await chatMessage(session, ctx.message.text)
        ctx.reply(answer, { reply_to_message_id: ctx.message.message_id })
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

export async function settings(ctx: BotContext) {
    try {
        await ctx.reply(getRandomFromArray([
            "Я мастер перевоплощений 😉",
        ]), settingsKeyboard)
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
                throw new Error(`Не найдено действие \`${action}\``)
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
        await ctx.answerCbQuery(getRandomFromArray([
            "Перевоплощение произошло 🎭",
            "Меня как будто подменили 💫",
            "Вхожу в новую роль 💄",
        ]))
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
        await ctx.answerCbQuery(getRandomFromArray([
            "Я стал другим 🧑‍🎨",
            "Я претерпел метаморфозу 🐛🦋",
            "Претерпел трансформацию 🌀",
        ]))
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
    ctx.reply("🤬 Что-то мне не хорошо... Позови разработчика, пожалуйста.")
    Logger.error("Error", error)
}
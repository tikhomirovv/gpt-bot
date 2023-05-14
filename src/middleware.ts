import { MiddlewareFn } from "telegraf"
import { BotContext } from "./types/app"
import { getSession } from "./session"
import config from 'config'
import messages from "./messages"

export const checkSession: MiddlewareFn<BotContext> = async (ctx: BotContext, next: (() => Promise<void>)): Promise<unknown> => {
    const session = await getSession(ctx)

    // check whitelist
    const whitelist: (string | number)[] | null = config.get('whitelist')
    if (whitelist && (!whitelist.includes(session.username!)) && (!whitelist.includes(session.telegramId))) {
        await ctx.reply(messages.m("start.forbidden"))
        return
    }
    return next()
}

// TODO: сделать проверку соответствия конфигурации
export const checkConfig: MiddlewareFn<BotContext> = (ctx: BotContext, next: (() => Promise<void>)): Promise<unknown> | void => {
    // const cfg: Config = config as any
    next()
}
import { MiddlewareFn } from "telegraf"
import { BotContext } from "./types"
import { getSession } from "./session"

export const checkSession: MiddlewareFn<BotContext> = (ctx: BotContext, next: (() => Promise<void>)): Promise<unknown> | void => {
    getSession(ctx)
    next()
}
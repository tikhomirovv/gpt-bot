import { MiddlewareFn } from "telegraf"
import { BotContext } from "./types/app"
import { getSession } from "./session"
import { Config } from "./types/config"
import config from 'config'
import Logger from "js-logger"

export const checkSession: MiddlewareFn<BotContext> = (ctx: BotContext, next: (() => Promise<void>)): Promise<unknown> | void => {
    getSession(ctx)
    next()
}

// TODO: сделать проверку соответствия конфигурации
export const checkConfig: MiddlewareFn<BotContext> = (ctx: BotContext, next: (() => Promise<void>)): Promise<unknown> | void => {
    // const cfg: Config = config as any
    next()
}
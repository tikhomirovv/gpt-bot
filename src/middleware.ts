import { MiddlewareFn } from "telegraf"
import { BotContext, UserSession } from "./types/app"
import { getSession } from "./session"
import config from "config"
import messages from "./messages"
import Logger from "js-logger"
import userRepository from "./db/repository/user"

export const checkSession: MiddlewareFn<BotContext> = async (
  ctx: BotContext,
  next: () => Promise<void>,
): Promise<unknown> => {
  const session = await getSession(ctx)
  Logger.debug("[Session]", session)
  // check whitelist
  const whitelist: (string | number)[] | null = config.get("whitelist")
  if (
    whitelist &&
    !whitelist.includes(session.username!) &&
    !whitelist.includes(session.telegramId)
  ) {
    await ctx.reply(messages.m("start.forbidden"))
    return
  }
  return next()
}

// Check balance & terms agreement
export const checkUser: MiddlewareFn<BotContext> = async (
  ctx: BotContext,
  next: () => Promise<void>,
): Promise<unknown> => {
  const session = await getSession(ctx)
  const user = await userRepository.getByTelegramId(session.telegramId)
  if (!user) return next()
  if (user.tokens.balance <= 0) {
    await ctx.reply(messages.m("balance.insufficientFunds"))
    return
  }
  if (!user.termsIsAgreed) {
    await ctx.reply(messages.m("terms.agreeIsRequired"))
    return
  }
  return next()
}

// TODO: сделать проверку соответствия конфигурации
export const checkConfig: MiddlewareFn<BotContext> = (
  ctx: BotContext,
  next: () => Promise<void>,
): Promise<unknown> | void => {
  // const cfg: Config = config as any
  next()
}

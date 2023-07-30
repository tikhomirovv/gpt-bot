import Logger from "js-logger"
import { BotContext, Session, UserSession } from "./types/app"
import userRepository from "./db/repository/user"
import { generateUserId } from "./utils"

export const defaultSession = (): Session => []

const getId = async (ctx: BotContext): Promise<number> => {
  if (!ctx.from) {
    Logger.error("`from` is undefinded", ctx.from)
    throw Error("From is `undefined`")
  }
  return ctx.from.id
}

export const getSession = async (ctx: BotContext): Promise<UserSession> => {
  const id = await getId(ctx)
  let session = ctx.session[id]
  if (!session) {
    session = await newSession(ctx)
    session = await setSession(ctx, session)
  }
  return session
}

export const newSession = async (ctx: BotContext): Promise<UserSession> => {
  const telegramId = await getId(ctx)
  const username = ctx.from!.username || ''
  const model = await userRepository.firstOrCreate(telegramId, username)
  return {
    userId: model ? model._id : generateUserId(telegramId),
    telegramId,
    username,
    firstname: ctx.from!.first_name,
    history: { messages: [], tokens: 0 },
  }
}

const setSession = async (
  ctx: BotContext,
  session: UserSession,
): Promise<UserSession> => {
  ctx.session[session.telegramId] = session
  return ctx.session[session.telegramId]
}

export const resetSession = async (ctx: BotContext): Promise<UserSession> => {
  let session = await newSession(ctx)
  return setSession(ctx, session)
}

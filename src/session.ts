import Logger from "js-logger";
import { BotContext, Session, UserSession } from "./types";

export const defaultSession = (): Session => ([])

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
    const id = await getId(ctx)
    return {
        telegramId: id,
        username: ctx.from!.username,
        firstname: ctx.from!.first_name,
        messages: [],
    }
}

const setSession = async (ctx: BotContext, session: UserSession): Promise<UserSession> => {
    ctx.session[session.telegramId] = session
    return ctx.session[session.telegramId]
}


export const resetSession = async (ctx: BotContext): Promise<UserSession> => {
    let session = await newSession(ctx)
    return setSession(ctx, session)
}


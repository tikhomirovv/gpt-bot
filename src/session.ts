import Logger from "js-logger";
import { User } from "telegraf/typings/core/types/typegram";
import { Session } from "./types";


export const newSession = (from: User | undefined): Session => {
    if (!from) {
        Logger.error("`from` is undefinded", from)
        throw Error("From is `undefined`")
    }
    return {
        telegramId: from.id,
        username: from.username,
        firstname: from.first_name,
        messages: [],
    }
}
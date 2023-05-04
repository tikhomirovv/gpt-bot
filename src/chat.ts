import Logger from "js-logger"
import { openai } from "./openai"
import { BotContext, ChatMessage, ChatRole } from "./types"
import { Message } from "telegraf/typings/core/types/typegram"

export const chatMessage = async (ctx: BotContext, text: string): Promise<string> => {
    try {
        ctx.session.messages.push({ content: text, role: ChatRole.User })
        const response = await openai.chat(ctx.session.messages)

        if (!response) {
            Logger.error("Chat message response error", response)
            return "Прости, мой интеллект недоступен 😞"
        }
        ctx.session.messages.push({ content: response.content, role: ChatRole.Assistant })
        return response.content
    } catch (e) {
        Logger.log(`Chat message error`, e)
        throw new Error("Chat message error")
    }
}
import Logger from "js-logger"
import { openai } from "./openai"
import { ChatRole, UserSession } from "./types"

export const chatMessage = async (session: UserSession, text: string): Promise<string> => {
    try {
        session.messages.push({ content: text, role: ChatRole.User })
        const response = await openai.chat(session, session.messages)
        if (!response) {
            Logger.error("Chat message response error", response)
            return "Прости, мне больше недоступен мой интеллект 😞"
        }
        session.messages.push({ content: response.content, role: ChatRole.Assistant })
        Logger.debug(`Chat messages`, session.messages)
        return response.content
    } catch (e) {
        Logger.error(`Chat message error`, e)
        throw new Error("Chat message error")
    }
}
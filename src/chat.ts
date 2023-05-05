import Logger from "js-logger"
import { openai } from "./openai"
import { ChatMessage, ChatRole, UserSession } from "./types"

const HISTORY_LIMIT = 20;

// chatMessage adds a message to the history, sends a message to the GPT chat, the response from it is also saved to the history
export const chatMessage = async (session: UserSession, text: string): Promise<string> => {
    session.messages.push({ content: text, role: ChatRole.User })
    session.messages = normalizeHistory(session.messages)
    const history = [
        ...session.systemMessages.role,
        ...session.systemMessages.character,
        { content: "Отвечай на том языке, на котором я тебе пишу", role: ChatRole.System },
        ...session.messages
    ]

    const response = await openai.chat(session, history)
    if (!response) {
        throw new Error("GPT response error", response)
    }
    const reply = response.content
    session.messages.push({ content: reply, role: ChatRole.Assistant })
    Logger.debug(`Chat messages`, [...session.systemMessages.role, ...session.systemMessages.character, ...session.messages])
    return reply
}

// normalizeHistory keeps history within established limits
// TODO: this is a temporary simple solution, you should deal with tokens
const normalizeHistory = (messages: ChatMessage[]): ChatMessage[] => {
    if (messages.length > HISTORY_LIMIT) {
        return messages.slice(messages.length - HISTORY_LIMIT)
    }
    return messages
}
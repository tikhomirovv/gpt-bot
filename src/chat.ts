import { add as addMessageToHistory, getGPTMessages } from "./history"
import { openai } from "./openai"
import { UserSession } from "./types/app"
import { ChatRole } from "./types/chat"
import userRepository from "./db/repository/user"
import Logger from "js-logger"

// chatMessage adds a message to the history, sends a message to the GPT chat, the response from it is also saved to the history
export const chatMessage = async (
  session: UserSession,
  text: string,
): Promise<string> => {
  let { history } = addMessageToHistory(session.history, {
    content: text,
    role: ChatRole.User,
    tokens: 0,
  })
  session.history = history
  const completion = await openai.chat(
    session.userId,
    getGPTMessages(session.history),
  )
  if (!completion) {
    throw new Error("GPT response error", completion)
  }
  const usage = completion.data.usage
  const replyMessage = completion.data.choices[0].message

  if (!replyMessage) {
    throw new Error("[GPT] empty message")
  }
  const replyText = replyMessage.content
  const result = addMessageToHistory(
    session.history,
    {
      content: replyText,
      role: ChatRole.Assistant,
      tokens: usage?.completion_tokens,
    },
    usage?.total_tokens,
  )
  session.history = result.history
  Logger.debug("[Chat] UseTokens", { userId: session.userId, usage: result.usage })
  await userRepository.useTokens(session.telegramId, result.usage)
  return replyText
}

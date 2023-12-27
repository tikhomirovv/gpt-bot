import { add as addMessageToHistory, getGPTMessages } from "./history"
import { openai } from "./openai"
import { UserSession } from "./types/app"
import { ChatRole, GPTMessage } from "./types/chat"
import userRepository from "./db/repository/user"
import Logger from "js-logger"

// chatMessage adds a message to the history, sends a message to the GPT chat, the response from it is also saved to the history
export const chatMessage = async (
  session: UserSession,
  text: string,
): Promise<string> => {
  session.history = addMessageToHistory(session.history, {
    content: text,
    role: ChatRole.User,
    tokens: 0,
  }).history

  let chatMessages: GPTMessage[] = getGPTMessages(session.history)
  if (session.character) {
    // Цhen using the character, the total tokens in fact will be greater than in history.
    // This is not so bad, it’s just that the story will be able to accommodate a little less messages,
    // but there will be no problem with limits
    chatMessages = [
      {
        role: ChatRole.System,
        content: session.character,
      },
      ...chatMessages,
    ]
  }

  const completion = await openai.chat(session.userId, chatMessages)
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
  Logger.debug("[Chat] UseTokens", {
    userId: session.userId,
    usage: result.usage,
  })
  await userRepository.useTokens(session.telegramId, result.usage)
  return replyText
}

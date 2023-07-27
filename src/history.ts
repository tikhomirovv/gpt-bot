import Logger from "js-logger"
import { ChatMessage, GPTMessage, History } from "./types/chat"
import userRepository from "./db/repository/user"

// history must be no more than this number of tokens
const TOKENS_THRESHOLD = 3072

const sumTokens = (messages: ChatMessage[]): number => {
  return messages.reduce((sum, m) => sum + (m.tokens || 0), 0)
}

export const add = (
  history: History,
  message: ChatMessage,
  totalTokens: number = 0,
): { history: History; usage: number } => {
  // add message to history
  history.messages.push(message)
  if (totalTokens <= 0) {
    return { history, usage: 0 }
  }

  // recalculate and save tokens statistics
  history.tokens = sumTokens(history.messages)
  const tokensDifference = totalTokens - history.tokens
  const zeroTokensMessages = history.messages.filter((m) => !m.tokens)
  zeroTokensMessages.forEach((m, i) => {
    m.tokens = tokensDifference / zeroTokensMessages.length
    if (i === 0) {
      m.tokens += tokensDifference % zeroTokensMessages.length
    }
  })
  history.tokens = sumTokens(history.messages)

  if (history.tokens !== totalTokens) {
    Logger.warn("[History] Incorrect calculation of tokens", {
      tokens: history.tokens,
      totalTokens,
      messages: history.messages,
    })
  }

  while (history.tokens > TOKENS_THRESHOLD) {
    const removedMessage = history.messages.shift()
    Logger.debug("[History] Message removed from history", removedMessage)
    history.tokens = sumTokens(history.messages)
  }

  return { history, usage: tokensDifference + (message.tokens || 0) }
}

export const getGPTMessages = (history: History): GPTMessage[] => {
  return history.messages.map(({ content, role }) => ({ content, role }))
}

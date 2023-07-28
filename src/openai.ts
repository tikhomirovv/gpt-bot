import Logger from "js-logger"
import { env } from "./env"
import { Configuration, OpenAIApi } from "openai"
import { createReadStream } from "fs"
import config from "config"
import { GPTMessage, GPTParameters } from "./types/chat"

const TRANSCRIPTION_MODEL = "whisper-1"

class OpenAI {
  openai: OpenAIApi
  params: GPTParameters

  constructor(apiKey: string, params: GPTParameters) {
    const configuration = new Configuration({
      apiKey,
    })
    this.openai = new OpenAIApi(configuration)
    this.params = params
  }

  async chat(user: string, messages: GPTMessage[]) {
    try {
      return await this.openai.createChatCompletion({
        user,
        messages,
        ...this.params,
      })
    } catch (e: any) {
      Logger.error(`[GPT] Error while chat completion`, e)
    }
  }

  async transcription(filename: string): Promise<string> {
    try {
      const response = await this.openai.createTranscription(
        // @ts-ignore
        createReadStream(filename),
        TRANSCRIPTION_MODEL,
      )
      return response.data.text
    } catch (e: any) {
      Logger.error(`[GPT] Error while transcription`, e)
      throw new Error(`[GPT] Error while transcription`)
    }
  }
}

const defaultParams: GPTParameters = {
  model: "gpt-3.5-turbo",
  temperature: 0.1,
}
const params = config.has("gpt_params") ? config.get("gpt_params") || {} : {}
export const openai = new OpenAI(env.OPENAI_KEY, {
  ...defaultParams,
  ...params,
} as GPTParameters)

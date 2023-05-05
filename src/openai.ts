import Logger from "js-logger";
import { env } from "./env";
import { Configuration, OpenAIApi } from 'openai'
import { createReadStream } from "fs";
import { ChatMessage, GptParameters, UserSession } from "./types";
import config from 'config'

const TRANSCRIPTION_MODEL = 'whisper-1'

class OpenAI {
    openai: OpenAIApi;
    params: GptParameters

    constructor(apiKey: string, params: GptParameters) {
        const configuration = new Configuration({
            apiKey,
        })
        this.openai = new OpenAIApi(configuration)
        this.params = params
    }

    async chat(session: UserSession, messages: ChatMessage[]) {
        Logger.debug("[GPT] Request params", params)
        try {
            const completion = await this.openai.createChatCompletion({
                user: session.userId,
                messages,
                ...this.params
            })
            Logger.debug('[GPT] Usage', completion.data.usage)
            return completion.data.choices[0].message
        } catch (e: any) {
            Logger.error(`[GPT] Error while chat completion`, e)
        }
    }

    async transcription(filename: string): Promise<string> {
        try {
            const response = await this.openai.createTranscription(
                // @ts-ignore
                createReadStream(filename),
                TRANSCRIPTION_MODEL
            )
            return response.data.text
        } catch (e: any) {
            Logger.error(`[GPT] Error while transcription`, e)
            throw new Error(`[GPT] Error while transcription`)
        }
    }
}


const defaultParams: GptParameters = {
    model: "gpt-3.5-turbo",
    temperature: 0.1
}
const params = config.has("gpt_params") ? config.get("gpt_params") || {} : {}
export const openai = new OpenAI(env.OPENAI_KEY, { ...defaultParams, ...params } as GptParameters)
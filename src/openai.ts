import Logger from "js-logger";
import { env } from "./env";
import { Configuration, OpenAIApi } from 'openai'
import { createReadStream } from "fs";
import { ChatMessage, UserSession } from "./types";

const CHAT_GPT_MODEL = 'gpt-3.5-turbo'
const TRANSCRIPTION_MODEL = 'whisper-1'

class OpenAI {
    openai: OpenAIApi;

    constructor(apiKey: string) {
        const configuration = new Configuration({
            apiKey,
        })
        this.openai = new OpenAIApi(configuration)
    }

    async chat(session: UserSession, messages: ChatMessage[]) {
        try {
            const completion = await this.openai.createChatCompletion({
                model: CHAT_GPT_MODEL,
                messages,
                user: session.userId,
            })
            Logger.debug('Usage', completion.data.usage)
            return completion.data.choices[0].message
        } catch (e: any) {
            Logger.error(`Error while chat completion`, e)
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
            Logger.error(`Error while transcription`, e)
            throw new Error(`Error while transcription`)
        }
    }
}

export const openai = new OpenAI(env.OPENAI_KEY)
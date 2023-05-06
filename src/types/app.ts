import { Context } from 'telegraf';
import { ChatMessage, SystemMessages } from './chat';

export enum Environment {
    Production = 'production',
    Development = 'development'
}
export interface BotContext extends Context {
    session: Session
}

export interface Session {
    [id: number]: UserSession
}

export interface UserSession {
    userId: string
    telegramId: number
    username: string | undefined
    firstname: string
    messages: ChatMessage[]
    systemMessages: SystemMessages
}
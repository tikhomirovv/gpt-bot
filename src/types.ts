import { Context } from 'telegraf';

export enum Environment {
    Production = 'production',
    Development = 'development'
}

export interface Session {
    [id: number]: UserSession
}

export interface BotContext extends Context {
    session: Session
}

export interface UserSession {
    userId: string
    telegramId: number
    username: string | undefined
    firstname: string
    messages: ChatMessage[]
    systemMessages: SystemMessages
}

export interface SystemMessages {
    role: ChatMessage[]
    character: ChatMessage[]
}

export enum ChatRole {
    User = 'user',
    System = 'system',
    Assistant = 'assistant'
}

export type ChatMessage = {
    content: string;
    role: ChatRole;
}
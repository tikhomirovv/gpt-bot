import { Context } from 'telegraf';
import { History } from './chat';

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
    history: History
}
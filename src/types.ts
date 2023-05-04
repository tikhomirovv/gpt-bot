import { Context } from 'telegraf';
import { Message } from 'telegraf/typings/core/types/typegram';

export interface BotContext extends Context {
    session: Session
}

export interface Session {
    telegramId: number
    username: string | undefined
    firstname: string
    messages: ChatMessage[]
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
export type GptParameters = {
    model: string
    temperature?: number
    presence_penalty?: number
    top_p?: number
}

export enum ChatRole {
    User = 'user',
    System = 'system',
    Assistant = 'assistant'
}

export interface SystemMessages {
    character: ChatMessage[]
}

export type ChatMessage = {
    content: string
    role: ChatRole
}
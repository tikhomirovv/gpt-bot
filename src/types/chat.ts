export type GPTParameters = {
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

export type History = {
    messages: ChatMessage[]
    tokens: number
}

export type ChatMessage = {
    content: string
    role: ChatRole
    tokens?: number
}

export type GPTMessage = {
    content: string
    role: ChatRole
}
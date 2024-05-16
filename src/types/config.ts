export interface GptParams {
    model: string;
    temperature: number;
    presence_penalty: number;
    top_p: number;
}

export interface Messages {
    [name: string]: Messages | string[] | string;
}

export interface Link {
    title: string;
    url: string;
}

export interface Character {
    title: string
    prompt: string
}

export interface Config {
    whitelist: (string | number)[] | null
    gpt_params: GptParams
    tokens_threshold: number;
    links: Link[]
    characters: Character[]
    messages: Messages
}
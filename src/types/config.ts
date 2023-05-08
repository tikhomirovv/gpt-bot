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
    prompt: string | string[] 
}

export interface Config {
    gpt_params: GptParams
    links: Link[]
    characters: Character[]
    messages: Messages
}
import config from 'config'
import { Character } from './types/config'

// getCharacterSystemMessages returns system messages for a character
export const getCharacterSystemMessages = async (idx: number): Promise<string[]> => {
    const characters: Character[] = config.get("characters")
    const character = characters[idx]
    if (character) {
        const messages = character.prompt 
        if (typeof messages === "string") {
            return [messages];
          }
        return messages
    }
    throw new Error(`No character \`${character}\``)
}
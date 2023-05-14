import config from 'config'
import { Character } from './types/config'

// getCharacterMessage returns system messages for a character
export const getCharacterMessage = async (idx: number): Promise<string> => {
    const characters: Character[] = config.get("characters")
    const character = characters[idx]
    if (character) {
        return character.prompt
    }
    throw new Error(`No character \`${character}\``)
}
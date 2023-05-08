import config from 'config'
import { Character } from './types/config'

// getCharacterSystemMessages returns system messages for a character
export const getCharacterSystemMessage = async (idx: number): Promise<string> => {
    const characters: Character[] = config.get("characters")
    const character = characters[idx]
    if (character) {
        return character.prompt
    }
    throw new Error(`No character \`${character}\``)
}
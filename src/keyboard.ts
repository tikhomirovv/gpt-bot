import { Markup } from "telegraf";
import config from 'config'
import { Character, Contact } from "./types/config";

// List of characters from config
const characters: Character[] = config.get('characters')
export const characterKeyboard = Markup.inlineKeyboard(
    characters.map((c, i) => Markup.button.callback(c.title, "character:" + i))
, { columns: 2 });

// List of contacts from config
const contacts: Contact[] = config.get('contacts')
const helpButtons = contacts.map(c => Markup.button.url(c.title, c.url))
export const helpKeyboard = Markup.inlineKeyboard(helpButtons, { columns: 2 });

// Cleanup
export const removeKeyboard = Markup.removeKeyboard()
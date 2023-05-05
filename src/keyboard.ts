import { Markup } from "telegraf";
import config from 'config'
import { CharacterAction, RoleAction, SettingsAction } from "./settings";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";

export const settingsKeyboard = Markup.inlineKeyboard([
    Markup.button.callback('Роль', SettingsAction.SelectRole),
    Markup.button.callback('Характер', SettingsAction.SelectCharacter),
]);

export const roleKeyboard = Markup.inlineKeyboard([
    Markup.button.callback('🧠 Нейтральный', RoleAction.Neural),
    Markup.button.callback('🧙‍♂️ Мудрец ', RoleAction.Sage),
    Markup.button.callback('🤔 Философ', RoleAction.Philosopher),
    Markup.button.callback('💭 Психолог', RoleAction.Psychologist),
    Markup.button.callback('👔 Бизнес-коуч', RoleAction.BusinessCoach),
    Markup.button.callback('💻 Программист', RoleAction.ItCoach),
    Markup.button.callback('🎵 Музыкант', RoleAction.Musician),
    Markup.button.callback('🎨 Дизайнер', RoleAction.Designer),
], { columns: 2 });

export const characterKeyboard = Markup.inlineKeyboard([
    Markup.button.callback('🎨 Креативный', CharacterAction.Creative),
    Markup.button.callback('✨ Светлый', CharacterAction.Luminous),
    Markup.button.callback('😎 Дерзкий', CharacterAction.Daring),
    Markup.button.callback('🤡 Шутник', CharacterAction.Jester),
    Markup.button.callback('💙 Эмпатичный', CharacterAction.Empathetic),
    Markup.button.callback('👑 Властный', CharacterAction.Bossy),
], { columns: 2 });

export const removeKeyboard = Markup.removeKeyboard()

const site: string | null = config.get('url.site')
const repository: string | null = config.get('url.repository')
const helpButtons = [
    site ? Markup.button.url('🌐 Сайт', site) : null,
    repository ? Markup.button.url('⭐ GitHub', repository) : null,
].filter(i => !!i) as (InlineKeyboardButton.CallbackButton | InlineKeyboardButton.UrlButton)[];

export const helpKeyboard = Markup.inlineKeyboard(helpButtons, { columns: 2 });
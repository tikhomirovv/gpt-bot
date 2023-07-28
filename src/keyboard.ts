import { Markup } from "telegraf"
import config from "config"
import { Character, Link } from "./types/config"
import messages from "./messages"

// List of characters from config
const characters: Character[] = config.get("characters")
export const characterKeyboard = Markup.inlineKeyboard(
  characters.map((c, i) => Markup.button.callback(c.title, "character:" + i)),
  { columns: 2 },
)

// List of links from config
const links: Link[] = config.get("links")
const helpButtons = links.map((c) => Markup.button.url(c.title, c.url))
export const helpKeyboard = Markup.inlineKeyboard(helpButtons, { columns: 2 })

// Cleanup
export const removeKeyboard = Markup.removeKeyboard()

// Terms
const agree: string = messages.m("terms.agree")
const notAgree: string = messages.m("terms.notAgree")
const prev: string = messages.m("terms.prev")
const next: string = messages.m("terms.next")
export const termsKeyboard = (current: number, total: number, isAgreed: boolean) => {
  let buttons: any[] = []
  if (current > 1) {
    buttons.push(Markup.button.callback(prev, "terms:" + (current - 1)))
  }
  if (current < total) {
    buttons.push(Markup.button.callback(next, "terms:" + (current + 1)))
  }
  if (current === total) {
    buttons.push(Markup.button.callback(isAgreed ? notAgree : agree, "terms-ok:" + (isAgreed ? 0 : 1)))
  }
  return Markup.inlineKeyboard(buttons, { columns: current === total ? 1 : 2 })
}

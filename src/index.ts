import { env } from "./env"
import { Telegraf, session } from "telegraf"
import { message } from "telegraf/filters"
import Logger from "js-logger"
import { BotContext, Environment } from "./types/app"
import {
  character,
  characterCallback,
  hearsText,
  hearsVoice,
  balance,
  help,
  reset,
  start,
  terms,
  termsOk
} from "./actions"
import { defaultSession } from "./session"
import { checkConfig, checkSession, checkUser } from "./middleware"

// Log messages will be written to the window's console.
Logger.useDefaults()
const LoggerLevel =
  env.ENV === Environment.Production ? Logger.WARN : Logger.DEBUG
Logger.info("Logger init", LoggerLevel)
Logger.setLevel(LoggerLevel)

const bot = new Telegraf<BotContext>(env.TELEGRAM_TOKEN)
bot.use(session({ defaultSession }), checkConfig, checkSession)

// Commands and listening
bot.start(start)
bot.help(help)
bot.command("balance", balance)
bot.command("reset", reset)
bot.command("character", character)

bot.command("terms", terms)
bot.action(/^terms:(\d+)$/, terms)
bot.action(/^terms-ok:([0|1])$/, termsOk)

// Дальше можно только с положительным балансом
bot.use(checkUser)
bot.on(message("voice"), hearsVoice)
bot.on(message("text"), hearsText)

// Callbacks
bot.action(/^character:(\d+)$/, characterCallback)

bot.launch()

process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))
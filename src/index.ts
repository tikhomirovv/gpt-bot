import { env } from './env'
import {  Telegraf, session } from 'telegraf';
import { message } from 'telegraf/filters';
import Logger from "js-logger";
import { BotContext, Environment } from './types';
import { checkSession, hearsText, hearsVoice, help, start } from './actions';

// Log messages will be written to the window's console.
Logger.useDefaults();
const LoggerLevel = env.ENV === Environment.Production ? Logger.WARN : Logger.DEBUG
Logger.info("Logger level", LoggerLevel)
Logger.setLevel(LoggerLevel)

const bot = new Telegraf<BotContext>(env.TELEGRAM_TOKEN)
bot.use(session(), checkSession)

bot.start(start);
bot.help(help);
bot.on(message('voice'), hearsVoice)
bot.on(message('text'), hearsText)


bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
import { env } from './env'
import { Telegraf, session } from 'telegraf';
import { callbackQuery, message } from 'telegraf/filters';
import Logger from "js-logger";
import { BotContext, Environment } from './types';
import { characterCallback, hearsText, hearsVoice, help, reset, roleCallback, settings, settingsCallback, start } from './actions';
import { defaultSession } from './session';
import { checkSession } from './middleware';

// Log messages will be written to the window's console.
Logger.useDefaults();
const LoggerLevel = env.ENV === Environment.Production ? Logger.WARN : Logger.DEBUG
Logger.info("Logger level", LoggerLevel)
Logger.setLevel(LoggerLevel)

const bot = new Telegraf<BotContext>(env.TELEGRAM_TOKEN)
bot.use(session({ defaultSession }), checkSession)

// Commands and listening
bot.start(start);
bot.help(help);
bot.command('reset', reset)
bot.command('settings', settings)
bot.on(message('voice'), hearsVoice)
bot.on(message('text'), hearsText)

// Callbacks
bot.action(/^settings:(\w+)$/, settingsCallback)
bot.action([/^role:(\w+)$/], roleCallback)
bot.action([/^character:(\w+)$/], characterCallback)

bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
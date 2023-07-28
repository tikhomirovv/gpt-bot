import { Command } from "commander"
import userRepository from "./db/repository/user"
import Logger from "js-logger"
import { Environment } from "./types/app"
import { env } from "./env"
import { connection } from "./db/db"

import { Telegraf } from "telegraf"
import { BotContext } from "./types/app"

Logger.useDefaults()
const LoggerLevel =
  env.ENV === Environment.Production ? Logger.WARN : Logger.DEBUG
Logger.info("Logger init", LoggerLevel)
Logger.setLevel(LoggerLevel)

const VERSION = "1.0.0"

async function main() {
  const program = new Command()
  program.name("gpt-bot").version(VERSION)

  program
    .command("tokens-add")
    .description("Add tokens to user balance")
    .requiredOption("-tid, --telegramId <number>", "Telegram chat ID")
    .requiredOption("-q, --quantity <number>", "Number of tokens to add")
    .option("-m, --message", "Send message to user or not")
    .action(async (options) => {
      const bot = new Telegraf<BotContext>(env.TELEGRAM_TOKEN)
      Logger.debug("[CLI] Options", options)
      const user = await userRepository.getByTelegramId(options.telegramId)
      if (!user) {
        Logger.error("[CLI] User not found", { telegramId: options.telegramId })
        return
      }
      user.tokens.balance += parseInt(options.quantity)
      await userRepository.save(user)
      if (options.message) {
        bot.telegram.sendMessage(
          options.telegramId,
          `Пополнение токенов: *\\+${options.quantity}*\nВсего токенов доступно: *${user.tokens.balance}*`,
          { parse_mode: "MarkdownV2" },
        )
      }
      Logger.debug("[CLI] Tokens added", { options, tokens: user.tokens })
    })

  await program.parseAsync(process.argv)
  connection?.close()
}

main()

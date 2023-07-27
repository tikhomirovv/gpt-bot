import { Command } from "commander"
import userRepository from "./db/repository/user"
import Logger from "js-logger"
import { Environment } from "./types/app"
import { env } from "./env"
import { connection } from "./db/db"

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
    .action(async (options) => {
      Logger.debug("[CLI] Options", options)
      const user = await userRepository.getByTelegramId(options.telegramId)
      if (!user) {
        Logger.error("[CLI] User not found", { telegramId: options.telegramId })
        return
      }
      user.tokens.balance += parseInt(options.quantity)
      await userRepository.save(user)
    })

  await program.parseAsync(process.argv)
  connection?.close()
}

main()
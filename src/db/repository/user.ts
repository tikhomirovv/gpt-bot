import User, { IUser } from "../models/user"
import Logger from "js-logger"
import { connection } from "../db"
import { generateUserId } from "../../utils"

export default {
  async create(telegramId: number): Promise<IUser | null> {
    if (!connection.isConnected) {
      return null
    }
    const model = new User({
      _id: generateUserId(telegramId),
      telegramId: telegramId,
    })
    return await model.save()
  },
  async getByTelegramId(telegramId: number): Promise<IUser | null> {
    if (!connection.isConnected) {
      return null
    }
    return await User.findOne({ telegramId: telegramId })
  },
  async firstOrCreate(telegramId: number): Promise<IUser | null> {
    if (!connection.isConnected) {
      return null
    }

    let user = await this.getByTelegramId(telegramId)
    if (!user) {
      user = await this.create(telegramId)
    }
    return user
  },
  async useTokens(telegramId: number, tokens: number) {
    if (!connection.isConnected) {
      return
    }
    const user = await User.findOne({ telegramId: telegramId })
    if (user) {
      user.tokens.balance = user.tokens.balance - tokens
      user.tokens.used = user.tokens.used + tokens
      await user.save()
    } else {
      Logger.error("[UserRepository] UseTokens: user not found", { telegramId })
    }
  },
}

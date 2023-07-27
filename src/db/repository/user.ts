import { UserSession } from "@/types/app"
import User, { IUser } from "../models/user"
import md5 from "crypto-js/md5"
import Logger from "js-logger"

export default {
  async create(telegramId: number): Promise<IUser> {
    const model = new User({
      _id: md5(telegramId.toString()).toString(),
      telegramId: telegramId,
    })
    return await model.save()
  },
  async getByTelegramId(telegramId: number): Promise<IUser | null> {
    return await User.findOne({ telegramId: telegramId })
  },
  async firstOrCreate(telegramId: number): Promise<IUser> {
    let user = await this.getByTelegramId(telegramId)
    if (!user) {
      user = await this.create(telegramId)
    }
    return user
  },
  async useTokens(telegramId: number, tokens: number) {
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

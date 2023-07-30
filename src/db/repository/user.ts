import User, { IUser } from "../models/user"
import Logger from "js-logger"
import { isConnected as dbIsConnected } from "../db"
import { generateUserId } from "../../utils"
import config from "config"

const initBalance: number = config.get("init_balance")
type CreateUserInput = Partial<IUser> & { telegramId: number }

export default {
  async create(user: CreateUserInput): Promise<IUser | null> {
    if (!User) return null
    user._id = generateUserId(user.telegramId)
    const model = new User({
      ...user,
      tokens: {
        balance: initBalance,
      },
    })
    return await model.save()
  },
  async getByTelegramId(telegramId: number): Promise<IUser | null> {
    if (!User) {
      return null
    }
    return await User.findOne({ telegramId })
  },
  async firstOrCreate(telegramId: number, name: string): Promise<IUser | null> {
    let user = await this.getByTelegramId(telegramId)
    if (!user) {
      user = await this.create({ telegramId, name })
    }
    return user
  },
  async save(user: IUser): Promise<IUser | null> {
    if (!User) return null
    const model = new User(user)
    return await model.save()
  },
  async useTokens(telegramId: number, tokens: number) {
    if (!dbIsConnected()) return
    const user = await this.getByTelegramId(telegramId)
    if (user) {
      user.tokens.balance -= tokens
      user.tokens.used += tokens
      await this.save(user)
    } else {
      Logger.error("[UserRepository] UseTokens: user not found", { telegramId })
    }
  },
  async getTermsIsAgreed(telegramId: number): Promise<boolean> {
    if (!dbIsConnected()) return false
    const user = await this.getByTelegramId(telegramId)
    if (!user) return false
    return user.termsIsAgreed
  },
  async setTermsIsAgreed(telegramId: number, isAgreed: boolean): Promise<void> {
    if (!dbIsConnected()) return
    const user = await this.getByTelegramId(telegramId)
    if (user) {
      user.termsIsAgreed = isAgreed
      await this.save(user)
    } else {
      Logger.error("[UserRepository] setIsAgreed: user not found", {
        telegramId,
        isAgreed,
      })
    }
  },
}

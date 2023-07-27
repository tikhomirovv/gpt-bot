import Logger from "js-logger"
import { env } from "../env" // TODO: починить `@` alias
import mongoose, { Connection } from "mongoose"

const MONGO_URL = `mongodb://${env.MONGO_USERNAME}:${env.MONGO_PASSWORD}@${env.MONGO_HOST_PORT}`
const connect = (): boolean => {
  if (!env.MONGO_HOST_PORT) {
    return false
  }
  try {
    mongoose.connect(MONGO_URL, {
      dbName: "gpt",
      readPreference: "primary",
      ssl: false,
      directConnection: true,
    })
    Logger.debug("[Database] Connected")
    return true
  } catch (error) {
    Logger.error("[Datebase] Connection error", { error })
  }
  return false
}

const isConnected = connect()

export const connection: { isConnected: boolean } = {
  isConnected,
}

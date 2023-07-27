import { env } from "../env" // TODO: починить `@` alias
import Logger from "js-logger"
import mongoose from "mongoose"

const MONGO_URL = `mongodb://${env.MONGO_USERNAME}:${env.MONGO_PASSWORD}@${env.MONGO_HOST_PORT}`

export const connect = () => {
  mongoose
    .connect(MONGO_URL, {
      dbName: 'gpt',
      readPreference: "primary",
      ssl: false,
      directConnection: true,
    })
    .then(() => {
      Logger.debug("[Database] Connected")
    })
    .catch((error) => {
      Logger.error("[Datebase] Connection error", { error })
    })
}

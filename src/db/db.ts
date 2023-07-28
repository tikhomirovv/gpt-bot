import { env } from "../env" // TODO: починить `@` alias
import mongoose, { Connection } from "mongoose"

const MONGO_URL = `mongodb://${env.MONGO_USERNAME}:${env.MONGO_PASSWORD}@${env.MONGO_HOST_PORT}`
const connect = (): Connection | null => {
  if (!env.MONGO_HOST_PORT) {
    return null
  }
  return mongoose.createConnection(MONGO_URL, {
    dbName: "gpt",
    readPreference: "primary",
    ssl: false,
    directConnection: true,
  })
}

export const connection = connect()
export const isConnected = () => {
    return connection?.readyState === 1
}
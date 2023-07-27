import mongoose, { Document, Schema } from "mongoose"
import { connection } from "../db"

export interface IUser {
  _id: string
  telegramId: number
  name: string
  tokens: {
    balance: number
    used: number
  }
}

const UserSchema: Schema = new Schema<IUser>(
  {
    _id: { type: String, required: true },
    telegramId: { type: Number, required: true },
    tokens: {
      balance: { type: Number, required: true, default: 0 },
      used: { type: Number, required: true, default: 0 },
    },
  },
  { versionKey: false },
)

const COLLECTION = "users"
const UserModel = connection
  ? connection.model<IUser>("User", UserSchema, COLLECTION)
  : null

export default UserModel

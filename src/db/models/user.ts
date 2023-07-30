import mongoose, { Document, Schema } from "mongoose"
import { connection } from "../db"

export interface IUser {
  _id: string
  telegramId: number
  name?: string
  tokens: {
    balance: number
    used: number
  }
  termsIsAgreed: boolean
}

const UserSchema: Schema = new Schema<IUser>(
  {
    _id: { type: String, required: true },
    telegramId: { type: Number, required: true },
    name: { type: String },
    tokens: {
      balance: { type: Number, required: true, default: 0 },
      used: { type: Number, required: true, default: 0 },
    },
    termsIsAgreed: { type: Boolean, default: false },
  },
  { versionKey: false },
)

const COLLECTION = "users"
const UserModel = connection
  ? connection.model<IUser>("User", UserSchema, COLLECTION)
  : null

export default UserModel

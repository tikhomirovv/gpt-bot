import mongoose, { Document, Schema } from "mongoose"

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
export default mongoose.model<IUser>("User", UserSchema, COLLECTION)

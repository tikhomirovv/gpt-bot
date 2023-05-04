import dotenv from 'dotenv';
dotenv.config();

interface Env {
  TELEGRAM_TOKEN: string
  OPENAI_KEY: string
}

export const env: Env = {
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN!,
  OPENAI_KEY: process.env.OPENAI_KEY!
};
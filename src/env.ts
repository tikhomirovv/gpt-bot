import dotenv from 'dotenv';
import path from 'path';
import { Environment } from './types/app';
import fs from 'fs';

const local = path.resolve(process.cwd(), ".env.local")
if (fs.existsSync(local)) {
  dotenv.config({ path: local });
} else {
  dotenv.config();
}

interface Env {
  TELEGRAM_TOKEN: string
  OPENAI_KEY: string
  ENV: Environment
}

export const env: Env = {
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN!,
  OPENAI_KEY: process.env.OPENAI_KEY!,
  ENV: process.env.NODE_ENV as Environment || Environment.Production
};
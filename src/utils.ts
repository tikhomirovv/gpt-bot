import md5 from "crypto-js/md5"

export const getRandomFromArray = <T>(array: T[]): T  => {
    const i = Math.floor(Math.random() * array.length);
    return array[i];
}

export const generateUserId = (telegramId: number): string => {
    return md5(telegramId.toString()).toString()
}
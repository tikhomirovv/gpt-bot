import config from 'config'
import { getRandomFromArray } from './utils'

const replaceParams = (message: string, params: any) => {
    if (!params) {
        return message;
    }
    return message.replace(/{{(\w+)}}/g, (match: string, varname: string) => {
        return params[varname] || match;
    });
}

export default {
    m(key: string, params: any = {}): string {
        const configKey = 'messages.' + key
        if (config.has(configKey)) {
            let message: string | string[] = config.get(configKey)
            if (Array.isArray(message)) {
                message = getRandomFromArray(message)
            }
            return replaceParams(message, params)
        } else {
            throw new Error(`No message \`${configKey}\` in config`)
        }
    },
}
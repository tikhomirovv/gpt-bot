import { createWriteStream } from 'fs'
import path, { relative, resolve } from 'path'
import { unlink } from 'fs/promises'
import axios from 'axios'
import ffmpeg, { setFfmpegPath } from 'fluent-ffmpeg'
import installer from '@ffmpeg-installer/ffmpeg'
import Logger from 'js-logger'

const VOICES_FILES_DIR = resolve(relative(process.cwd(), __filename), '../../voices')

export const download = async (url: string, filename: string): Promise<string> => {
    try {
        const oggPath = resolve(VOICES_FILES_DIR, `${filename}.ogg`)
        const response = await axios({
            method: 'get',
            url,
            responseType: 'stream',
        })
        return new Promise((resolve) => {
            const stream = createWriteStream(oggPath)
            response.data.pipe(stream)
            stream.on('finish', () => resolve(oggPath))
        })
    } catch (err) {
        Logger.error('Error while creating ogg file...', err)
        throw new Error('Error while creating ogg file...')
    }
}

export const convert = async (filename: string): Promise<string> => {
    ffmpeg.setFfmpegPath(installer.path)

    const basename = path.basename(filename, path.extname(filename));
    const output = path.join(path.dirname(filename), basename + '.mp3');

    return new Promise((resolve, reject) => {
        ffmpeg(filename)
            .toFormat('mp3')
            .inputOptions('-t 30')
            .on('end', () => {
                Logger.debug(`Successfully converted ${filename} to ${output}`);
                resolve(output)
            })
            .on('error', (err: any) => {
                Logger.error(`Error converting ${filename}: ${err.message}`);
                reject()
            })
            .save(output);
    })
}

export const remove = async (filename: string) => {
    try {
        await unlink(filename)
    } catch (err: any) {
        Logger.error(`Error while unlinking file: `, err)
    }
}
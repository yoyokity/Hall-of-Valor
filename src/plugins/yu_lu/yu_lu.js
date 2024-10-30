import fs from 'fs'

import { Plugin, Message } from '../../../onebot-lib/index.js'
import { createImg } from './img.js'

export class YuLu extends Plugin {
    name = '语录'
    description

    async run (bot, message) {


        if (!message.isGroup) return

        console.log(message)

        //收录
        if (message.replyId && bot.checkCommand(message, '收录')) {
            //获取消息
            let replyMessage = await bot.Api.getMessage(message.replyId)

            //解析消息并储存
            let qqId = replyMessage.senderId
            let yulu = replyMessage.message.filter((value, index, array) => {
                return ['text', 'at', 'face'].includes(value.type)
            })

            let jsonPath = `./data/${message.groupId}.json`
            writeJson(jsonPath, { qqId, yulu })

            bot.Api.sendMessage('收录成功', message.groupId)
            return
        }

        //发送语录
        if (bot.checkCommand(message, '语录')) {
            let data = readJson(`./data/${message.groupId}.json`)
            if (!data) {
                bot.Api.sendMessage('未收录任何语录', message.groupId)
                return
            }

            let yulu = data.yulu
            let qqId = data.qqId
            let headImg = await bot.Api.getHeadImage(qqId)
            let nickName = (await bot.Api.getGroupMemberInfo(message.groupId, qqId)).nickname


            return
        }
    }
}

/**
 *
 * @param {string} filePath
 * @return {any}
 */
function readJson (filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8')
        return JSON.parse(data)
    } catch (error) {
        console.error('Error reading JSON file:', error)
        return null
    }
}

/**
 *
 * @param {string} filePath
 * @param {Object} data
 */
function writeJson (filePath, data) {
    try {
        const jsonData = JSON.stringify(data, null, 2)
        fs.writeFileSync(filePath, jsonData, 'utf8')
        console.log('JSON file has been saved successfully.')
    } catch (error) {
        console.error('Error writing JSON file:', error)
    }
}
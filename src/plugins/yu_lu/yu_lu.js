import fs from 'fs'

import { Plugin, Message } from '../../../onebot-lib/index.js'
import { createImg } from './img.js'
import log from '../../../onebot-lib/log.js'
import { Helper } from '../../../yo-lib/Helper/helper.js'
import { Structs } from 'node-napcat-ts'

export class YuLu extends Plugin {
    name = '语录'
    description

    async run (bot, message) {
        if (!message.isGroup) return

        //收录
        if (message.replyId && bot.checkCommand(message, '收录')) {
            //获取消息
            let replyMessage = await bot.Api.getMessage(message.replyId)

            //解析消息并储存
            let qqId = replyMessage.senderId
            let yulu = replyMessage.message.filter((value, index, array) => {
                return ['text', 'at'].includes(value.type)
            })

            let jsonPath = `${this.pluginDataPath}/${message.groupId}.json`
            /** @type {{}[]} */
            let data = readJson(`${this.pluginDataPath}/${message.groupId}.json`)
            if (!data) {
                data = []
            } else {
                for (let datum of data) {
                    if (datum.replyId === message.replyId) {
                        bot.Api.sendMessage('已经收录过该条语录', message.groupId)
                        return
                    }
                }
            }
            data.push({ replyId: message.replyId, qqId, yulu })

            if (writeJson(jsonPath, data)) {
                bot.Api.sendMessage('收录成功', message.groupId)
            } else {
                bot.Api.sendMessage('收录失败', message.groupId)
            }

            return
        }

        //发送语录
        if (bot.checkCommand(message, '语录')) {
            let data = readJson(`${this.pluginDataPath}/${message.groupId}.json`)
            if (!data) {
                bot.Api.sendMessage('未收录任何语录', message.groupId)
                return
            }

            const chat = data[Math.floor(Math.random() * data.length)]

            let yulu = chat.yulu
            let qqId = chat.qqId
            let headImg = await bot.Api.getHeadImage(qqId)
            let a = await bot.Api.getGroupMemberInfo(message.groupId, qqId)
            let nickName = a.nickname

            let img = await createImg(yulu, nickName, headImg, message.groupId, bot)
            await bot.Api.sendMessage([Structs.image(img)], message.groupId)
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
        let path = Helper.path.appDir.join(filePath)
        if (!path.isExist) {
            log.warn(`json文件不存在：${filePath}`)
            return null
        }
        const data = fs.readFileSync(path.str, 'utf8')
        return JSON.parse(data)
    } catch (error) {
        log.error('读取json文件失败：', error)
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
        //确保目录存在
        let path = Helper.path.appDir.join(filePath)
        if (!path.isExist) {
            Helper.path.createPath(path.str)
        }

        const jsonData = JSON.stringify(data, null, 2)
        fs.writeFileSync(path.str, jsonData, 'utf8')
        return true
    } catch (error) {
        log.error('写入json文件失败：', error)
        return false
    }
}
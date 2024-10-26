import { Plugin } from '../../../onebot-lib/index.js'

export class YuLu extends Plugin {
    name = '语录'
    description

    async run (bot, message) {
        if (!message.isGroup) return

        //记录所有发言
        console.log(message)

        //收录
        if (message.replyId && bot.checkCommand(message, '收录')) {
            let replyId = message.replyId

            return
        }

        //发送语录

    }
}
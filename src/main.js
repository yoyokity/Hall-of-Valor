import { Bot } from '../onebot-lib/index.js'
import { YuLu } from './plugins/yu_lu/yu_lu.js'

import { Structs } from 'node-napcat-ts'

const bot = new Bot()
bot.group = [460048859]
bot.canPrivate = true
bot.canTemporary = false
bot.prefix = ['.','. ']

bot.loadPlugin(YuLu)
bot.connect()


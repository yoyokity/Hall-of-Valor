import { Bot } from '../onebot-lib/index.js'
import { YuLu } from './plugins/yu_lu/yu_lu.js'

import { Structs } from 'node-napcat-ts'

//Helper初始化
import { Helper } from '../yo-lib/Helper/helper.js'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
Helper.init(process.cwd(), join(__dirname, '../'), false)

//
const bot = new Bot()
bot.group = [460048859, 673172432]
bot.canPrivate = true
bot.canTemporary = false
bot.prefix = ['.', '. ']

bot.loadPlugin(YuLu)
bot.connect()


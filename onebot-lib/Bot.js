import { NCWebsocket, Structs } from 'node-napcat-ts'

import { Plugin } from './PluginType.js'
import log from './log.js'
import { Message } from './MessageType.js'

export class Bot {
    /** @type {NCWebsocket} */
    instance
    #host
    #port
    #debug
    /**
     * 接受的群组，null表示不接受，[]表示接受全部
     * @type {[number]|null}
     */
    group = []
    /**
     * 接受私聊
     * @type {boolean}
     */
    canPrivate = true
    /**
     * 接受临时会话
     * @type {boolean}
     */
    canTemporary = true
    /**
     * 呼叫命令的前缀
     * @type {[string]}
     */
    prefix = ['.']

    /** @type {[( message: Message )=>void]} */
    #msgListener = []
    /** @type {Map<string, Plugin>} */
    #plugins = new Map()

    /**
     * 创建一个机器人实例
     * @param {string} host 连接到正向ws服务器的host
     * @param {number} port 连接到正向ws服务器的port
     * @param {boolean} debug 是否启用debug功能
     */
    constructor (host = '127.0.0.1', port = 3001, debug = false) {
        this.instance = new NCWebsocket({
            protocol: 'ws',
            host: host,
            port: port
        }, debug)

        this.#host = host
        this.#port = port
        this.#debug = debug
    }

    get host () {
        return this.#host
    }

    get port () {
        return this.#port
    }

    get debug () {
        return this.#debug
    }

    /**
     * 连接
     */
    async connect () {
        this.instance.on('message', (data) => {
            let message = new Message(data)

            if (this.group === null && message.isGroup) return
            if (message.isGroup && !this.group.includes(message.groupId)) return
            if (!this.canPrivate && message.isPrivate) return
            if (!this.canTemporary && message.isTemporary) return

            //添加监听器
            for (const listener of this.#msgListener) {
                listener(message)
            }
            //添加插件
            for (const plugin of this.#plugins.values()) {
                plugin.run(this, message)
            }
        })

        await this.instance.connect()
        log.success('成功连接到ws服务器', `${this.host}:${this.port}`)
    }

    /**
     * 添加事件监听器
     * @param {( message: Message )=>void} listener
     */
    addMsgListener (listener) {
        this.#msgListener.push(listener)
    }

    /**
     * 加载插件
     * @param {typeof Plugin} Plugin 插件类，请不要实例化
     */
    loadPlugin (Plugin) {
        let plugin = new Plugin()
        if (!plugin.name) {
            throw new Error(`${plugin.constructor.name} 的插件name不能为空！`)
        }
        this.#plugins.set(plugin.name, plugin)
    }

    /**
     * 检查消息是否包含命令
     * @param {Message} message
     * @param {string|[string]} command 命令
     * @param {boolean} atMe 是否艾特了机器人
     * @return {boolean}
     */
    checkCommand (message, command, atMe = false) {
        if (atMe && !message.isAtSelf) return false
        for (let msg of message.message) {
            if (msg.type === 'text') {
                let text = msg.data.text

                if (typeof command === 'string') command = [command]
                return this.prefix.some(prefix =>
                    command.some(command =>
                        text.includes(prefix + command)
                    ))
            }
        }
        return false
    }
}
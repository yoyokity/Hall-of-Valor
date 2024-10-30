/**
 * @typedef {import('node-napcat-ts').PrivateGroupMessage} PrivateGroupMessage
 * @typedef {import('node-napcat-ts').GroupMessage} GroupMessage
 * @typedef {import('node-napcat-ts').PrivateFriendMessage} PrivateFriendMessage
 * @typedef {import('node-napcat-ts').Send} Send
 * @typedef {import('node-napcat-ts').Receive} Receive
 */

export class Message {
    /** @type {number} */
    #self_id
    /** @type {number} */
    #user_id
    /** @type {number} */
    #time
    /** @type {number} */
    #message_id
    /** @type {number} */
    #message_seq
    /** @type {number} */
    #real_id
    /** @type {Receive[keyof Receive][]} */
    #message
    /** @type {'private'|'group'} */
    #message_type
    /** @type {{
     *     user_id: number,
     *     nickname: string,
     *     card: string,
     }|{
     *     user_id: number,
     *     nickname: string,
     *     card: string,
     *     role: 'owner' | 'admin' | 'member',
     * }}
     }} */
    #sender
    /** @type {string} */
    #raw_message
    /** @type {number} */
    #font
    /** @type {'friend'|'group'|'normal'} */
    #sub_type
    /** @type {number} */
    #group_id
    /** @type {(reply: Send[keyof Send][], at_sender?: boolean) => Promise<{}>} */
    #quick_action

    /**
     *
     * @param {PrivateGroupMessage|GroupMessage|PrivateFriendMessage} message
     */
    constructor (message) {
        this.#self_id = message.self_id || null
        this.#user_id = message.user_id || null
        this.#time = message.time || null
        this.#message_id = message.message_id || null
        this.#message_seq = message.message_seq || null
        this.#real_id = message.real_id || null
        this.#message = message.message || null
        this.#message_type = message.message_type || null
        this.#sender = message.sender || null
        this.#raw_message = message.raw_message || null
        this.#font = message.font || null
        this.#sub_type = message.sub_type || null
        this.#group_id = message.group_id || null
        this.#quick_action = message.quick_action || null
    }

    /**
     * 获取消息结构体
     * @return {Receive[keyof Receive][]}
     */
    get message () {
        return this.#message
    }

    /**
     * 获取消息文本
     * @return {string}
     */
    get messageRaw () {
        return this.#raw_message
    }

    /**
     * 获取消息id
     * @return {number}
     */
    get messageId(){
        return this.#message_id
    }

    /**
     * 机器人qq号
     * @return {number}
     */
    get botId () {
        return this.#self_id
    }

    /**
     * 消息发送者的qq号
     * @return {number}
     */
    get senderId () {
        return this.#user_id
    }

    /**
     * 消息发送者的昵称
     * @return {string|null}
     */
    get senderName () {
        return this.#sender?.nickname
    }

    /**
     * 消息发送者的群名片
     * @return {string|null}
     */
    get senderCard () {
        return this.#sender?.card
    }

    /**
     * 是否为群组消息
     * @return {boolean}
     */
    get isGroup () {
        return this.#message_type === 'group'
    }

    /**
     * 获取群号
     * @return {number|null}
     */
    get groupId () {
        return this.#group_id || null
    }

    /**
     * 是否为私聊消息
     * @return {boolean}
     */
    get isPrivate () {
        return this.#message_type === 'private' && this.#sub_type === 'friend'
    }

    /**
     * 是否为临时对话
     * @return {boolean}
     */
    get isTemporary () {
        return this.#message_type === 'private' && this.#sub_type === 'group'
    }

    /**
     * 是否艾特了bot自己
     * @return {boolean}
     */
    get isAtSelf () {
        for (let message of this.#message) {
            if (message.type === 'at'){
                if (message.data['qq'] === String(this.#self_id)){
                    return true
                }
            }
        }
        return false
    }

    /**
     * 获取回复（引用）消息的ID
     * @return {number|null} 如果有回复消息则返回回复消息的ID，否则返回null
     */
    get replyId () {
        const found = this.#message.find(item => item.type === 'reply')
        return found ? Number(found.data['id']) : null
    }

    /**
     * 发送回复消息
     * @param {Send[keyof Send][]|string} structsText 要发送的消息
     * @param {boolean} atSender 是否艾特发送者（仅限群组）
     * @return {Promise<void>}
     */
    async sendReply (structsText, atSender = false) {
        await this.#quick_action(structsText, atSender)
    }
}


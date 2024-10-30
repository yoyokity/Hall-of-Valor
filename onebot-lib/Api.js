import { got } from 'got'

import { Message } from './MessageType.js'
import log from './log.js'

/**
 * @typedef {import('node-napcat-ts').NCWebsocket} NCWebsocket
 */

export class API {
    /** @type {NCWebsocket} */
    #instance

    /**
     *
     * @param {Bot} bot
     */
    constructor (bot) {
        this.#instance = bot.instance
    }

    /**
     * 发送消息
     * @param {Send[keyof Send][]|string} structsText 要发送的消息
     * @param {number} id 发送对象为群组时id指群号，为私聊时id指QQ号
     * @param {boolean} isGroup 对象是否为群组，否则为私聊
     * @return {Promise<number>} 返回本条发送的消息的id
     */
    async sendMessage (structsText, id, isGroup = true) {
        const config = isGroup
            ? { group_id: id, message: structsText }
            : { user_id: id, message: structsText }
        let re = await this.#instance.send_msg(config)
        return re['message_id']
    }

    /**
     * 通过消息id获取消息内容
     * @param {number} id 消息id
     * @return {Promise<Message>}
     */
    async getMessage (id) {
        let re = await this.#instance.get_msg({ message_id: id })
        return new Message(re)
    }

    /**
     * 撤回消息
     * @param {number} id 消息id
     * @return {Promise<void>}
     */
    async deleteMessage (id) {
        await this.#instance.delete_msg({ message_id: id })
    }

    /**
     * 通过qq号获取头像
     * @param {number} id QQ号
     * @return {Promise<string|null>}
     */
    async getHeadImage (id) {
        let imgUrl = `http://q.qlogo.cn/headimg_dl?dst_uin=${id}&spec=640&img_type=jpg`
        try {
            const response = await got(imgUrl, {
                responseType: 'buffer'
            })
            return response.body
        } catch (error) {
            log.error(`获取头像失败：${imgUrl}`, error)
        }
        return null
    }

    /**
     * 获取某个群成员信息
     * @param {number} groupId 群号
     * @param {number} memberId 群成员QQ号
     * @return {Promise<{
     *         group_id: number;    // 群号
     *         user_id: number;     // QQ号
     *         nickname: string;
     *         card: string;    // 群名片/备注
     *         sex: 'unknown' | 'male' | 'female';
     *         age: number;
     *         area: string;    // 地区
     *         level: number;   // 群等级
     *         qq_level: number;    // QQ等级
     *         join_time: number;   // 加群时间戳
     *         last_sent_time: number;  // 最后发言时间戳
     *         title_expire_time: number;   // 专属头衔过期时间戳
     *         unfriendly: boolean;     // 是否不良记录成员
     *         card_changeable: boolean;     // 是否允许修改群名片
     *         is_robot: boolean;   // 是否机器人
     *         shut_up_timestamp: number;   // 禁言时间戳
     *         role: 'owner' | 'admin' | 'member';  // 角色
     *         title: string;    // 专属头衔
     *     }>}
     *     具体参数含义看注释
     */
    async getGroupMemberInfo (groupId, memberId) {
        let re = await this.#instance.get_group_member_info({
            group_id: groupId,
            user_id: memberId
        })
        return re
    }

    /**
     * 获取机器人QQ信息
     * @return {Promise<{user_id: number, nickname: string}>}
     */
    async getBotInfo () {
        return await this.#instance.get_login_info()
    }

    /**
     * 获取某个QQ号的信息
     * @param {number} id QQ号
     * @return {Promise<{user_id: number, uid: string, nickname: string, age: number, qid: string, qqLevel: number, sex: 'female' | 'male' | 'unknown', long_nick: string, reg_time: number, is_vip: boolean, is_years_vip: boolean, vip_level: number, remark: string, status: number, login_days: number}>}
     */
    async getQQInfo (id) {
        return await this.#instance.get_stranger_info({ user_id: id })
    }


    /**
     * 获取群信息
     * @param {number} id 群号
     * @return {Promise<{group_id: number, group_name: string, member_count: number, max_member_count: number}>}
     */
    async getGroupInfo (id) {
        return await this.#instance.get_group_info({ group_id: id })
    }

    /**
     * 获取好友列表
     * @return {Promise<{qid: string, longNick: string, birthday_year: number, birthday_month: number, birthday_day: number, age: number, sex: string, eMail: string, phoneNum: string, categoryId: number, richTime: number, richBuffer: {[p: string]: number}, uid: string, uin: string, nick: string, remark: string, user_id: number, nickname: string, level: number}[]>}
     */
    async getFriendList () {
        return await this.#instance.get_friend_list()
    }

    /**
     * 获取QQ群列表
     * @return {Promise<{group_id: number, group_name: string, member_count: number, max_member_count: number}[]>}
     */
    async getGroupList () {
        return await this.#instance.get_group_list()
    }

    /**
     * 获取群成员列表
     * @param {number} id 群号
     * @return {Promise<{
     *         group_id: number;
     *         user_id: number;
     *         nickname: string;
     *         card: string;
     *         sex: "unknown";
     *         age: 0;
     *         area: "";
     *         level: number;
     *         qq_level: 0;
     *         join_time: number;
     *         last_sent_time: number;
     *         title_expire_time: number;
     *         unfriendly: boolean;
     *         card_changeable: boolean;
     *         is_robot: boolean;
     *         shut_up_timestamp: number;
     *         role: "owner" | "admin" | "member";
     *         title: "";
     *     }[]>}
     */
    async getGroupMemberList (id) {
        return await this.#instance.get_group_member_list({ group_id: id })
    }

    /**
     * 获取群禁言列表
     * @param {number} id 群号
     * @return {Promise<{}>}
     */
    async getGroupShutList(id){
        return await this.#instance.get_group_shut_list({
            group_id:id
        })
    }

    /**
     * 用于其他一些api调用
     * @return {NCWebsocket}
     */
    get instance () {
        return this.#instance
    }


}
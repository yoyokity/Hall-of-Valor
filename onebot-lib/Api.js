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
     * @return {Promise<Buffer|null>} 返回图片的raw数据
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
     * 获取机器人在群组中是否有管理员权限
     * @param {number} groupId 群号
     * @returns {Promise<boolean>}
     */
    async getBotAdminInfo(groupId){
        let re = await this.getBotInfo()
        re = await this.getGroupMemberInfo(groupId, re.user_id)
        return re.role === 'admin';
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
     *         sex: 'unknown';
     *         age: 0;
     *         area: '';
     *         level: number;
     *         qq_level: 0;
     *         join_time: number;
     *         last_sent_time: number;
     *         title_expire_time: number;
     *         unfriendly: boolean;
     *         card_changeable: boolean;
     *         is_robot: boolean;
     *         shut_up_timestamp: number;
     *         role: 'owner' | 'admin' | 'member';
     *         title: '';
     *     }[]>}
     */
    async getGroupMemberList (id) {
        return await this.#instance.get_group_member_list({ group_id: id })
    }

    /**
     * 获取群禁言列表
     * @param {number} id 群号
     * @returns {Promise<{group_id: number, user_id: number, nickname: string, card: string, sex: 'unknown', age: 0, area: '', level: number, qq_level: 0, join_time: number, last_sent_time: number, title_expire_time: number, unfriendly: boolean, card_changeable: boolean, is_robot: boolean, shut_up_timestamp: number, role: ('owner'|'admin'|'member'), title: ''}[]>}
     */
    async getGroupShutList (id) {
        let list = await this.getGroupMemberList(id)
        list = list.filter((value, index, array) => {
            return value.shut_up_timestamp > 0
        })
        return list
    }

    /**
     * 用于其他一些api调用
     * @return {NCWebsocket}
     */
    get instance () {
        return this.#instance
    }

    /**
     * 群组踢人
     * @param {number} groupId 群号
     * @param {number} memberId 被踢人QQ号
     * @param {boolean} refuseToJoin 是否拒绝再次入群请求
     * @returns {Promise<void>}
     */
    async setGroupKick (groupId, memberId, refuseToJoin = false) {
        await this.#instance.set_group_kick({
            group_id: groupId,
            user_id: memberId,
            reject_add_request: refuseToJoin
        })
    }

    /**
     * 群组单人禁言
     * @param {number} groupId 群号
     * @param {number} memberId 被禁言人QQ号
     * @param {number} duration 禁言时长，单位秒，0为取消禁言
     * @returns {Promise<void>}
     */
    async setGroupBan (groupId, memberId, duration = 600) {
        await this.#instance.set_group_ban({
            group_id: groupId,
            user_id: memberId,
            duration: duration
        })
    }

    /**
     * 群组全体禁言
     * @param {number} groupId 群号
     * @param {boolean} enable 是否禁言
     * @returns {Promise<void>}
     */
    async setGroupWholeBan (groupId, enable = true) {
        await this.#instance.set_group_whole_ban({
            group_id: groupId,
            enable: enable
        })
    }

    /**
     * 群组设置管理员
     * @param {number} groupId 群号
     * @param {number} memberId 管理员QQ号
     * @param {boolean} enable true 为设置，false 为取消
     * @returns {Promise<void>}
     */
    async setGroupAdmin (groupId, memberId, enable = true) {
        await this.#instance.set_group_admin({
            group_id: groupId,
            user_id: memberId,
            enable: enable
        })
    }

    /**
     * 设置成员群名片
     * @param {number} groupId 群号
     * @param {number} memberId 群成员QQ号
     * @param {string} card 群名片
     * @returns {Promise<void>}
     */
    async setGroupCard (groupId, memberId, card='') {
        await this.#instance.set_group_card({
            group_id: groupId,
            user_id: memberId,
            card: card
        })
    }

    /**
     * 设置群名
     * @param {number} groupId 群号
     * @param {string} name 群名
     * @returns {Promise<void>}
     */
    async setGroupName(groupId, name) {
        await this.#instance.set_group_name({
            group_id: groupId,
            group_name: name
        })
    }

    /**
     * 退出群组
     * @param {number} groupId 群号
     * @returns {Promise<void>}
     */
    async setGroupLeave(groupId) {
        await this.#instance.set_group_leave({
            group_id: groupId
        })
    }

    /**
     * 设置群组专属头衔
     * @param {number} groupId 群号
     * @param {number} memberId 群成员QQ号，不填或空字符串表示删除专属头衔
     * @param {string} title 群组专属头衔
     * @returns {Promise<void>}
     */
    async setGroupSpecialTitle(groupId, memberId, title='') {
        await this.#instance.set_group_special_title({
            group_id: groupId,
            user_id: memberId,
            special_title: title
        })
    }
}
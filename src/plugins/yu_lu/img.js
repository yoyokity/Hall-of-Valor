import {createCanvas,loadImage} from 'canvas'

import {Message} from '../../../onebot-lib/index.js'

/**
 * 创建图片
 * @param {Message} message
 * @return {Promise<void>}
 */
export async function createImg(message) {
    let qqId = message.senderId
    let imgUrl  = `http://q.qlogo.cn/headimg_dl?dst_uin=${qqId}&spec=640&img_type=jpg`
}
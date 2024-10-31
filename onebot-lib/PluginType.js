export class Plugin {
    /**
     * @abstract
     */
    name
    /**
     * @abstract
     */
    description

    /**
     *
     * @abstract
     * @param {Bot} bot
     * @param {Message} message
     * @return {Promise<void>}
     */
    async run (bot, message) {}

    /**
     * 返回插件的data目录
     * @return {string} 为相对路径
     * @constructor
     */
    get pluginDataPath () {
        return `./data/${this.name}/`
    }
}
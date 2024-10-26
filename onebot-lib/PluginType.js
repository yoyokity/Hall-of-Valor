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
}
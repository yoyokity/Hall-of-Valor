class Log {
    /**
     * @private
     */
    getTime () {
        const date = new Date()
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }

    success (...message) {
        console.info(`[${this.getTime()}] [success]`, ...message)
    }

    info (...message) {
        console.log(`[${this.getTime()}] [info]`, ...message)
    }

    error (...message) {
        console.error(`[${this.getTime()}] [error]`, ...message)
    }

    warn (...message) {
        console.warn(`[${this.getTime()}] [warn]`, ...message)
    }
}

export default new Log()
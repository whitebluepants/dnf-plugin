import plugin from '../../../lib/plugins/plugin.js'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import moment from 'moment'

const CHANNEL_PATH = resolve('./plugins/dnf-plugin/resources/channel.json')
const CACHE_KEY = (qq) => `dnf:lucky_channel:${qq}`

export class LuckyChannelPlugin extends plugin {
    constructor() {
        super({
            name: '幸运频道',
            dsc: '每日推荐DNF幸运频道',
            event: 'message',
            rule: [
                {
                    reg: '^#幸运频道',
                    fnc: 'generateChannel'
                }
            ]
        })
        this.channels = JSON.parse(readFileSync(CHANNEL_PATH)).kua_1
    }

    async generateChannel(e) {
        try {
            const user_qq = e.user_id // 获取触发用户QQ

            // 改造为读取用户独立缓存
            const cached = await redis.get(CACHE_KEY(user_qq))
            if (cached) {
                const parsedCache = JSON.parse(cached)
                if (!this.isExpired(parsedCache.time)) {
                    return this.sendResult(e, parsedCache.channel)
                }
            }

            // 生成用户专属频道
            const newChannel = this.selectChannel(user_qq)
            await redis.set(
                CACHE_KEY(user_qq),
                JSON.stringify({
                    channel: newChannel,
                    time: moment().format()
                }),
                'EX', this.getTTL()
            )

            this.sendResult(e, newChannel)
        } catch (err) {
            console.error('生成失败:', err)
            await e.reply('频道生成异常，请联系管理员', false, { at: true })
        }
        return true
    }

    selectChannel(user_qq) {
        // 后续替换为个性化算法
        return this.channels[Math.floor(Math.random() * this.channels.length)]
    }


    async getCache() {
        const data = await redis.get(CACHE_KEY)
        return data ? JSON.parse(data) : null
    }

    async setCache(channel) {
        const cacheData = {
            channel,
            time: moment().format()
        }
        await redis.set(CACHE_KEY, JSON.stringify(cacheData), 'EX', this.getTTL())
    }

    getTTL() {
        const now = moment()
        const next6am = moment().add(1, 'days').hour(6).minute(0)
        return next6am.diff(now, 'seconds')
    }

    isExpired(cachedTime) {
        return moment().isAfter(moment(cachedTime).add(1, 'days').hour(6))
    }

    async sendResult(e, channel) {
        const msg = `你今天的幸运频道是: ${channel}`
        await e.reply(msg, false, { at: true })
    }
}
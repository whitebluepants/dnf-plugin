import plugin from '../../../lib/plugins/plugin.js'

import { readFileSync } from 'fs'
import { resolve } from 'path'

const BASE_RATE = 0.0015 // 基础爆率0.15%
const EQUIPMENT_PATH = resolve('./plugins/dnf-plugin/resources/equipment.json')

export class TaiChuPlugin extends plugin {
    constructor() {
        super({
            name: '太初模拟器',
            dsc: '模拟DNF太初装备掉落',
            event: 'message',
            rule: [
                {
                    reg: '^#随机太初',
                    fnc: 'simulateDrops'
                }
            ]
        })
        this.equipmentList = JSON.parse(readFileSync(EQUIPMENT_PATH))
    }

    async simulateDrops(e) {
        try {
            let count = 0
            while (++count) {
                if (Math.random() < BASE_RATE) {
                    const item = this.getRandomItem()
                    await this.sendResult(e, count, item)
                    break
                }
            }
        } catch (err) {
            console.error('随机太初出错:', err)
            await this.replyError(e)
        }
        return true
    }

    getRandomItem() {
        return this.equipmentList[Math.floor(Math.random() * this.equipmentList.length)]
    }

    async sendResult(e, count, item) {
        const msg = [
            `≡ 随机太初结果 ≡`,
            `累计深渊次数：${count}次`,
            `获得装备：${item}`,
        ].join('\n')

        await e.reply(msg, false, { at: true })
    }

    async replyError(e) {
        await e.reply(`随机太初功能暂时不可用，请联系维护人员`, false, { at: true })
    }
}
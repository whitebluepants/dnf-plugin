import plugin from '../../../lib/plugins/plugin.js'

import { readFileSync } from 'fs'
import { resolve } from 'path'

const BASE_RATE = 0.005 // 基础爆率0.5%
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
        let count = 0
        while (true) {
            count++
            if (Math.random() < BASE_RATE) {
                const item = this.getRandomItem()
                await e.reply(this.formatResult(count, item))
                break
            }
        }
        return true
    }

    getRandomItem() {
        return this.equipmentList[Math.floor(Math.random() * this.equipmentList.length)]
    }

    formatResult(count, item) {
        return [
            `≡ 随机太初 ≡`,
            `累计深渊次数：${count}次`,
            `获得装备：${item}`,
        ].join('\n')
    }
}
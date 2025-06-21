<template>
    <div class="container mx-auto px-4 py-8">
        <!-- 加载状态 -->
        <div v-if="pending" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-500"></div>
            <p class="mt-2 text-gray-400">加载库存中...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="fetchError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>加载库存失败: {{ fetchError.message }}</p>
        </div>

        <!-- 成功状态 -->
        <div v-else>
            <!-- 库存统计 -->
            <div class="bg-gray-800 rounded-lg p-4 mb-6 flex flex-wrap gap-4 text-sm">
                <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>总物品: {{ items.length }}</span>
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>可交易: {{ tradableCount }}</span>
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span>可出售: {{ marketableCount }}</span>
                </div>
            </div>

            <!-- 物品网格 -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div v-for="item in items" :key="item.id"
                    class="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    <!-- 物品图片 -->
                    <div class="bg-gray-900 flex items-center justify-center p-4 h-48">
                        <img :src="item.iconUrl" :alt="item.name" class="max-h-full max-w-full object-contain"
                            loading="lazy">
                    </div>

                    <!-- 物品详情 -->
                    <div class="p-4">
                        <h3 class="font-medium truncate mb-2" :style="{ color: item.nameColor }">
                            {{ item.name }}
                        </h3>

                        <!-- 基本信息 -->
                        <div class="space-y-1 text-sm text-gray-300">
                            <div class="flex">
                                <span class="w-20 text-gray-400">类型</span>
                                <span>{{ item.type }}</span>
                            </div>
                            <div class="flex">
                                <span class="w-20 text-gray-400">品质</span>
                                <span :style="{ color: item.rarity.color }">{{ item.rarity.name }}</span>
                            </div>
                            <div v-if="item.exterior.name" class="flex">
                                <span class="w-20 text-gray-400">外观</span>
                                <span :style="{ color: item.exterior.color }">{{ item.exterior.name }}</span>
                            </div>
                            <div v-if="item.wear" class="flex">
                                <span class="w-20 text-gray-400">磨损</span>
                                <span>{{ item.wear }}</span>
                            </div>
                        </div>

                        <!-- 名称标签 -->
                        <p v-if="item.nametag" class="mt-2 text-blue-300 text-sm italic">
                            {{ item.nametag }}
                        </p>

                        <!-- 印花 -->
                        <div v-if="item.stickers" class="mt-3 pt-3 border-t border-gray-700">
                            <p class="text-xs text-gray-400 mb-1">印花</p>
                            <ul class="text-xs space-y-1">
                                <li v-for="(sticker, index) in item.stickers" :key="index">
                                    {{ sticker }}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    id: {
        type: String,
        required: true
    }
})

// 获取库存数据
const { data, error: fetchError, pending } = await useFetch(
    `http://156.238.243.110:8080/api/inventory/76561198386265483`
)

// 提取物品信息
const items = computed(() => {
    if (!data.value?.data?.raw?.assets || !data.value?.data?.raw?.descriptions) {
        return []
    }

    return data.value.data.raw.assets.map((asset) => {
        const description = data.value.data.raw.descriptions.find(
            (desc) => desc.classid === asset.classid && desc.instanceid === asset.instanceid
        )

        if (!description) return null

        // 获取稀有度和外观标签
        const rarityTag = description.tags?.find((t) => t.category === 'Rarity')
        const exteriorTag = description.tags?.find((t) => t.category === 'Exterior')
        const weaponTag = description.tags?.find((t) => t.category === 'Weapon')

        // 解析磨损值
        const wearDescription = description.descriptions?.find((d) => d.name === 'exterior_wear')
        const wear = wearDescription ? wearDescription.value.replace('外观: ', '') : null

        // 解析名称标签
        const nameTag = description.descriptions?.find((d) => d.name === 'nametag')
        const nametag = nameTag ? nameTag.value : null

        // 解析印花信息
        const stickerInfo = description.descriptions?.find((d) => d.name === 'sticker_info')
        let stickers = null
        if (stickerInfo) {
            const stickerMatch = stickerInfo.value.match(/印花: (.+?)<\/center>/)
            stickers = stickerMatch ? stickerMatch[1].split(', ').map((s) => s.trim()) : null
        }

        // 构建最终物品对象
        return {
            id: `${asset.assetid}-${asset.classid}-${asset.instanceid}`,
            name: description.market_name || description.name,
            type: description.type,
            iconUrl: `https://steamcommunity-a.akamaihd.net/economy/image/${description.icon_url}`,
            rarity: {
                name: rarityTag?.localized_tag_name || '普通',
                color: rarityTag?.color || '#B0C3D9'
            },
            exterior: {
                name: exteriorTag?.localized_tag_name || '',
                color: getExteriorColor(exteriorTag?.internal_name)
            },
            weapon: weaponTag?.localized_tag_name || null,
            wear,
            nametag,
            stickers,
            tradable: description.tradable === 1,
            marketable: description.marketable === 1,
            nameColor: description.name_color || '#D2D2D2',
            marketHashName: description.market_hash_name,
            assetid: asset.assetid,
            classid: asset.classid,
            instanceid: asset.instanceid
        }
    }).filter(Boolean)
})

// 外观颜色映射
const getExteriorColor = (internalName) => {
    const colors = {
        'WearCategory0': '#4b69ff', // 崭新出厂
        'WearCategory1': '#5e98d9', // 略有磨损
        'WearCategory2': '#4b69ff', // 久经沙场
        'WearCategory3': '#eb4b4b', // 破损不堪
        'WearCategory4': '#8847ff'  // 战痕累累
    }
    return colors[internalName] || '#B0C3D9'
}

// 计算属性
const tradableCount = computed(() => items.value.filter(item => item.tradable).length)
const marketableCount = computed(() => items.value.filter(item => item.marketable).length)
</script>
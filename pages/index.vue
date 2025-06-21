<template>
    <div class="flex h-screen bg-gray-100">
        <!-- 左侧用户列表区域 -->
        <div class="w-1/4 bg-white shadow-md p-4 flex flex-col">
            <div
                class="text-xl font-bold mb-6 text-center py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg">
                CSGO 仓库查看器
            </div>

            <div class="mb-4">
                <input v-model="userSearch" placeholder="搜索用户..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-3 overflow-y-auto max-h-[500px]">
                <div v-for="user in filteredUsers" :key="user.id" @click="selectUser(user)"
                    class="bg-gray-50 hover:bg-pink-50 cursor-pointer rounded-lg shadow flex flex-col items-center p-3 transition-all duration-200 border border-transparent hover:border-pink-200"
                    :class="{ 'bg-pink-100 border-pink-300': selectedUser?.id === user.id }">
                    <img :src="user.avatar" :alt="user.name"
                        class="w-14 h-14 rounded-full object-cover mb-2 border-2 border-white shadow" />

                    <!-- 名字 + 蓝标一起 -->
                    <div class="flex items-center justify-center text-sm font-medium text-center">
                        <span>{{ user.name }}</span>

                    </div>
                    <div class="flex items-center justify-center text-sm font-medium text-center">

                        <img v-if="user.status === 1" src="/svg/auth.svg" alt="已认证" class="w-5 h-5 inline-block ml-1" />
                        <img v-if="user.is_pro === 1" src="/svg/is_pro.svg" alt="职业选手"
                            class="w-5 h-5 inline-block ml-1" />
                        <img v-if=" user.is_reseller" src="/svg/seller.svg" alt="倒狗"
                            class="w-5 h-5 inline-block ml-1" />
                            
                    </div>


                    <span class="text-xs text-gray-500 mt-1">库存: {{ user.inventoryCount || 0 }}</span>
                </div>
            </div>

        </div>

        <!-- 右侧主内容区域 -->
        <div class="flex-1 bg-gray-50 p-6 h-full flex flex-col overflow-hidden">
            <!-- 顶部控制区域 -->
            <div class="bg-white rounded-lg shadow p-4 mb-6">
                <div class="flex flex-col md:flex-row md:items-center gap-4">
                    <div class="flex-1">
                        <input v-model="steamId" placeholder="输入Steam64 ID 或社区URL"
                            class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                            @keyup.enter="fetchInventory" />
                    </div>
                    <div class="flex gap-2">
                        <button @click="fetchInventory"
                            class="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-md shadow-sm flex items-center gap-2 transition-colors">
                            <span v-if="!loading">查询库存</span>
                            <span v-else class="flex items-center">
                                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                    </path>
                                </svg>
                                加载中...
                            </span>
                        </button>
                        <button @click="resetSearch"
                            class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md shadow-sm transition-colors">
                            重置
                        </button>
                        <NuxtLink to="/addPlayers"
                            class="px-4 py-2 bg-red-200 hover:bg-gray-300 text-gray-800 rounded-md shadow-sm transition-colors inline-block text-center">
                            添加库存账号
                        </NuxtLink>
                    </div>
                </div>

                <!-- 筛选选项 -->
                <div class="mt-4 flex flex-wrap gap-3">
                    <select v-model="filterRarity" class="px-3 py-1 border border-gray-300 rounded-md text-sm">
                        <option value="">全部稀有度</option>
                        <option v-for="rarity in rarities" :key="rarity" :value="rarity">{{ rarity }}</option>
                    </select>

                    <select v-model="filterType" class="px-3 py-1 border border-gray-300 rounded-md text-sm">
                        <option value="">全部类型</option>
                        <option v-for="type in types" :key="type" :value="type">{{ type }}</option>
                    </select>

                    <select v-model="sortBy" class="px-3 py-1 border border-gray-300 rounded-md text-sm">
                        <option value="default">默认排序</option>
                        <option value="name-asc">名称 (A-Z)</option>
                        <option value="name-desc">名称 (Z-A)</option>
                        <option value="value-asc">价格 (低到高)</option>
                        <option value="value-desc">价格 (高到低)</option>
                        <option value="rarity-asc">稀有度 (低到高)</option>
                        <option value="rarity-desc">稀有度 (高到低)</option>
                    </select>
                </div>
            </div>

            <!-- 库存统计 -->
            <div v-if="inventory.length > 0" class="bg-white rounded-lg shadow p-4 mb-6 hidden md:block">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-pink-50 rounded-lg p-3 text-center">
                        <div class="text-sm text-pink-600 font-medium">总物品数</div>
                        <div class="text-xl font-bold">{{ inventory.length }}</div>
                    </div>
                    <div class="bg-blue-50 rounded-lg p-3 text-center">
                        <div class="text-sm text-blue-600 font-medium">预估总价值</div>
                        <div class="text-xl font-bold">¥ {{ estimatedTotalValue.toFixed(2) }}</div>
                    </div>
                    <div class="bg-purple-50 rounded-lg p-3 text-center">
                        <div class="text-sm text-purple-600 font-medium">最稀有物品</div>
                        <div class="text-xl font-bold truncate">{{ rarestItem?.market_hash_name || '-' }}</div>
                    </div>
                    <div class="bg-green-50 rounded-lg p-3 text-center">
                        <div class="text-sm text-green-600 font-medium">最值钱物品</div>
                        <div class="text-xl font-bold truncate">{{ mostValuableItem?.market_hash_name || '-' }}</div>
                    </div>
                </div>
            </div>

            <!-- 库存展示区域 -->
            <div v-if="filteredInventory.length > 0"
                class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 overflow-y-auto flex-1 pb-6">
                <div v-for="item in filteredInventory" :key="item.id" @click="showItemDetail(item)"
                    class="bg-white hover:shadow-lg rounded-lg shadow-md p-3 flex flex-col items-center cursor-pointer transition-all duration-200 transform hover:-translate-y-1 border border-gray-100">
                    <div class="relative mb-2">
                        <img :src="item.icon_url || 'https://via.placeholder.com/150'" :alt="item.market_hash_name"
                            class="w-20 h-20 object-contain " />
                        <div v-if="item.rarity" class="absolute bottom-0 left-0 right-0 text-center ">
                            <span class="inline-block px-1 text-xs font-medium rounded"
                                :style="{ backgroundColor: '#' + item.rarity.color }">
                                {{ item.rarity.name }}
                            </span>
                        </div>
                        <div v-if="item.exterior.name" class="absolute top-0 left-0 text-center">
                            <span class="inline-block px-1 text-xs font-medium rounded"
                                :style="{ backgroundColor: item.exterior.color }">
                                {{ item.exterior.name }}
                            </span>
                        </div>
                    </div>
                    <p class="text-sm font-medium text-center mb-1 truncate w-full">{{ item.name }}</p>
                    <!-- <p class="text-xs text-pink-600 font-semibold">¥ {{ (item.price || 0).toFixed(2) }}</p> -->
                </div>
            </div>

            <!-- 空状态 -->
            <div v-else class="flex-1 flex flex-col items-center justify-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p class="text-lg mb-2">没有找到库存物品网络问题或者是该用户的账号为私密状态</p>
                <p class="text-sm">请输入SteamID或点击用户头像查询</p>
            </div>

            <!-- 物品详情模态框 -->
            <div v-if="showModal"
                class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-start mb-4">
                            <h3 class="text-xl font-bold" :style="{ color: currentItem.name_color }">{{
                                currentItem.name }}</h3>
                            <button @click="showModal = false" class="text-gray-500 hover:text-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div class="flex flex-col md:flex-row gap-6 mb-6">
                            <div class="flex-1 flex justify-center">
                                <img :src="currentItem.icon_url" :alt="currentItem.market_hash_name"
                                    class="w-40 h-40 object-contain border border-gray-200 rounded-lg" />
                            </div>
                            <div class="flex-1">
                                <div class="space-y-3">
                                    <div>
                                        <label class="text-sm text-gray-500">类型</label>
                                        <p class="font-medium">{{ currentItem.type || '未知' }}</p>
                                    </div>
                                    <div>
                                        <label class="text-sm text-gray-500">稀有度</label>
                                        <p class="font-medium">
                                            <span class="inline-block px-2 py-0.5 text-xs rounded"
                                                :style="{ backgroundColor: currentItem.rarity.color }">
                                                {{ currentItem.rarity.name || '未知' }}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <label class="text-sm text-gray-500">外观</label>
                                        <p class="font-medium">
                                            <span class="inline-block px-2 py-0.5 text-xs rounded"
                                                :style="{ backgroundColor: currentItem.exterior.color }">
                                                {{ currentItem.exterior.name || '未知' }}
                                            </span>
                                        </p>
                                    </div>
                                    <!-- <div>
                                        <label class="text-sm text-gray-500">当前价格</label>
                                        <p class="text-xl font-bold text-pink-600">${{ (currentItem.price ||
                                            0).toFixed(2) }}</p>
                                    </div> -->
                                </div>
                            </div>
                        </div>

                        <div v-if="currentItem.wear" class="border-t border-gray-200 pt-4 mb-4">
                            <h4 class="font-medium mb-2">磨损</h4>
                            <p class="text-sm text-gray-600">{{ currentItem.wear }}</p>
                        </div>

                        <div v-if="currentItem.nametag" class="border-t border-gray-200 pt-4 mb-4">
                            <h4 class="font-medium mb-2">名称标签</h4>
                            <p class="text-sm text-blue-500 italic">{{ currentItem.nametag }}</p>
                        </div>

                        <div v-if="currentItem.stickers?.length" class="grid grid-cols-2 gap-2">
                            <div v-for="(sticker, index) in currentItem.stickers" :key="index" class="text-center">
                                <img :src="sticker.img" :alt="sticker.name" class="w-16 h-12 object-contain mx-auto" />
                                <p class="text-xs mt-1 truncate">{{ sticker.name }}</p>
                            </div>
                        </div>


                        <div class="border-t border-gray-200 pt-4">
                            <h4 class="font-medium mb-2">物品描述</h4>
                            <p class="text-sm text-gray-600">{{ currentItem.description || '暂无描述' }}</p>
                        </div>
                    </div>

                    <div class="bg-gray-50 px-6 py-3 flex justify-end gap-3">
                        <button @click="showModal = false" class="px-4 py-2 text-gray-700 hover:text-gray-900">
                            关闭
                        </button>
                        <a v-if="currentItem.market_hash_name"
                            :href="`https://steamcommunity.com/market/listings/730/${encodeURIComponent(currentItem.market_hash_name)}`"
                            target="_blank"
                            class="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-md shadow-sm transition-colors">
                            查看市场
                        </a>
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
        required: false
    }
})

// 用户数据
import { ref, onMounted } from 'vue'

const users = ref([])

onMounted(async () => {
    try {
        const res = await fetch('http://156.238.243.110:3003/api/players')
        const data = await res.json()


        if (data.success) {
            users.value = data.players.map(player => {
                // console.log('📦 玩家:', player)  // ✅ 日志放外面
                return {
                    id: player.id,
                    name: player.name,
                    avatar: player.avata,
                    steamId: player.id64,
                    inventoryCount: player.count ?? 0,
                    status: player.status ?? 0,
                    is_pro: player.is_pro ?? 0,
                    is_seller: player.is_reseller ?? 0
                }
            })
            // console.log(data)
        }

    } catch (error) {
        console.error('❌ 获取玩家列表失败:', error)
    }
})
console.log(users.value)
// 状态管理
const steamId = ref('')
const rawInventoryData = ref(null)
// 库存
const inventory = ref([])
const inventoryCount = ref(0) // ✅ 添加这一行
const lastUpdated = ref('')
const loading = ref(false)
const userSearch = ref('')
const selectedUser = ref(null)
const showModal = ref(false)
const currentItem = ref({})

// 筛选和排序
const filterRarity = ref('')
const filterType = ref('')
const sortBy = ref('default')
const rarities = ref(['消费级', '工业级', '军规级', '受限', '保密', '隐秘', '非凡'])
const types = ref(['步枪', '手枪', '重型武器', '匕首', '手套', '印花', '音乐盒'])

// 稀有度顺序 (从高到低)
const rarityOrder = ['非凡', '隐秘', '保密', '受限', '军规级', '工业级', '消费级']

// 计算属性
const filteredUsers = computed(() => {
    return users.value.filter(user =>
        user.name.toLowerCase().includes(userSearch.value.toLowerCase())
    )
})


const filteredInventory = computed(() => {
    let result = [...inventory.value]

    // 按稀有度筛选
    if (filterRarity.value) {
        result = result.filter(item => item.rarity.name === filterRarity.value)
    }

    // 按类型筛选
    if (filterType.value) {
        result = result.filter(item => item.type.includes(filterType.value))
    }

    // 排序
    switch (sortBy.value) {
        case 'name-asc':
            result.sort((a, b) => a.market_hash_name.localeCompare(b.market_hash_name))
            break
        case 'name-desc':
            result.sort((a, b) => b.market_hash_name.localeCompare(a.market_hash_name))
            break
        case 'value-asc':
            result.sort((a, b) => (a.price || 0) - (b.price || 0))
            break
        case 'value-desc':
            result.sort((a, b) => (b.price || 0) - (a.price || 0))
            break
        case 'rarity-asc':
            result.sort((a, b) => rarityOrder.indexOf(a.rarity.name) - rarityOrder.indexOf(b.rarity.name))
            break
        case 'rarity-desc':
            result.sort((a, b) => rarityOrder.indexOf(b.rarity.name) - rarityOrder.indexOf(a.rarity.name))
            break
        default:
            // 默认排序保持原样
            break
    }

    return result
})

const estimatedTotalValue = computed(() => {
    return filteredInventory.value.reduce((total, item) => total + (item.price || 0), 0)
})

const rarestItem = computed(() => {
    if (inventory.value.length === 0) return null
    return [...inventory.value].sort((a, b) => {
        return rarityOrder.indexOf(b.rarity.name) - rarityOrder.indexOf(a.rarity.name)
    })[0]
})

const mostValuableItem = computed(() => {
    if (inventory.value.length === 0) return null
    return [...inventory.value].sort((a, b) => (b.price || 0) - (a.price || 0))[0]
})

// 方法  同时里面有备份信息的代码
const selectUser = (user) => {
    selectedUser.value = user
    steamId.value = user.steamId
    fetchInventory()
}

// const backUp = ()=>{
//     const { data } = await useFetch(`http://156.238.243.110:8080/api/inventory/${steamId.value}`)
// }
const fetchInventory = async () => {
    if (!steamId.value) return;

    loading.value = true;

    try {
        // ✅ 使用 $fetch 获取缓存数据
        const cached = await $fetch(`http://156.238.243.110:3003/api/getInventory/${steamId.value}`);

        const now = new Date();
        const updatedAt = cached?.updated_at ? new Date(cached.updated_at) : null;
        const isFresh = updatedAt && ((now.getTime() - updatedAt.getTime()) < 24 * 60 * 60 * 1000);
        const stock = cached.data.inventory

        // console.log('data',  stock )
        if (cached?.success && isFresh && stock && stock !== '[]') {
            const items = Array.isArray(cached.data.inventory) ? cached.data.inventory : [];
            inventory.value = items;
            inventoryCount.value = items.length;
            lastUpdated.value = cached.updated_at;
            console.log('📦 使用缓存库存数据');
        } else {
            // ✅ 使用 $fetch 请求主接口
            const apiRes = await $fetch(`http://156.238.243.110:8080/api/inventory/${steamId.value}`);
            rawInventoryData.value = apiRes;

            const extracted = extractInventoryItems(apiRes);
            inventory.value = extracted;
            inventoryCount.value = extracted.length;

            console.log('📦 使用接口数据');

            // ✅ 上传数据
            try {
                await $fetch(`http://156.238.243.110:3003/api/postInventory/${steamId.value}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: {
                        inventory: extracted,
                        count: extracted.length,
                    },
                });
            } catch (uploadError) {
                console.warn('⚠️ 上传库存失败（不影响展示）:', uploadError);
            }
        }
    } catch (error) {
        console.error('❌ 获取库存失败:', error);
        inventory.value = [];
        inventoryCount.value = 0;
    } finally {
        loading.value = false;
    }
};



const resetSearch = () => {
    steamId.value = ''
    inventory.value = []
    selectedUser.value = null
    filterRarity.value = ''
    filterType.value = ''
    sortBy.value = 'default'
}

const showItemDetail = (item) => {
    currentItem.value = item
    showModal.value = true
}

// 提取物品信息的函数
const extractInventoryItems = (rawData) => {
    if (!rawData?.data?.raw?.assets || !rawData?.data?.raw?.descriptions) {
        console.error('无效的库存数据结构')
        return []
    }

    return rawData.data.raw.assets.map((asset) => {
        const description = rawData.data.raw.descriptions.find(
            (desc) => desc.classid === asset.classid && desc.instanceid === asset.instanceid
        )

        if (!description) return null

        // 标签提取
        const rarityTag = description.tags?.find((t) => t.category === 'Rarity')
        const exteriorTag = description.tags?.find((t) => t.category === 'Exterior')
        const weaponTag = description.tags?.find((t) => t.category === 'Weapon')
        const typeTag = description.tags?.find((t) => t.category === 'Type')
        const tournamentTag = description.tags?.find((t) => t.category === 'Tournament')

        // 磨损值
        const wearDescription = description.descriptions?.find((d) => d.name === 'exterior_wear')
        const wear = wearDescription ? wearDescription.value.replace('外观: ', '') : null

        // 名称标签
        const nameTag = description.descriptions?.find((d) => d.name === 'nametag')
        const nametag = nameTag ? nameTag.value : null

        // 印花贴纸解析（支持图片与名称）
        const stickerInfo = description.descriptions?.find((d) => d.name === 'sticker_info')
        let stickers = []
        if (stickerInfo) {
            const matches = [...stickerInfo.value.matchAll(/<img[^>]+src="([^"]+)"[^>]+title="印花: ([^"]+)"/g)]
            stickers = matches.map(match => ({
                img: match[1].startsWith('http') ? match[1] : `https://steamcdn-a.akamaihd.net${match[1]}`,
                name: match[2]
            }))
        }

        // 最终构造返回的物品对象
        return {
            id: `${asset.assetid}-${asset.classid}-${asset.instanceid}`,
            assetid: asset.assetid,
            classid: asset.classid,
            instanceid: asset.instanceid,
            appid: asset.appid,
            name: description.market_name || description.name,
            market_hash_name: description.market_hash_name,
            type: typeTag?.localized_tag_name || description.type || '未知',
            icon_url: `https://steamcommunity-a.akamaihd.net/economy/image/${description.icon_url}`,
            rarity: {
                name: rarityTag?.localized_tag_name || '普通',
                color: rarityTag?.color || '#B0C3D9',
                internal_name: rarityTag?.internal_name || ''
            },
            exterior: {
                name: exteriorTag?.localized_tag_name || '',
                color: getExteriorColor(exteriorTag?.internal_name),
                internal_name: exteriorTag?.internal_name || ''
            },
            weapon: weaponTag?.localized_tag_name || null,
            wear,
            nametag,
            stickers,
            tournament: tournamentTag?.localized_tag_name || null,
            tradable: description.tradable === 1,
            marketable: description.marketable === 1,
            commodity: description.commodity === 1,
            name_color: description.name_color || '#D2D2D2',
            description: getItemDescription(description.descriptions),
            _raw: {
                asset,
                description
            }
        }
    }).filter(Boolean)
}


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

// 提取物品描述
const getItemDescription = (descriptions) => {
    if (!descriptions) return '暂无描述'

    // 查找第一个非空白、非属性的描述
    const desc = descriptions.find(d =>
        d.type === 'html' &&
        d.value.trim() !== '' &&
        !d.name?.endsWith('_wear') &&
        d.name !== 'nametag' &&
        d.name !== 'sticker_info' &&
        d.name !== 'keychain_info'
    )

    return desc?.value || '暂无描述'
}

// 初始化
onMounted(() => {
    if (props.id) {
        steamId.value = props.id
        fetchInventory()
    }
})

</script>

<style>
/* 自定义滚动条样式 */
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

::-webkit-scrollbar-thumb {
    background: #d1d1d1;
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: #b1b1b1;
}
</style>
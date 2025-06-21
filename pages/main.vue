<template>
    <div>
        <div class=" max-w-6xl mx-auto  bg-pink-200 mt-5 h-6">
            <div class="collapse-header flex justify-between items-center cursor-pointer">
                <span class="collapse-text text-base bg-pink-500 ml-2 rounded-lg">更多想法，请联系John526@163.com</span>
                <span class="collapse-arrow  bg-red-500 rounded-lg mr-2" @click="hideHeader">
                    点击关闭说明
                </span>
            </div>
        </div>


        <header class="max-w-6xl mx-auto  py-2" v-show="showHeader">
            <div class="bg-red-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
                <p class="font-semibold">使用须知：</p>
                <p>此页面 <strong>只使用您提供的 Steam64 ID</strong>，不会获取其他隐私内容。</p>
            </div>

            <div class="bg-gray-100 p-4 rounded mb-6">
                <h2 class="text-xl font-semibold mb-2">
                    <i class="fa-solid fa-circle-exclamation" style="color: #fe0101;"></i> &nbsp; &nbsp;什么是自定义 ID 和
                    Steam64 ID？
                </h2>

                <p class="mb-2">
                    自定义 ID 是您设置的个性化用户名，例如 ID 后面的自定义代码
                    <span class="text-red-600 font-semibold">gabelogannewell</span>：
                </p>
                <code class="bg-white px-2 py-1 rounded text-sm text-blue-600 block mb-2">
         https://steamcommunity.com/id/gabelogannewell
       </code>

                <p class="mb-4">
                    此自定义属性目前本站<strong>不支持直接转换</strong>，您可以前往
                    <a href="https://steamid.io/" class="text-blue-500 underline" target="_blank"
                        rel="noopener">steamid.io</a>
                    ，填入自定义 ID（如 <span class="text-red-600 font-semibold">gabelogannewell</span>）后，系统会自动显示对应的 Steam64
                    ID，复制后填写在下方输入框中。
                </p>

                <p class="mb-2">
                    而 Steam64 ID 是系统生成的一串数字，例如链接最后的 17 位数字：
                    <span class="text-blue-600 font-semibold">76561198825998777</span>
                </p>
                <code class="bg-white px-2 py-1 rounded text-sm text-green-600 block mb-4">
         https://steamcommunity.com/profiles/76561198825998777
       </code>

                <h2 class="text-lg font-semibold mb-2">
                    <i class="fa-solid fa-signs-post" style="color: #ff0000;"></i> &nbsp; &nbsp;如何查看自己的自定义 ID 或 Steam64
                    ID？
                </h2>
                <p>
                    打开 Steam 客户端，点击右上角的 <strong>“您的用户名” → “查看我的个人资料”</strong>，然后在浏览器地址栏中查看链接。如果是：
                </p>
                <ul class="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                    <li>
                        <code
                            class="bg-white px-1 py-0.5 rounded text-blue-600">https://steamcommunity.com/id/xxx</code>，其中
                        <code class="text-red-600">xxx</code> 就是您的<strong>自定义 ID</strong>
                    </li>
                    <li>
                        <code
                            class="bg-white px-1 py-0.5 rounded text-green-600">https://steamcommunity.com/profiles/12345678901234567</code>，
                        则结尾的 <code class="text-blue-600">17 位数字</code> 就是您的 <strong>Steam64 ID</strong>
                    </li>
                </ul>
            </div>
        </header>

        <div class="container mx-auto px-4 py-8 max-w-6xl">
            <h1 class="text-3xl font-bold text-center text-gray-800 mb-8">CS:GO 库存查看器</h1>

            <div class="flex space-x-2 w-full">
                <!-- 输入框，占 4 -->
                <input v-model="steamId"
                    class="flex-[4] px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="输入Steam64 ID 或 Steam 社区URL" @keyup.enter="fetchInventory" />

                <!-- 查询按钮，占 1 -->
                <button @click="fetchInventory"
                    class="flex-[1] px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    查询库存
                </button>

                <!-- 下拉选择，占 1 -->
                <div class="flex-[1] relative inline-block text-left" ref="dropdown">
                    <button @click="changeOpen"
                        class="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none">
                        {{ selectedUser ? selectedUser.name : '选择用户' }}
                        <svg class="w-5 h-5 ml-2 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <!-- 下拉菜单 -->
                    <div v-show="open"
                        class="absolute z-10 mt-2 w-64 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg">
                        <div v-for="user in users" :key="user.id"
                            class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-3"
                            @click="selectUser(user)">
                            <img :src="user.avatar" alt="avatar" class="w-8 h-8 rounded-full object-cover" />
                            <span class="text-gray-800">{{ user.name }}</span>
                        </div>
                    </div>
                </div>
            </div>


            <div v-if="loading" class="flex flex-col items-center justify-center py-12">
                <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p class="mt-4 text-gray-600">加载中...</p>
            </div>

            <div v-if="error" class="p-4 mb-6 bg-red-100 text-red-700 rounded-md">
                {{ error }}
            </div>

            <div v-if="inventory" class="space-y-6">
                <div class="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
                    <button v-for="(items, category) in inventory.categories" :key="category"
                        @click="activeCategory = category" :class="[
                            'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                            activeCategory === category
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        ]">
                        {{ category }} ({{ items.length }})
                    </button>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
                    <div v-for="item in inventory.categories[activeCategory]" :key="item.assetid"
                        class="relative bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                        @mouseenter="onItemMouseEnter(item)" @mouseleave="onItemMouseLeave" @click="onItemClick(item)">
                        <!-- 顶部磨损颜色条 -->
                        <div class="w-full h-2 transition-colors duration-300" :class="getWearColor(item.wear_grade)">
                        </div>

                        <!-- 图片区域 -->
                        <div class="relative w-full h-32 flex items-center justify-center bg-gray-50 dark:bg-slate-700">
                            <img :src="item.image" :alt="item.market_hash_name"
                                class="w-full h-full object-contain p-2 transition-opacity duration-300"
                                @load="imageLoaded(item.assetid)" @error="imageError(item.assetid)"
                                :class="{ 'opacity-0': !item.imageLoaded }" />
                            <div v-if="!item.imageLoaded" class="absolute inset-0 flex items-center justify-center">
                                <div class="animate-pulse flex space-x-4">
                                    <div class="rounded-full bg-gray-200 dark:bg-slate-600 h-8 w-8"></div>
                                </div>
                            </div>
                        </div>

                        <!-- 底部信息 -->
                        <div class="p-3 border-t border-gray-100 dark:border-gray-700">
                            <div class="flex justify-between items-start">
                                <div class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate flex-1">
                                    {{ item.skin || item.weapon }}
                                </div>
                                <div v-if="item.stattrak" class="ml-2 text-xs bg-red-500 text-white px-1 rounded">
                                    ST
                                </div>
                            </div>

                            <div class="flex justify-between items-center mt-2">
                                <div class="text-xs text-center text-white rounded px-2 py-0.5"
                                    :class="getWearColor(item.wear_grade)">
                                    {{ item.wear_name }}
                                </div>
                                <div v-if="item.price" class="text-xs font-semibold text-green-600 dark:text-green-400">
                                    ${{ formatPrice(item.price) }}
                                </div>
                            </div>

                            <div v-if="item.isNew"
                                class="absolute top-2 right-2 bg-blue-500 text-white text-xs px-1 rounded">
                                NEW
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Hover Detail Card -->
                <div v-if="hoveredItem" class="fixed z-50 pointer-events-none"
                    :style="{ top: `${mouseY}px`, left: `${mouseX}px` }" @mouseenter="clearTimeout(hoverTimeout)"
                    @mouseleave="onItemMouseLeave">
                    <div class="bg-white border rounded-lg shadow-xl w-64 p-4 pointer-events-auto">
                        <div class="flex gap-4">
                            <img :src="hoveredItem.image" class="w-20 h-20 object-contain" />
                            <div>
                                <div class="font-bold text-gray-900">{{ hoveredItem.market_hash_name }}</div>
                                <div class="text-sm mt-1" :class="getWearColor(hoveredItem.wear_grade)">
                                    {{ hoveredItem.wear_name }} ({{ hoveredItem.wear.toFixed(6) }})
                                </div>
                                <div class="text-xs text-gray-600 mt-1">分类: {{ hoveredItem.category }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useFetch } from '#app'

const steamId = ref('')
const loading = ref(false)
const error = ref('')
const inventory = ref(null)
const activeCategory = ref('Pistols')
const hoveredItem = ref(null)
let hoverTimeout = null
// 隐藏header
const showHeader = ref('1')
const hideHeader = () => {
    showHeader.value = !showHeader.value
}
const mouseX = ref(0)
const mouseY = ref(0)

const updateMousePosition = (e) => {
    const cardWidth = 260
    const cardHeight = 120
    const padding = 20

    const x = e.clientX + padding
    const y = e.clientY + padding

    const maxX = window.innerWidth - cardWidth
    const maxY = window.innerHeight - cardHeight

    mouseX.value = Math.min(x, maxX)
    mouseY.value = Math.min(y, maxY)
}

onMounted(() => {
    window.addEventListener('mousemove', updateMousePosition)
})

onBeforeUnmount(() => {
    window.removeEventListener('mousemove', updateMousePosition)
})

const fetchInventory = async () => {
    if (!steamId.value) {
        error.value = '请输入Steam64 ID'
        return
    }

    let id = steamId.value
    const match = id.match(/steamcommunity\.com\/profiles\/(\d+)/)
    if (match) id = match[1]

    if (id.includes('/id/')) {
        error.value = '暂不支持自定义 ID，请前往 steamid.io 获取 Steam64 ID'
        return
    }

    loading.value = true
    error.value = ''
    inventory.value = null

    try {
        // 这里的 URL 要改成你的后端接口地址
        const { data, error: fetchError } = await useFetch(`http://156.238.243.110:8080/api/inventory/${id}`)
        if (fetchError.value) {
            error.value = fetchError.value.message || '获取库存失败'
            return
        }

        if (data.value.success) {
            inventory.value = data.value.data.processed
            console.log(data.value)
            // 初始化每个物品的 imageLoaded 为 false
            Object.values(inventory.value.categories).forEach((items) => {
                items.forEach((item) => {
                    item.imageLoaded = false
                })
            })

            const firstNonEmptyCategory = Object.keys(inventory.value.categories).find(
                (cat) => inventory.value.categories[cat].length > 0
            )
            if (firstNonEmptyCategory) {
                activeCategory.value = firstNonEmptyCategory
            }
        } else {
            error.value = data.value.error || '获取库存失败'
        }
    } catch (err) {
        error.value = err.message || '发生错误'
    } finally {
        loading.value = false
    }
}

const imageLoaded = (assetid) => {
    const categoryItems = inventory.value?.categories[activeCategory.value]
    const item = categoryItems?.find((i) => i.assetid === assetid)
    if (item) item.imageLoaded = true
}

const imageError = (assetid) => {
    const categoryItems = inventory.value?.categories[activeCategory.value]
    const item = categoryItems?.find((i) => i.assetid === assetid)
    if (item) item.imageLoaded = false
}

const onItemMouseEnter = (item) => {
    clearTimeout(hoverTimeout)
    hoveredItem.value = item
}

const onItemMouseLeave = () => {
    hoverTimeout = setTimeout(() => {
        hoveredItem.value = null
    }, 300)
}

const getWearColor = (wearGrade) => {
    const colors = {
        1: 'bg-green-600',
        2: 'bg-blue-600',
        3: 'bg-yellow-600',
        4: 'bg-orange-600',
        5: 'bg-red-600',
    }
    return colors[wearGrade] || 'bg-gray-600'
}

const formatPrice = (price) => {
    if (!price) return '0.00'
    return Number(price).toFixed(2)
}

const onItemClick = (item) => {
    alert(`点击了物品: ${item.market_hash_name}`)
}
// 


const open = ref(false)
const dropdown = ref(null)
const selectedUser = ref(null) // 存储选中用户

const changeOpen = () => {
    open.value = !open.value
}

const selectUser = (user) => {
    selectedUser.value = {
        id: user.id,
        name: user.name,
        avatar: user.avatar
    }

    open.value = false
    console.log('选中用户信息：', selectedUser.value)
}

const handleClickOutside = (event) => {
    if (dropdown.value && !dropdown.value.contains(event.target)) {
        open.value = false
    }
}

onMounted(async () => {
    window.addEventListener('click', handleClickOutside)

    try {
        const res = await fetch('http://156.238.243.110/api/getUsers')
        const data = await res.json()
        users.value = data
    } catch (error) {
        console.error('获取用户失败:', error)
    }
})

onBeforeUnmount(() => {
    window.removeEventListener('click', handleClickOutside)
})

// const users = [
//     { id: 1, name: 'Alice', avatar: 'https://i.pravatar.cc/40?img=1' },
//     { id: 2, name: 'Bob', avatar: 'https://i.pravatar.cc/40?img=2' },
//     { id: 3, name: 'Charlie', avatar: 'https://i.pravatar.cc/40?img=3' },
//     { id: 4, name: 'David', avatar: 'https://i.pravatar.cc/40?img=4' },
//     { id: 5, name: 'Eve', avatar: 'https://i.pravatar.cc/40?img=5' },
//     { id: 6, name: 'Frank', avatar: 'https://i.pravatar.cc/40?img=6' },
// ]
</script>
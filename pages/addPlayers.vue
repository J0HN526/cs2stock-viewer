<template>
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">上传 Steam 玩家信息</h1>
      <NuxtLink to="/"> <el-button type="danger">返回主页</el-button></NuxtLink>
      
      <div class="bg-white shadow-md rounded-lg p-6 mb-6">
        <div class="mb-4">
          <span class="font-semibold">您的当前 IP:</span>
          <span class="ml-2 text-blue-600">{{ userIp }}</span>
        </div>
        
        <form @submit.prevent="submitForm" class="space-y-4">
          <!-- 玩家名称 -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">玩家名称 *</label>
            <input
              v-model="form.name"
              type="text"
              id="name"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="输入玩家名称"
            >
          </div>
          
          <!-- 头像URL -->
          <div>
            <label for="avata" class="block text-sm font-medium text-gray-700 mb-1">头像URL</label>
            <input
              v-model="form.avata"
              type="url"
              id="avata"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://example.com/avatar.jpg"
            >
          </div>
          
          <!-- SteamID64 -->
          <div>
            <label for="id64" class="block text-sm font-medium text-gray-700 mb-1">SteamID64 *</label>
            <input
              v-model="form.id64"
              type="text"
              id="id64"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="7656119xxxxxxxxxx"
            >
          </div>
          
          <!-- 玩家类型 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">玩家类型</label>
            <div class="space-y-2">
              <div class="flex items-center">
                <input
                  v-model="form.is_pro"
                  type="radio"
                  id="is_pro_yes"
                  name="is_pro"
                  :value="true"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                >
                <label for="is_pro_yes" class="ml-2 block text-sm text-gray-700">职业玩家</label>
              </div>
              <div class="flex items-center">
                <input
                  v-model="form.is_pro"
                  type="radio"
                  id="is_pro_no"
                  name="is_pro"
                  :value="false"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                >
                <label for="is_pro_no" class="ml-2 block text-sm text-gray-700">普通玩家</label>
              </div>
            </div>
          </div>
          
          <!-- 是否是倒狗 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">交易行为</label>
            <div class="space-y-2">
              <div class="flex items-center">
                <input
                  v-model="form.is_reseller"
                  type="radio"
                  id="is_reseller_yes"
                  name="is_reseller"
                  :value="true"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                >
                <label for="is_reseller_yes" class="ml-2 block text-sm text-gray-700">交易商/倒卖者</label>
              </div>
              <div class="flex items-center">
                <input
                  v-model="form.is_reseller"
                  type="radio"
                  id="is_reseller_no"
                  name="is_reseller"
                  :value="false"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                >
                <label for="is_reseller_no" class="ml-2 block text-sm text-gray-700">普通玩家</label>
              </div>
            </div>
          </div>
          
          <!-- 提交按钮 -->
          <div class="pt-4">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!isSubmitting">提交信息</span>
              <span v-else class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                提交中...
              </span>
            </button>
          </div>
        </form>
      </div>
      
      <!-- 成功提示 -->
      <div v-if="isSuccess" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
        <strong class="font-bold">成功！</strong>
        <span class="block sm:inline">玩家信息已成功添加。</span>
      </div>
      
      <!-- 错误提示 -->
      <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
        <strong class="font-bold">错误！</strong>
        <span class="block sm:inline">{{ errorMessage }}</span>
      </div>
    </div>
  </template>
  
  <script setup>
  const userIp = ref('获取中...')
  const form = ref({
    name: '',
    avata: '',
    id64: '',
    is_pro: false,
    is_reseller: false
  })
  const isSubmitting = ref(false)
  const isSuccess = ref(false)
  const errorMessage = ref('')
  
  onMounted(async () => {
    try {
      // 获取用户IP
      const ipResponse = await $fetch('https://api.ipify.org?format=json')
      userIp.value = ipResponse.ip
    } catch (error) {
      console.error('获取IP失败:', error)
      userIp.value = '未知'
    }
  })
  
  const submitForm = async () => {
    // 验证必填字段
    if (!form.value.name || !form.value.id64) {
      errorMessage.value = '请填写玩家名称和SteamID64'
      return
    }
  
    isSubmitting.value = true
    isSuccess.value = false
    errorMessage.value = ''
  
    try {
      const response = await $fetch('http://156.238.243.110:3003/api/player/add', {
        method: 'POST',
        body: {
          ...form.value,
          ip: userIp.value
        }
      })
  
      if (response.success) {
        isSuccess.value = true
        // 重置表单
        form.value = {
          name: '',
          avata: '',
          id64: '',
          is_pro: false,
          is_reseller: false
        }
      } else {
        errorMessage.value = response.message || '提交失败，请重试'
      }
    } catch (error) {
      console.error('提交失败:', error)
      errorMessage.value = error.data?.message || '网络错误，请稍后重试'
    } finally {
      isSubmitting.value = false
    }
  }
  </script>
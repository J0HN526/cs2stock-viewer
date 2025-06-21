export default defineNuxtConfig({
  ssr: false,
  app: {
    baseURL: '/cs2stock-viewer/', // 必须是你的 GitHub 仓库名，注意大小写
  },
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@element-plus/nuxt']
})

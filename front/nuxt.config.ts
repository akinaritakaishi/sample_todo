// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  nitro: {
    experimental: { openAPI: true },
    openAPI: {
      meta: {
        title: 'sample_todo API',
        description:
          'front/(Nuxtサーバー)が提供するAPI。ToDoタスクとチャットメッセージのCRUDを行う。各エンドポイントの仕様は対応するserver/api配下のファイルのdefineRouteMetaから生成される。',
        version: '1.0.0',
      },
      production: 'prerender',
    },
  },
})

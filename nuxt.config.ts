export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },

  // SPA không cần appManifest — tránh lỗi 404 /_nuxt/builds/meta/dev.json (dev) hoặc
  // latest.json thiếu khi deploy static nếu không copy đủ thư mục _nuxt/builds/.
  experimental: {
    appManifest: false,
  },

  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt", "@vueuse/nuxt"],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:8000",
      wsBase: process.env.NUXT_PUBLIC_WS_BASE || "ws://localhost:8000",
    },
  },

  app: {
    head: {
      title: "IDT — Integrated Development Technologies",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "theme-color", content: "#000000" },
      ],
      link: [
        { rel: "icon", type: "image/png", href: "/favicon.png" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap",
        },
      ],
    },
  },

  css: ["~/assets/css/main.css"],

  tailwindcss: {
    configPath: "~/tailwind.config.js",
  },

  imports: {
    dirs: ["composables"],
  },

  compatibilityDate: "2026-05-07",
});

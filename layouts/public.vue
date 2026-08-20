<template>
  <div class="min-h-screen bg-white dark:bg-gray-950">

    <!-- Top nav -->
    <nav
      class="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/90"
    >
      <div
        class="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 sm:px-8 lg:px-10"
      >
        <NuxtLink to="/" class="flex items-center">
          <AppLogo />
        </NuxtLink>

        <div class="flex items-center gap-2">
          <template v-if="authStore.isAuthenticated">
            <NuxtLink
              to="/dashboard"
              class="rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-orange-600"
            >
              Vào Dashboard
            </NuxtLink>
          </template>
          <template v-else>
            <NuxtLink
              to="/login"
              class="rounded-xl px-4 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Đăng nhập
            </NuxtLink>
            <NuxtLink
              to="/register"
              class="rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-orange-600"
            >
              Đăng ký
            </NuxtLink>
          </template>
        </div>
      </div>
    </nav>

    <slot />

  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
</script>

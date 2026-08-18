<template>
  <div class="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-dark-200 p-6">
    <div class="text-center max-w-md">
      <div class="w-24 h-24 mx-auto mb-6 relative">
        <div class="w-full h-full rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
          <span class="text-4xl font-black text-brand-600 dark:text-brand-400">404</span>
        </div>
        <div class="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center shadow-lg">
          <span class="text-white text-xs font-bold">!</span>
        </div>
      </div>

      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Không tìm thấy trang</h1>
      <p class="text-gray-500 dark:text-gray-400 mb-8">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </p>

      <div class="flex items-center justify-center gap-3">
        <button @click="$router.back()" class="btn-secondary">
          <ArrowLeftIcon class="w-4 h-4" />
          Quay lại
        </button>
        <NuxtLink to="/" class="btn-primary">
          <HomeIcon class="w-4 h-4" />
          Trang chủ
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeftIcon, HomeIcon } from '@heroicons/vue/24/outline'
definePageMeta({ layout: false })
</script>

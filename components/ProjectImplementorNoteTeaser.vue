<template>
  <div
    class="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 border-brand-100 dark:border-brand-900/40 bg-gradient-to-r from-brand-50/80 to-white dark:from-brand-950/25 dark:to-dark-100"
  >
    <div
      class="w-11 h-11 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-xl shrink-0"
      aria-hidden="true"
    >
      📌
    </div>
    <div class="flex-1 min-w-0">
      <h3 class="text-sm font-bold text-gray-900 dark:text-white">
        Implementor Note — Hướng dẫn dự án
      </h3>
      <p class="text-xs text-gray-500 mt-1 leading-relaxed">
        Tài liệu tổng hợp từ GitHub, BA (Drive) và Design (Figma). Xem trên
        <strong>trang riêng</strong> để đọc thoải mái, có mục lục — không chen trong tab ngắn.
      </p>
      <p v-if="generatedAt" class="text-[11px] text-gray-400 mt-1">
        Cập nhật {{ formatGeneratedAt(generatedAt) }}
        <span v-if="status === 'ready'" class="text-green-600 dark:text-green-400"> · Sẵn sàng</span>
        <span v-else-if="status === 'building'" class="text-amber-600"> · Đang tạo…</span>
      </p>
    </div>
    <NuxtLink
      :to="`/projects/${projectId}/implementor-note`"
      class="btn-primary btn-sm shrink-0 self-start sm:self-center"
    >
      Mở tài liệu dự án
      <ArrowRightIcon class="w-4 h-4" />
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { ArrowRightIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{ projectId: number }>()

const note = useProjectImplementorNote(() => props.projectId, { canRefresh: false })

const { generatedAt, status, formatGeneratedAt, load } = note

onMounted(load)
</script>

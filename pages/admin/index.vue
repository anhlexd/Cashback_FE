<template>
  <div class="max-w-4xl mx-auto px-4 py-6 sm:px-6 space-y-5">
    <div>
      <h1 class="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
        Quản trị
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Công cụ vận hành hệ thống cashback
      </p>
    </div>

    <div class="grid gap-3 sm:grid-cols-2">
      <NuxtLink
        v-for="tool in tools"
        :key="tool.to"
        :to="tool.to"
        class="flex items-start gap-3 rounded-2xl border border-surface-200 bg-white p-4 shadow-card transition hover:shadow-card-hover dark:border-dark-50 dark:bg-dark-100"
      >
        <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-300">
          <component :is="tool.icon" class="h-5 w-5" />
        </div>
        <div class="min-w-0">
          <div class="text-sm font-bold text-gray-900 dark:text-white">{{ tool.label }}</div>
          <div class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{{ tool.desc }}</div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DocumentArrowUpIcon, ArrowPathIcon, BanknotesIcon } from "@heroicons/vue/24/outline";

definePageMeta({ middleware: ["auth", "admin"] });

const tools = [
  {
    to: "/admin/shopee-upload",
    label: "Đối soát Shopee",
    desc: "Tải file CSV báo cáo chuyển đổi từ Shopee Affiliate để đồng bộ transaction & cashback",
    icon: DocumentArrowUpIcon,
  },
  {
    to: "/admin/sync",
    label: "Đồng bộ TikTok",
    desc: "Chạy thủ công việc lấy transaction TikTok mới nhất từ ACCESSTRADE",
    icon: ArrowPathIcon,
  },
  {
    to: "/admin/withdrawals",
    label: "Xử lý rút tiền",
    desc: "Duyệt, hoàn tất hoặc từ chối yêu cầu rút tiền của user",
    icon: BanknotesIcon,
  },
];
</script>

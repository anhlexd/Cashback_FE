<template>
  <div class="max-w-2xl mx-auto px-4 py-6 sm:px-6 space-y-5">
    <!-- Header -->
    <div class="flex items-center gap-2 text-xs text-gray-400">
      <NuxtLink to="/admin" class="hover:text-brand-600 dark:hover:text-brand-300">Quản trị</NuxtLink>
      <ChevronRightIcon class="h-3 w-3" />
      <span>Đồng bộ TikTok</span>
    </div>

    <div>
      <h1 class="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
        Đồng bộ TikTok
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Gọi ACCESSTRADE API để lấy transaction TikTok mới nhất. Tự động chạy mỗi
        15 phút qua Celery Beat, nút bên dưới dùng để chạy thủ công khi cần.
      </p>
    </div>

    <div class="rounded-2xl border border-surface-200 bg-white p-5 dark:border-dark-50 dark:bg-dark-100">
      <button
        type="button"
        :disabled="syncing"
        @click="runSync"
        class="w-full rounded-2xl bg-brand-500 py-3 text-sm font-extrabold tracking-wide text-white transition hover:bg-brand-600 disabled:opacity-50"
      >
        <span v-if="syncing" class="inline-flex items-center justify-center gap-2">
          <span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          Đang đồng bộ...
        </span>
        <span v-else>Đồng bộ ngay</span>
      </button>

      <div
        v-if="errorMessage"
        class="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300"
      >
        <ExclamationCircleIcon class="h-4 w-4 shrink-0 mt-0.5" />
        <span>{{ errorMessage }}</span>
      </div>

      <div v-if="result" class="mt-4 grid grid-cols-3 gap-2.5">
        <div class="rounded-2xl border border-surface-200 p-3.5 text-center dark:border-dark-50">
          <div class="text-[11px] text-gray-400">Lấy về</div>
          <div class="mt-1 text-lg font-black text-gray-900 dark:text-white">{{ result.total_fetched }}</div>
        </div>
        <div class="rounded-2xl border border-surface-200 p-3.5 text-center dark:border-dark-50">
          <div class="text-[11px] text-gray-400">Mới</div>
          <div class="mt-1 text-lg font-black text-emerald-600 dark:text-emerald-400">{{ result.created }}</div>
        </div>
        <div class="rounded-2xl border border-surface-200 p-3.5 text-center dark:border-dark-50">
          <div class="text-[11px] text-gray-400">Cập nhật</div>
          <div class="mt-1 text-lg font-black text-blue-600 dark:text-blue-400">{{ result.updated }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ExclamationCircleIcon, ChevronRightIcon } from "@heroicons/vue/24/outline";

definePageMeta({ middleware: ["auth", "admin"] });

const api = useApi();
const toast = useToast();

const syncing = ref(false);
const errorMessage = ref("");
const result = ref<any>(null);

async function runSync() {
  syncing.value = true;
  errorMessage.value = "";
  result.value = null;

  try {
    const res = await api.post<any>("/api/affiliate/transactions/sync/", { platform: "tiktok" });
    result.value = res.data;
    toast.success(res.message || "Đồng bộ transaction thành công");
  } catch (err: any) {
    const message = err?.data?.message || "Đồng bộ thất bại";
    errorMessage.value = message;
    toast.error(message);
  } finally {
    syncing.value = false;
  }
}
</script>

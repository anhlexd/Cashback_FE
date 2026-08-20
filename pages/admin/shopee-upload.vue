<template>
  <div class="max-w-3xl mx-auto px-4 py-6 sm:px-6 space-y-5">
    <!-- Header -->
    <div class="flex items-center gap-2 text-xs text-gray-400">
      <NuxtLink to="/admin" class="hover:text-brand-600 dark:hover:text-brand-300">Quản trị</NuxtLink>
      <ChevronRightIcon class="h-3 w-3" />
      <span>Đối soát Shopee</span>
    </div>

    <div>
      <h1 class="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
        Đối soát Shopee
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Tải file CSV báo cáo chuyển đổi từ Shopee Affiliate, hệ thống tự động khớp
        sub_id → user, tạo/cập nhật transaction và cashback
      </p>
    </div>

    <!-- Guide -->
    <div class="rounded-2xl border border-surface-200 bg-white p-4 dark:border-dark-50 dark:bg-dark-100">
      <div class="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
        <InformationCircleIcon class="h-4 w-4 text-brand-500" />
        Cách lấy file CSV
      </div>
      <ol class="mt-2.5 space-y-1 pl-5 text-xs text-gray-500 dark:text-gray-400 list-decimal">
        <li>Vào Shopee Affiliate (affiliate.shopee.vn)</li>
        <li>Báo cáo → Báo cáo chuyển đổi</li>
        <li>Chọn khoảng thời gian cần đối soát</li>
        <li>Xuất dữ liệu → Tải file .csv</li>
      </ol>
    </div>

    <!-- Upload zone -->
    <div class="rounded-2xl border border-surface-200 bg-white p-4 dark:border-dark-50 dark:bg-dark-100">
      <div
        class="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors"
        :class="dragOver
          ? 'border-brand-400 bg-brand-50/50 dark:border-brand-500 dark:bg-brand-950/20'
          : 'border-surface-200 dark:border-dark-50'"
        @dragover.prevent="dragOver = true"
        @dragleave.prevent="dragOver = false"
        @drop.prevent="handleDrop"
      >
        <DocumentArrowUpIcon class="h-8 w-8 text-gray-300 dark:text-gray-600" />

        <template v-if="!file">
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Kéo thả file CSV vào đây, hoặc
          </div>
          <button
            type="button"
            @click="fileInput?.click()"
            class="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300"
          >
            Chọn file từ máy
          </button>
          <div class="text-[11px] text-gray-400">Chỉ nhận file .csv, tối đa 10MB</div>
        </template>

        <template v-else>
          <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ file.name }}</div>
          <div class="text-[11px] text-gray-400">{{ formatSize(file.size) }}</div>
          <button
            type="button"
            @click="clearFile"
            class="mt-1 text-xs font-semibold text-rose-500 hover:text-rose-600"
          >
            Chọn file khác
          </button>
        </template>

        <input
          ref="fileInput"
          type="file"
          accept=".csv"
          class="hidden"
          @change="handleFileChange"
        />
      </div>

      <div
        v-if="clientError"
        class="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300"
      >
        <ExclamationCircleIcon class="h-4 w-4 shrink-0 mt-0.5" />
        <span>{{ clientError }}</span>
      </div>

      <button
        type="button"
        :disabled="!file || uploading"
        @click="submitUpload"
        class="mt-4 w-full rounded-2xl bg-brand-500 py-3 text-sm font-extrabold tracking-wide text-white transition hover:bg-brand-600 disabled:opacity-50"
      >
        <span v-if="uploading" class="inline-flex items-center justify-center gap-2">
          <span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          Đang xử lý...
        </span>
        <span v-else>Tải lên & xử lý</span>
      </button>
    </div>

    <!-- Result -->
    <div v-if="result" class="space-y-3">
      <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
        {{ resultMessage }}
      </div>

      <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div class="rounded-2xl border border-surface-200 bg-white p-3.5 text-center dark:border-dark-50 dark:bg-dark-100">
          <div class="text-[11px] text-gray-400">Tổng dòng</div>
          <div class="mt-1 text-lg font-black text-gray-900 dark:text-white">{{ result.total_rows }}</div>
        </div>
        <div class="rounded-2xl border border-surface-200 bg-white p-3.5 text-center dark:border-dark-50 dark:bg-dark-100">
          <div class="text-[11px] text-gray-400">Mới</div>
          <div class="mt-1 text-lg font-black text-emerald-600 dark:text-emerald-400">{{ result.created }}</div>
        </div>
        <div class="rounded-2xl border border-surface-200 bg-white p-3.5 text-center dark:border-dark-50 dark:bg-dark-100">
          <div class="text-[11px] text-gray-400">Cập nhật</div>
          <div class="mt-1 text-lg font-black text-blue-600 dark:text-blue-400">{{ result.updated }}</div>
        </div>
        <div class="rounded-2xl border border-surface-200 bg-white p-3.5 text-center dark:border-dark-50 dark:bg-dark-100">
          <div class="text-[11px] text-gray-400">Bỏ qua</div>
          <div class="mt-1 text-lg font-black text-amber-600 dark:text-amber-400">{{ result.skipped }}</div>
        </div>
      </div>

      <div v-if="result.errors?.length" class="rounded-2xl border border-surface-200 bg-white p-4 dark:border-dark-50 dark:bg-dark-100">
        <div class="text-xs font-bold text-gray-500 dark:text-gray-400">
          Lỗi ({{ result.errors.length }} dòng đầu tiên)
        </div>
        <div class="mt-2 divide-y divide-surface-100 dark:divide-dark-50">
          <div v-for="(e, i) in result.errors" :key="i" class="flex items-center justify-between gap-3 py-2 text-xs">
            <span class="font-mono text-gray-500 dark:text-gray-400">{{ e.order_id }}</span>
            <span class="text-rose-500 text-right">{{ e.error }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  DocumentArrowUpIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
  ChevronRightIcon,
} from "@heroicons/vue/24/outline";

definePageMeta({ middleware: ["auth", "admin"] });

const api = useApi();
const toast = useToast();

const MAX_SIZE = 10 * 1024 * 1024;

const fileInput = ref<HTMLInputElement | null>(null);
const file = ref<File | null>(null);
const dragOver = ref(false);
const clientError = ref("");
const uploading = ref(false);
const result = ref<any>(null);
const resultMessage = ref("");

function formatSize(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}

function validateAndSetFile(f: File | undefined) {
  clientError.value = "";
  result.value = null;
  if (!f) return;

  if (!f.name.toLowerCase().endsWith(".csv")) {
    clientError.value = "Chỉ chấp nhận file .csv";
    return;
  }
  if (f.size > MAX_SIZE) {
    clientError.value = "File không được vượt quá 10MB";
    return;
  }

  file.value = f;
}

function handleFileChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  validateAndSetFile(f);
}

function handleDrop(e: DragEvent) {
  dragOver.value = false;
  const f = e.dataTransfer?.files?.[0];
  validateAndSetFile(f);
}

function resetFileInput() {
  file.value = null;
  if (fileInput.value) fileInput.value.value = "";
}

function clearFile() {
  resetFileInput();
  clientError.value = "";
  result.value = null;
}

async function submitUpload() {
  if (!file.value) return;

  uploading.value = true;
  clientError.value = "";
  result.value = null;

  const formData = new FormData();
  formData.append("file", file.value);

  try {
    const res = await api.post<any>("/api/affiliate/transactions/shopee/upload-csv/", formData);
    result.value = res.data;
    resultMessage.value = res.message || "Import CSV hoàn tất";
    toast.success(resultMessage.value);
    resetFileInput();
  } catch (err: any) {
    const message = err?.data?.message || "Import CSV thất bại";
    clientError.value = message;
    toast.error(message);
  } finally {
    uploading.value = false;
  }
}
</script>

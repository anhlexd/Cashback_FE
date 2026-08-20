<template>
  <div class="max-w-4xl mx-auto px-4 py-6 sm:px-6 space-y-5">
    <!-- Header -->
    <div class="flex items-center gap-2 text-xs text-gray-400">
      <NuxtLink to="/admin" class="hover:text-brand-600 dark:hover:text-brand-300">Quản trị</NuxtLink>
      <ChevronRightIcon class="h-3 w-3" />
      <span>Xử lý rút tiền</span>
    </div>

    <div>
      <h1 class="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
        Xử lý yêu cầu rút tiền
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        PENDING → PROCESSING → COMPLETED, hoặc từ chối để tự động hoàn tiền về ví user
      </p>
    </div>

    <!-- Status tabs -->
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="t in statusTabs"
        :key="t.value"
        type="button"
        @click="setStatus(t.value)"
        class="rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors"
        :class="statusFilter === t.value
          ? 'bg-brand-500 text-white'
          : 'bg-surface-100 text-gray-500 hover:bg-surface-200 dark:bg-dark-50 dark:text-gray-400 dark:hover:bg-dark-100'"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading && items.length === 0" class="space-y-2.5">
      <div v-for="i in 4" :key="i" class="h-24 animate-pulse rounded-2xl bg-surface-100 dark:bg-dark-50" />
    </div>

    <!-- Empty -->
    <div
      v-else-if="!loading && items.length === 0"
      class="rounded-2xl border border-dashed border-surface-200 py-12 text-center text-sm text-gray-400 dark:border-dark-50"
    >
      Không có yêu cầu rút tiền nào
    </div>

    <!-- List -->
    <div v-else class="space-y-2.5">
      <div
        v-for="w in items"
        :key="w.id"
        class="rounded-2xl border border-surface-200 bg-white p-4 dark:border-dark-50 dark:bg-dark-100"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <StatusBadge kind="withdrawal" :status="w.status" />
              <span class="text-[11px] text-gray-400">{{ fmt.dateTime(w.created_at) }}</span>
            </div>
            <div class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              {{ w.withdrawal_method?.bank_code }} · {{ w.withdrawal_method?.account_number_masked }}
              <span v-if="w.withdrawal_method?.account_name"> · {{ w.withdrawal_method.account_name }}</span>
            </div>
            <div v-if="w.reject_reason" class="mt-1 text-[11px] text-rose-500">
              Lý do từ chối: {{ w.reject_reason }}
            </div>
            <div v-if="w.processed_at" class="mt-1 text-[11px] text-gray-400">
              Xử lý lúc: {{ fmt.dateTime(w.processed_at) }}
            </div>
          </div>
          <div class="shrink-0 text-right">
            <div class="text-sm font-extrabold text-gray-900 dark:text-white">{{ fmt.currency(w.amount) }}</div>
          </div>
        </div>

        <!-- Actions -->
        <div v-if="w.status === 'pending' || w.status === 'processing'" class="mt-3 flex items-center gap-2 border-t border-surface-100 pt-3 dark:border-dark-50">
          <button
            v-if="w.status === 'pending'"
            type="button"
            :disabled="busy[w.id]"
            @click="process(w)"
            class="rounded-xl bg-blue-500 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-blue-600 disabled:opacity-50"
          >
            Xử lý
          </button>
          <button
            v-if="w.status === 'processing'"
            type="button"
            :disabled="busy[w.id]"
            @click="complete(w)"
            class="rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50"
          >
            Hoàn tất
          </button>
          <button
            type="button"
            :disabled="busy[w.id]"
            @click="openReject(w)"
            class="rounded-xl border border-rose-200 px-3.5 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900/40 dark:hover:bg-rose-950/20"
          >
            Từ chối
          </button>
        </div>
      </div>

      <div class="pt-1 text-center">
        <button
          v-if="meta.next"
          type="button"
          :disabled="loading"
          @click="loadMore"
          class="btn-ghost btn-sm text-xs text-brand-600 disabled:opacity-50 dark:text-brand-300"
        >
          {{ loading ? "Đang tải..." : "Xem thêm" }}
        </button>
      </div>
    </div>

    <!-- Reject modal -->
    <div
      v-if="rejectTarget"
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      @click.self="closeReject"
    >
      <div class="w-full max-w-sm rounded-t-3xl bg-white p-5 shadow-modal dark:bg-dark-100 sm:rounded-3xl">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold text-gray-900 dark:text-white">Từ chối yêu cầu rút tiền</h3>
          <button @click="closeReject" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>

        <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Hệ thống sẽ tự động hoàn {{ fmt.currency(rejectTarget.amount) }} về ví của user.
        </p>

        <textarea
          v-model="rejectReason"
          rows="3"
          placeholder="Lý do từ chối (hiển thị cho user, không bắt buộc)"
          class="mt-3 w-full rounded-xl border border-surface-200 bg-white px-3 py-2.5 text-sm dark:border-dark-50 dark:bg-dark-100"
        />

        <button
          type="button"
          :disabled="busy[rejectTarget.id]"
          @click="submitReject"
          class="mt-4 w-full rounded-xl bg-rose-500 py-3 text-sm font-extrabold text-white transition hover:bg-rose-600 disabled:opacity-60"
        >
          {{ busy[rejectTarget.id] ? "Đang gửi..." : "Xác nhận từ chối" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronRightIcon, XMarkIcon } from "@heroicons/vue/24/outline";

definePageMeta({ middleware: ["auth", "admin"] });

const api = useApi();
const toast = useToast();
const fmt = useFormat();

const statusTabs = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "processing", label: "Đang xử lý" },
  { value: "completed", label: "Hoàn tất" },
  { value: "rejected", label: "Từ chối" },
];

const statusFilter = ref("pending");
const items = ref<any[]>([]);
const meta = reactive<{ next: string | null }>({ next: null });
const loading = ref(false);
const page = ref(1);
const busy = reactive<Record<string, boolean>>({});

async function fetchList(append = false) {
  loading.value = true;
  try {
    const res = await api.get<any>("/api/admin/withdrawals/", {
      status: statusFilter.value || undefined,
      page: page.value,
    });
    items.value = append ? [...items.value, ...(res.data || [])] : res.data || [];
    meta.next = res.metadata?.next ?? null;
  } catch (err: any) {
    toast.error(err?.data?.message || "Không tải được danh sách rút tiền");
  } finally {
    loading.value = false;
  }
}

function setStatus(status: string) {
  statusFilter.value = status;
  page.value = 1;
  fetchList(false);
}

function loadMore() {
  page.value += 1;
  fetchList(true);
}

function replaceItem(updated: any) {
  const idx = items.value.findIndex((i) => i.id === updated.id);
  if (idx === -1) return;
  // Nếu item không còn khớp filter hiện tại (vd đang xem tab "Chờ xử lý"
  // nhưng vừa chuyển sang processing) thì bỏ khỏi danh sách đang xem.
  if (statusFilter.value && updated.status !== statusFilter.value) {
    items.value.splice(idx, 1);
  } else {
    items.value[idx] = updated;
  }
}

async function process(w: any) {
  busy[w.id] = true;
  try {
    const res = await api.post<any>(`/api/admin/withdrawals/${w.id}/process/`);
    toast.success(res.message || "Đã chuyển sang xử lý");
    replaceItem(res.data);
  } catch (err: any) {
    toast.error(err?.data?.message || "Không chuyển được trạng thái");
  } finally {
    busy[w.id] = false;
  }
}

async function complete(w: any) {
  busy[w.id] = true;
  try {
    const res = await api.post<any>(`/api/admin/withdrawals/${w.id}/complete/`);
    toast.success(res.message || "Đã hoàn tất");
    replaceItem(res.data);
  } catch (err: any) {
    toast.error(err?.data?.message || "Không hoàn tất được");
  } finally {
    busy[w.id] = false;
  }
}

const rejectTarget = ref<any>(null);
const rejectReason = ref("");

function openReject(w: any) {
  rejectTarget.value = w;
  rejectReason.value = "";
}

function closeReject() {
  rejectTarget.value = null;
}

async function submitReject() {
  const w = rejectTarget.value;
  if (!w) return;
  busy[w.id] = true;
  try {
    const res = await api.post<any>(`/api/admin/withdrawals/${w.id}/reject/`, {
      reason: rejectReason.value.trim(),
    });
    toast.success(res.message || "Đã từ chối và hoàn tiền");
    replaceItem(res.data);
    closeReject();
  } catch (err: any) {
    toast.error(err?.data?.message || "Không từ chối được");
  } finally {
    busy[w.id] = false;
  }
}

onMounted(() => {
  fetchList();
});
</script>

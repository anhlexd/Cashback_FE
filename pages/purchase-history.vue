<template>
  <div class="max-w-4xl mx-auto px-4 py-6 sm:px-6 space-y-5">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
        Lịch sử mua hàng
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Theo dõi đơn hàng và hoàn tiền từ các sàn liên kết
      </p>
    </div>

    <!-- Tabs -->
    <div class="inline-flex rounded-2xl bg-surface-100 p-1 dark:bg-dark-50">
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        @click="activeTab = t.id"
        class="rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
        :class="activeTab === t.id
          ? 'bg-white text-brand-600 shadow-card dark:bg-dark-100 dark:text-brand-300'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- ================= ĐƠN HÀNG ================= -->
    <section v-if="activeTab === 'transactions'" class="space-y-4">
      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-2">
        <select
          v-model="txFilters.platform"
          @change="reloadTransactions"
          class="rounded-xl border border-surface-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 dark:border-dark-50 dark:bg-dark-100 dark:text-gray-300"
        >
          <option value="">Tất cả sàn</option>
          <option value="shopee">Shopee</option>
          <option value="tiktok">TikTok</option>
        </select>
        <select
          v-model="txFilters.status"
          @change="reloadTransactions"
          class="rounded-xl border border-surface-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 dark:border-dark-50 dark:bg-dark-100 dark:text-gray-300"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Từ chối</option>
        </select>
      </div>

      <!-- Loading skeleton -->
      <div v-if="txLoading && transactions.length === 0" class="space-y-2.5">
        <div v-for="i in 4" :key="i" class="h-20 animate-pulse rounded-2xl bg-surface-100 dark:bg-dark-50" />
      </div>

      <!-- Empty -->
      <div
        v-else-if="!txLoading && transactions.length === 0"
        class="rounded-2xl border border-dashed border-surface-200 py-12 text-center text-sm text-gray-400 dark:border-dark-50"
      >
        Chưa có đơn hàng nào
      </div>

      <!-- List -->
      <div v-else class="space-y-2.5">
        <button
          v-for="t in transactions"
          :key="t.id"
          type="button"
          @click="openTransaction(t.id)"
          class="w-full text-left rounded-2xl border border-surface-200 bg-white p-4 shadow-card transition hover:shadow-card-hover dark:border-dark-50 dark:bg-dark-100"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <PlatformBadge :platform="t.platform" />
                <StatusBadge kind="transaction" :status="t.status" />
              </div>
              <div class="mt-1.5 text-sm font-semibold text-gray-900 dark:text-white truncate">
                {{ t.order_id }}
              </div>
              <div class="text-xs text-gray-400">{{ fmt.dateTime(t.transaction_time || t.created_at) }}</div>
            </div>
            <div class="shrink-0 text-right">
              <div class="text-[11px] text-gray-400">Hoa hồng</div>
              <div class="text-sm font-extrabold text-brand-600 dark:text-brand-300">
                {{ fmt.currency(t.commission_amount) }}
              </div>
            </div>
          </div>
        </button>

        <div class="pt-1 text-center">
          <button
            v-if="txMeta.next"
            type="button"
            :disabled="txLoading"
            @click="loadMoreTransactions"
            class="btn-ghost btn-sm text-xs text-brand-600 disabled:opacity-50 dark:text-brand-300"
          >
            {{ txLoading ? "Đang tải..." : "Xem thêm" }}
          </button>
        </div>
      </div>
    </section>

    <!-- ================= HOÀN TIỀN ================= -->
    <section v-else class="space-y-4">
      <!-- Summary -->
      <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div
          v-for="s in summaryTiles"
          :key="s.key"
          class="rounded-2xl border border-surface-200 bg-white p-3.5 dark:border-dark-50 dark:bg-dark-100"
        >
          <div class="text-[11px] font-medium text-gray-400">{{ s.label }}</div>
          <div v-if="summaryLoading" class="mt-1.5 h-5 w-16 animate-pulse rounded bg-surface-100 dark:bg-dark-50" />
          <div v-else class="mt-1 text-sm font-extrabold" :class="s.color">
            {{ fmt.currency(summary[s.key]) }}
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="cbLoading && cashbacks.length === 0" class="space-y-2.5">
        <div v-for="i in 4" :key="i" class="h-20 animate-pulse rounded-2xl bg-surface-100 dark:bg-dark-50" />
      </div>

      <!-- Empty -->
      <div
        v-else-if="!cbLoading && cashbacks.length === 0"
        class="rounded-2xl border border-dashed border-surface-200 py-12 text-center text-sm text-gray-400 dark:border-dark-50"
      >
        Chưa có hoàn tiền nào
      </div>

      <!-- List -->
      <div v-else class="space-y-2.5">
        <button
          v-for="c in cashbacks"
          :key="c.id"
          type="button"
          @click="openCashback(c.id)"
          class="w-full text-left rounded-2xl border border-surface-200 bg-white p-4 shadow-card transition hover:shadow-card-hover dark:border-dark-50 dark:bg-dark-100"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <PlatformBadge :platform="c.platform" />
                <StatusBadge kind="cashback" :status="c.status" />
              </div>
              <div class="mt-1.5 truncate text-xs text-gray-400">{{ c.transaction_id }}</div>
              <div class="text-xs text-gray-400">{{ fmt.dateTime(c.created_at) }}</div>
            </div>
            <div class="shrink-0 text-right">
              <div class="text-[11px] text-gray-400">Hoàn tiền</div>
              <div class="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                +{{ fmt.currency(c.cashback_amount) }}
              </div>
            </div>
          </div>
        </button>

        <div class="pt-1 text-center">
          <button
            v-if="cbMeta.next"
            type="button"
            :disabled="cbLoading"
            @click="loadMoreCashbacks"
            class="btn-ghost btn-sm text-xs text-brand-600 disabled:opacity-50 dark:text-brand-300"
          >
            {{ cbLoading ? "Đang tải..." : "Xem thêm" }}
          </button>
        </div>
      </div>
    </section>

    <!-- Detail modal -->
    <div
      v-if="detail"
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      @click.self="closeDetail"
    >
      <div class="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-modal dark:bg-dark-100 sm:rounded-3xl">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold text-gray-900 dark:text-white">
            {{ detail.type === "transaction" ? "Chi tiết đơn hàng" : "Chi tiết hoàn tiền" }}
          </h3>
          <button @click="closeDetail" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>

        <div v-if="detailLoading" class="mt-6 space-y-2.5">
          <div v-for="i in 5" :key="i" class="h-4 w-full animate-pulse rounded bg-surface-100 dark:bg-dark-50" />
        </div>

        <dl v-else class="mt-4 divide-y divide-surface-100 dark:divide-dark-50">
          <template v-for="row in detailRows" :key="row.label">
            <div class="flex items-center justify-between py-2.5 text-sm">
              <dt class="text-gray-400">{{ row.label }}</dt>
              <dd class="font-semibold text-gray-900 dark:text-white">{{ row.value }}</dd>
            </div>
          </template>
        </dl>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { XMarkIcon } from "@heroicons/vue/24/outline";

definePageMeta({ middleware: "auth" });

const api = useApi();
const toast = useToast();
const fmt = useFormat();

const tabs = [
  { id: "transactions", label: "Đơn hàng" },
  { id: "cashback", label: "Hoàn tiền" },
];
const activeTab = ref<"transactions" | "cashback">("transactions");

// ---- Transactions ----
const transactions = ref<any[]>([]);
const txMeta = reactive<{ next: string | null; count: number }>({ next: null, count: 0 });
const txLoading = ref(false);
const txPage = ref(1);
const txFilters = reactive({ platform: "", status: "" });

async function fetchTransactions(append = false) {
  txLoading.value = true;
  try {
    const res = await api.get<any>("/api/affiliate/transactions/", {
      platform: txFilters.platform || undefined,
      status: txFilters.status || undefined,
      page: txPage.value,
    });
    transactions.value = append ? [...transactions.value, ...(res.data || [])] : res.data || [];
    txMeta.next = res.metadata?.next ?? null;
    txMeta.count = res.metadata?.count ?? transactions.value.length;
  } catch (err: any) {
    toast.error(err?.data?.message || "Không tải được đơn hàng");
  } finally {
    txLoading.value = false;
  }
}

function reloadTransactions() {
  txPage.value = 1;
  fetchTransactions(false);
}

function loadMoreTransactions() {
  txPage.value += 1;
  fetchTransactions(true);
}

// ---- Cashback ----
const cashbacks = ref<any[]>([]);
const cbMeta = reactive<{ next: string | null; count: number }>({ next: null, count: 0 });
const cbLoading = ref(false);
const cbPage = ref(1);

const summary = reactive<Record<string, string>>({
  pending: "0",
  approved: "0",
  paid: "0",
  total_cashback: "0",
});
const summaryLoading = ref(false);
const summaryTiles = [
  { key: "pending", label: "Chờ xử lý", color: "text-amber-600 dark:text-amber-400" },
  { key: "approved", label: "Đã duyệt", color: "text-emerald-600 dark:text-emerald-400" },
  { key: "paid", label: "Đã thanh toán", color: "text-blue-600 dark:text-blue-400" },
  { key: "total_cashback", label: "Tổng cộng", color: "text-gray-900 dark:text-white" },
];

async function fetchSummary() {
  summaryLoading.value = true;
  try {
    const res = await api.get<any>("/api/cashback/summary/");
    Object.assign(summary, res.data || {});
  } catch {
    // giữ giá trị mặc định
  } finally {
    summaryLoading.value = false;
  }
}

async function fetchCashbacks(append = false) {
  cbLoading.value = true;
  try {
    const res = await api.get<any>("/api/cashback/", { page: cbPage.value });
    cashbacks.value = append ? [...cashbacks.value, ...(res.data || [])] : res.data || [];
    cbMeta.next = res.metadata?.next ?? null;
    cbMeta.count = res.metadata?.count ?? cashbacks.value.length;
  } catch (err: any) {
    toast.error(err?.data?.message || "Không tải được hoàn tiền");
  } finally {
    cbLoading.value = false;
  }
}

function loadMoreCashbacks() {
  cbPage.value += 1;
  fetchCashbacks(true);
}

watch(activeTab, (tab) => {
  if (tab === "cashback" && cashbacks.value.length === 0 && !cbLoading.value) {
    fetchSummary();
    fetchCashbacks();
  }
});

// ---- Detail modal ----
const detail = ref<{ type: "transaction" | "cashback"; data: any } | null>(null);
const detailLoading = ref(false);

async function openTransaction(id: string) {
  detail.value = { type: "transaction", data: null };
  detailLoading.value = true;
  try {
    const res = await api.get<any>(`/api/affiliate/transactions/${id}/`);
    detail.value = { type: "transaction", data: res.data };
  } catch (err: any) {
    toast.error(err?.data?.message || "Không tải được chi tiết đơn hàng");
    detail.value = null;
  } finally {
    detailLoading.value = false;
  }
}

async function openCashback(id: string) {
  detail.value = { type: "cashback", data: null };
  detailLoading.value = true;
  try {
    const res = await api.get<any>(`/api/cashback/${id}/`);
    detail.value = { type: "cashback", data: res.data };
  } catch (err: any) {
    toast.error(err?.data?.message || "Không tải được chi tiết hoàn tiền");
    detail.value = null;
  } finally {
    detailLoading.value = false;
  }
}

function closeDetail() {
  detail.value = null;
}

const detailRows = computed(() => {
  if (!detail.value?.data) return [];
  const d = detail.value.data;
  if (detail.value.type === "transaction") {
    return [
      { label: "Mã đơn hàng", value: d.order_id },
      { label: "Mã sản phẩm", value: d.product_id },
      { label: "Sàn", value: d.platform },
      { label: "Giá trị đơn hàng", value: fmt.currency(d.order_value) },
      { label: "Hoa hồng", value: fmt.currency(d.commission_amount) },
      { label: "Trạng thái", value: d.status },
      { label: "Thời gian đặt hàng", value: fmt.dateTime(d.transaction_time) },
      { label: "Tạo lúc", value: fmt.dateTime(d.created_at) },
    ];
  }
  return [
    { label: "Mã transaction", value: d.transaction_id },
    { label: "Sàn", value: d.platform },
    { label: "Hoa hồng", value: fmt.currency(d.commission_amount) },
    { label: "Hoàn tiền", value: fmt.currency(d.cashback_amount) },
    { label: "Platform giữ lại", value: fmt.currency(d.platform_profit) },
    { label: "Trạng thái", value: d.status },
    { label: "Sẵn sàng rút lúc", value: d.available_at ? fmt.dateTime(d.available_at) : "—" },
    { label: "Tạo lúc", value: fmt.dateTime(d.created_at) },
  ];
});

onMounted(() => {
  fetchTransactions();
});
</script>

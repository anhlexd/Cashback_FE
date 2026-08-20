<template>
  <div class="max-w-4xl mx-auto px-4 py-6 sm:px-6 space-y-6">
    <!-- Hero -->
    <div
      class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-500 to-[#ff4b0b] p-5 text-white shadow-[0_20px_50px_-20px_rgba(255,87,34,.45)] sm:p-6"
    >
      <div class="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
      <div class="pointer-events-none absolute -bottom-14 -left-8 h-36 w-36 rounded-full bg-white/10 blur-3xl" />

      <div class="relative flex items-center gap-3">
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/15 backdrop-blur-sm">
          <CubeIcon class="h-5 w-5" />
        </span>
        <div class="min-w-0">
          <h1 class="text-lg font-black tracking-tight sm:text-xl">Lịch sử mua hàng</h1>
          <p class="mt-0.5 text-xs text-white/75">Theo dõi tiến trình hoàn tiền từ các đơn hàng của bạn</p>
        </div>
      </div>

      <div class="relative mt-5 grid grid-cols-2 gap-3">
        <div class="rounded-2xl bg-white/15 p-3.5 backdrop-blur-sm">
          <div class="text-[10px] font-bold uppercase tracking-wider text-white/70">Đơn hàng</div>
          <div v-if="txLoading && transactions.length === 0" class="mt-1.5 h-7 w-10 animate-pulse rounded-lg bg-white/20" />
          <div v-else class="mt-1 text-2xl font-black tracking-tight">{{ txMeta.count }}</div>
        </div>
        <div class="rounded-2xl bg-white/15 p-3.5 backdrop-blur-sm">
          <div class="text-[10px] font-bold uppercase tracking-wider text-white/70">Đang chờ xử lý</div>
          <div v-if="summaryLoading" class="mt-1.5 h-7 w-16 animate-pulse rounded-lg bg-white/20" />
          <div v-else class="mt-1 flex items-baseline gap-1 text-2xl font-black tracking-tight">
            {{ formatCoin(summary.pending) }} <span class="text-base">🪙</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="inline-flex w-full gap-1 rounded-2xl bg-surface-100 p-1 dark:bg-dark-50 sm:w-auto">
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        @click="activeTab = t.id"
        class="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all sm:flex-none"
        :class="activeTab === t.id
          ? 'bg-white text-brand-600 shadow-card dark:bg-dark-100 dark:text-brand-300'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'"
      >
        <component :is="t.icon" class="h-4 w-4" />
        {{ t.label }}
        <span
          v-if="t.id === 'viewed'"
          class="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
          :class="activeTab === t.id ? 'bg-brand-500 text-white' : 'bg-surface-200 text-gray-500 dark:bg-dark-100 dark:text-gray-400'"
        >
          {{ mockViewed.length }}
        </span>
      </button>
    </div>

    <!-- ================= ĐƠN HÀNG ================= -->
    <section v-if="activeTab === 'transactions'" key="transactions" class="animate-fade-in space-y-4">
      <!-- Filters -->
      <div class="space-y-2">
        <div class="flex items-center gap-2 overflow-x-auto pb-0.5">
          <button
            v-for="p in platformOptions"
            :key="p.value"
            type="button"
            @click="setPlatformFilter(p.value)"
            class="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors"
            :class="txFilters.platform === p.value
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
              : 'bg-surface-100 text-gray-500 hover:bg-surface-200 dark:bg-dark-50 dark:text-gray-400 dark:hover:bg-dark-100'"
          >
            {{ p.label }}
          </button>
        </div>
        <div class="flex items-center gap-2 overflow-x-auto pb-0.5">
          <button
            v-for="s in statusOptions"
            :key="s.value"
            type="button"
            @click="setStatusFilter(s.value)"
            class="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors"
            :class="txFilters.status === s.value
              ? 'bg-brand-500 text-white'
              : 'bg-surface-100 text-gray-500 hover:bg-surface-200 dark:bg-dark-50 dark:text-gray-400 dark:hover:bg-dark-100'"
          >
            {{ s.label }}
          </button>
        </div>
      </div>

      <!-- Loading skeleton -->
      <div v-if="txLoading && transactions.length === 0" class="space-y-2.5">
        <div v-for="i in 4" :key="i" class="h-20 animate-pulse rounded-2xl bg-surface-100 dark:bg-dark-50" />
      </div>

      <!-- Empty -->
      <EmptyState v-else-if="!txLoading && transactions.length === 0" :icon="InboxIcon" text="Chưa có đơn hàng nào" />

      <!-- List -->
      <div v-else class="space-y-2.5">
        <button
          v-for="t in transactions"
          :key="t.id"
          type="button"
          @click="openTransaction(t.id)"
          class="group w-full rounded-2xl border border-surface-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover dark:border-dark-50 dark:bg-dark-100 dark:hover:border-brand-900/60"
        >
          <div class="flex items-center gap-3">
            <div
              class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-transform group-hover:scale-105"
              :class="platformAvatar(t.platform)"
            >
              <ShoppingBagIcon class="h-5 w-5" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="truncate text-sm font-bold text-gray-900 dark:text-white">{{ t.order_id }}</span>
              </div>
              <div class="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                <PlatformBadge :platform="t.platform" />
                <span>{{ fmt.dateTime(t.transaction_time || t.created_at) }}</span>
              </div>
            </div>
            <div class="shrink-0 text-right">
              <div class="text-sm font-extrabold text-brand-600 dark:text-brand-300">
                {{ fmt.currency(t.commission_amount) }}
              </div>
              <StatusBadge kind="transaction" :status="t.status" class="mt-1" />
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
    <section v-else-if="activeTab === 'cashback'" key="cashback" class="animate-fade-in space-y-4">
      <!-- Summary -->
      <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div
          v-for="s in summaryTiles"
          :key="s.key"
          class="rounded-2xl border border-surface-200 bg-white p-3.5 dark:border-dark-50 dark:bg-dark-100"
        >
          <div class="flex items-center gap-1.5">
            <span class="grid h-6 w-6 shrink-0 place-items-center rounded-lg" :class="s.iconBg">
              <component :is="s.icon" class="h-3.5 w-3.5" />
            </span>
            <span class="text-[11px] font-medium text-gray-400">{{ s.label }}</span>
          </div>
          <div v-if="summaryLoading" class="mt-2 h-5 w-16 animate-pulse rounded bg-surface-100 dark:bg-dark-50" />
          <div v-else class="mt-1.5 text-sm font-extrabold" :class="s.color">
            {{ fmt.currency(summary[s.key]) }}
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="cbLoading && cashbacks.length === 0" class="space-y-2.5">
        <div v-for="i in 4" :key="i" class="h-20 animate-pulse rounded-2xl bg-surface-100 dark:bg-dark-50" />
      </div>

      <!-- Empty -->
      <EmptyState v-else-if="!cbLoading && cashbacks.length === 0" :icon="BanknotesIcon" text="Chưa có hoàn tiền nào" />

      <!-- List -->
      <div v-else class="space-y-2.5">
        <button
          v-for="c in cashbacks"
          :key="c.id"
          type="button"
          @click="openCashback(c.id)"
          class="group w-full rounded-2xl border border-surface-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover dark:border-dark-50 dark:bg-dark-100 dark:hover:border-brand-900/60"
        >
          <div class="flex items-center gap-3">
            <div
              class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-transform group-hover:scale-105"
              :class="platformAvatar(c.platform)"
            >
              <BanknotesIcon class="h-5 w-5" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="truncate text-sm font-bold text-gray-900 dark:text-white">{{ c.transaction_id }}</div>
              <div class="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                <PlatformBadge :platform="c.platform" />
                <span>{{ fmt.dateTime(c.created_at) }}</span>
              </div>
            </div>
            <div class="shrink-0 text-right">
              <div class="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                +{{ fmt.currency(c.cashback_amount) }}
              </div>
              <StatusBadge kind="cashback" :status="c.status" class="mt-1" />
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

    <!-- ================= ĐÃ XEM (demo) ================= -->
    <section v-else key="viewed" class="animate-fade-in space-y-2.5">
      <EmptyState v-if="mockViewed.length === 0" :icon="EyeIcon" text="Chưa có sản phẩm nào đã xem" />

      <div
        v-for="item in mockViewed"
        :key="item.id"
        class="rounded-2xl border border-surface-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-card-hover dark:border-dark-50 dark:bg-dark-100"
      >
        <div class="text-xs text-gray-400">{{ item.viewedAt }}</div>

        <div class="mt-2 flex gap-3">
          <div class="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl" :class="item.accent">
            <div class="grid h-full w-full place-items-center">
              <ShoppingCartIcon class="h-7 w-7 opacity-60" />
            </div>
            <div class="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-orange-500 text-white ring-2 ring-white dark:ring-dark-100">
              <ShoppingBagIcon class="h-3.5 w-3.5" />
            </div>
          </div>

          <div class="min-w-0 flex-1">
            <div class="text-sm font-bold leading-5 text-gray-900 line-clamp-2 dark:text-white">
              {{ item.name }}
            </div>
            <div class="mt-1 flex items-center gap-1 text-xs text-gray-400">
              <BuildingStorefrontIcon class="h-3.5 w-3.5" />
              {{ item.shop }}
            </div>
          </div>
        </div>

        <div class="mt-3 flex items-center justify-between rounded-xl bg-surface-50 px-3.5 py-2.5 dark:bg-dark-50">
          <div>
            <div class="text-[10px] font-bold uppercase tracking-wide text-gray-400">Giá mua</div>
            <div class="mt-0.5 text-sm font-extrabold text-gray-900 dark:text-white">
              {{ fmt.currency(item.price) }}
            </div>
          </div>
          <div class="text-right">
            <div class="text-[10px] font-bold uppercase tracking-wide text-gray-400">Dự kiến hoàn lại</div>
            <div class="mt-0.5 text-sm font-extrabold text-orange-500">
              +{{ formatCoin(item.estimatedCashback) }} 🪙
            </div>
          </div>
        </div>

        <div class="mt-3 flex items-center justify-between">
          <span
            v-if="item.expired"
            class="inline-flex items-center gap-1 rounded-full bg-surface-100 px-2.5 py-1 text-[11px] font-medium text-gray-400 dark:bg-dark-50"
          >
            <ClockIcon class="h-3.5 w-3.5" />
            Hết hạn
          </span>
          <span
            v-else
            class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
          >
            <ClockIcon class="h-3.5 w-3.5" />
            Còn {{ item.daysLeft }} ngày
          </span>

          <a
            :href="item.link"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-1 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            <ArrowTopRightOnSquareIcon class="h-3.5 w-3.5" />
            Mua lại
          </a>
        </div>
      </div>
    </section>

    <!-- Detail modal -->
    <div
      v-if="detail"
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      @click.self="closeDetail"
    >
      <div class="w-full max-w-md animate-scale-in rounded-t-3xl bg-white p-5 shadow-modal dark:bg-dark-100 sm:rounded-3xl">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span
              class="grid h-9 w-9 place-items-center rounded-xl"
              :class="detail.type === 'transaction' ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-300' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'"
            >
              <component :is="detail.type === 'transaction' ? ShoppingBagIcon : BanknotesIcon" class="h-5 w-5" />
            </span>
            <h3 class="text-base font-bold text-gray-900 dark:text-white">
              {{ detail.type === "transaction" ? "Chi tiết đơn hàng" : "Chi tiết hoàn tiền" }}
            </h3>
          </div>
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
import {
  XMarkIcon,
  CubeIcon,
  ClockIcon,
  ShoppingCartIcon,
  ShoppingBagIcon,
  BuildingStorefrontIcon,
  ArrowTopRightOnSquareIcon,
  BanknotesIcon,
  EyeIcon,
  InboxIcon,
  CheckBadgeIcon,
  WalletIcon,
} from "@heroicons/vue/24/outline";

definePageMeta({ middleware: "auth" });

const api = useApi();
const toast = useToast();
const fmt = useFormat();

function formatCoin(value: string | number | null | undefined) {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("vi-VN").format(Number.isFinite(n) ? n : 0);
}

function platformAvatar(platform: string) {
  if (platform === "shopee") {
    return "bg-orange-50 text-orange-500 dark:bg-orange-950/30 dark:text-orange-400";
  }
  if (platform === "tiktok") {
    return "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/30 dark:text-cyan-400";
  }
  return "bg-surface-100 text-gray-400 dark:bg-dark-50 dark:text-gray-500";
}

const tabs = [
  { id: "transactions", label: "Đơn hàng", icon: CubeIcon },
  { id: "cashback", label: "Hoàn tiền", icon: BanknotesIcon },
  { id: "viewed", label: "Đã xem", icon: EyeIcon },
];
const activeTab = ref<"transactions" | "cashback" | "viewed">("transactions");

const platformOptions = [
  { value: "", label: "Tất cả sàn" },
  { value: "shopee", label: "Shopee" },
  { value: "tiktok", label: "TikTok" },
];
const statusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
];

// Dữ liệu demo cho tab "Đã xem" — chưa có API list AffiliateClick/sản phẩm đã
// xem, tạm hardcode để lên giao diện theo design, nối API thật khi có endpoint.
const mockViewed = [
  {
    id: 1,
    name: "XPPen Deco 640 Bút Máy Tính Bảng Đồ Hoạ Vẽ Máy Tính Bảng Vẽ Kỹ Thuật Số Với Áp Lực 16k Tốt Cho OSU",
    shop: "XPPen Official Shop",
    viewedAt: "15:29 04-08",
    price: 658999,
    estimatedCashback: 28666,
    expired: true,
    link: "#",
    accent: "bg-slate-100 text-slate-400 dark:bg-slate-800/60",
  },
  {
    id: 2,
    name: "Sữa tắm gội trẻ em tinh chất hoa cúc (Cetaphil Baby Wash&Shampoo) 400ml",
    shop: "Con Cưng Official Store",
    viewedAt: "14:40 04-08",
    price: 278480,
    estimatedCashback: 9690,
    expired: true,
    link: "#",
    accent: "bg-pink-50 text-pink-300 dark:bg-pink-950/30",
  },
  {
    id: 3,
    name: "Sữa tắm gội trẻ em tinh chất hoa cúc (Cetaphil Baby Wash&Shampoo) 400ml",
    shop: "Con Cưng Official Store",
    viewedAt: "10:12 03-08",
    price: 278480,
    estimatedCashback: 9690,
    expired: false,
    daysLeft: 6,
    link: "#",
    accent: "bg-pink-50 text-pink-300 dark:bg-pink-950/30",
  },
  {
    id: 4,
    name: "Bàn phím cơ AKKO 3068B Plus Bluetooth 5.0 hotswap",
    shop: "AKKO Official Store",
    viewedAt: "09:03 02-08",
    price: 890000,
    estimatedCashback: 35600,
    expired: false,
    daysLeft: 2,
    link: "#",
    accent: "bg-indigo-50 text-indigo-300 dark:bg-indigo-950/30",
  },
];

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

function setPlatformFilter(value: string) {
  txFilters.platform = value;
  reloadTransactions();
}

function setStatusFilter(value: string) {
  txFilters.status = value;
  reloadTransactions();
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
  { key: "pending", label: "Chờ xử lý", color: "text-amber-600 dark:text-amber-400", icon: ClockIcon, iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400" },
  { key: "approved", label: "Đã duyệt", color: "text-emerald-600 dark:text-emerald-400", icon: CheckBadgeIcon, iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" },
  { key: "paid", label: "Đã thanh toán", color: "text-blue-600 dark:text-blue-400", icon: WalletIcon, iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400" },
  { key: "total_cashback", label: "Tổng cộng", color: "text-gray-900 dark:text-white", icon: BanknotesIcon, iconBg: "bg-surface-100 text-gray-500 dark:bg-dark-50 dark:text-gray-400" },
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
  fetchSummary();
});
</script>

<template>
  <div
    class="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
  >
    <div class="w-full max-w-3xl mx-auto px-5 py-6 sm:px-7 sm:py-8 space-y-5">
      <!-- Header -->
      <div>
        <h1
          class="flex items-center gap-2 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
        >
          Mua sắm online
          <ShoppingCartIcon class="w-6 h-6 text-brand-600" />
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Tự động tích lũy hoàn tiền vào tài khoản
        </p>
      </div>

      <!-- Balance cards -->
      <div class="grid grid-cols-2 gap-3">
        <div class="card p-4">
          <div
            class="text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5"
          >
            MOON khả dụng
          </div>
          <div class="flex items-center gap-1.5">
            <span
              v-if="statsLoading"
              class="h-6 w-16 bg-surface-100 dark:bg-dark-50 rounded animate-pulse"
            ></span>
            <span v-else class="text-xl font-bold text-brand-600">{{
              formatNumber(wallet.available)
            }}</span>
            <span class="text-base">🪙</span>
          </div>
        </div>
        <div class="card p-4">
          <div
            class="text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5"
          >
            Đang chờ xử lý
          </div>
          <div class="flex items-center gap-1.5">
            <span
              v-if="statsLoading"
              class="h-6 w-10 bg-surface-100 dark:bg-dark-50 rounded animate-pulse"
            ></span>
            <span
              v-else
              class="text-xl font-bold text-gray-900 dark:text-white"
              >{{ formatNumber(wallet.pending) }}</span
            >
            <span class="text-base opacity-70">🪙</span>
          </div>
        </div>
      </div>
      <!-- Header -->
      <header>
        <p
          class="text-[15px] sm:text-base leading-6 text-gray-600 dark:text-gray-300"
        >
          Cập nhật voucher, mã giảm giá liên tục mỗi giờ. Rút tiền về ngân hàng
          24/7 nhanh chóng.
        </p>
      </header>

      <!-- Affiliate link -->
      <section class="space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <p class="text-xs">DÁN LINH SẢN PHẨM :</p>
            <div
              class="flex items-center justify-between gap-1.5 text-[9px] font-bold"
            >
              <span class="px-1.5 py-0.5 rounded bg-orange-50 text-orange-500"
                >Shopee</span
              >
              <span class="px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-500"
                >TikTok</span
              >
              <span class="px-1.5 py-0.5 rounded bg-pink-50 text-pink-500"
                >Lazada</span
              >
              <span class="px-1.5 py-0.5 rounded bg-orange-50 text-orange-600"
                >ShopeeFood</span
              >
            </div>
          </div>
          <button
            type="button"
            @click="showHelp = true"
            class="flex items-center gap-1.5 text-xs font-medium text-orange-500 hover:text-orange-600 dark:hover:text-gray-200"
          >
            Cách lấy link sản phẩm
            <QuestionMarkCircleIcon class="w-3.5 h-3.5" />
          </button>
        </div>

        <form
          @submit.prevent="handleSubmit"
          class="flex items-center w-full h-11 p-1 rounded-2xl border border-gray-200 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100 dark:border-gray-700 dark:bg-gray-900 dark:focus-within:border-orange-500 dark:focus-within:ring-orange-950/40"
        >
          <input
            v-model="productUrl"
            type="url"
            placeholder="Dán link sản phẩm Shopee, TikTok, Lazada hoặc ShopeeFood..."
            class="min-w-0 flex-1 h-full px-4 bg-transparent border-0 outline-none text-[12px] sm:text-[13px] text-gray-700 placeholder:text-gray-400 focus:border-0 focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-gray-500"
          />

          <button
            type="submit"
            :disabled="submitting"
            class="h-9 shrink-0 px-5 sm:px-6 rounded-xl bg-gray-50 border border-gray-100 text-[10px] sm:text-[11px] font-bold tracking-wide text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <span
              v-if="submitting"
              class="inline-block w-3.5 h-3.5 mr-1.5 align-[-2px] border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"
            />

            <span v-else> KIỂM TRA HOÀN TIỀN </span>
          </button>
        </form>

        <div
          v-if="error"
          class="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
        >
          <ExclamationCircleIcon class="w-4 h-4 shrink-0 mt-0.5" />
          <span>{{ error }}</span>
        </div>
      </section>

      <!-- Product result -->
      <section
        v-if="result"
        class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:border-gray-800 dark:bg-gray-900"
      >
        <div class="p-4 sm:p-5">
          <!-- Product info -->
          <div class="flex gap-3">
            <div
              class="w-16 h-16 sm:w-[68px] sm:h-[68px] shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800"
            >
              <img
                v-if="result.product_info?.image"
                :src="result.product_info.image"
                alt=""
                class="w-full h-full object-cover"
              />

              <div
                v-else
                class="w-full h-full grid place-items-center text-gray-300"
              >
                <ShoppingCartIcon class="w-7 h-7" />
              </div>
            </div>

            <div class="min-w-0 flex-1 pr-2">
              <div
                class="text-[15px] font-semibold leading-5 text-gray-900 dark:text-white line-clamp-2"
              >
                {{ result.product_info?.name || "Sản phẩm Shopee" }}
              </div>

              <div
                v-if="result.product_info?.shop_name"
                class="mt-1 text-[11px] text-gray-500 dark:text-gray-400"
              >
                Gian hàng:
                <span class="font-medium text-gray-700 dark:text-gray-300">
                  {{ result.product_info.shop_name }}
                </span>
              </div>

              <div
                v-if="
                  result.product_info?.rating || result.product_info?.sold_count
                "
                class="mt-1 flex items-center gap-2 text-[11px] text-gray-400"
              >
                <span
                  v-if="result.product_info?.rating"
                  class="inline-flex items-center gap-0.5 text-orange-500"
                >
                  <StarIcon class="w-3 h-3 fill-current" />
                  {{ result.product_info.rating }}
                </span>

                <span v-if="result.product_info?.sold_count">
                  · Đã bán {{ formatNumber(result.product_info.sold_count) }}+
                </span>
              </div>
            </div>
          </div>

          <!-- Price summary -->
          <div
            v-if="
              result.product_info?.original_price ||
              result.product_info?.estimated_cashback
            "
            class="mt-5 grid grid-cols-2 gap-4 border-t border-dashed border-gray-200 pt-4 dark:border-gray-800"
          >
            <div>
              <div
                class="text-[10px] font-medium uppercase tracking-wider text-gray-400"
              >
                GIÁ SẢN PHẨM
              </div>

              <div
                class="mt-1 text-[20px] font-extrabold text-gray-900 dark:text-white"
              >
                {{ formatNumber(result.product_info?.original_price) }}đ
              </div>
            </div>

            <div class="text-right">
              <div
                class="text-[10px] font-medium uppercase tracking-wider text-gray-400"
              >
                TÍCH LŨY NHẬN VỀ
              </div>

              <div class="mt-1 text-[20px] font-extrabold text-[#ff4b2b]">
                +{{ formatNumber(result.product_info?.estimated_cashback) }}đ
              </div>
            </div>
          </div>
        </div>

        <!-- Price analysis -->
        <div v-if="result.product_info?.price_stats" class="px-4 sm:px-5">
          <!-- Highest price warning -->
          <div
            class="rounded-xl border border-pink-200 bg-pink-50/70 px-3.5 py-3 dark:border-pink-900/40 dark:bg-pink-950/20"
          >
            <div
              class="flex items-center gap-2 text-[13px] font-semibold text-pink-600 dark:text-pink-400"
            >
              <ExclamationCircleIcon class="w-4 h-4" />
              Giá cao nhất
            </div>

            <div
              class="mt-0.5 pl-6 text-[11px] text-gray-500 dark:text-gray-400"
            >
              Đang ở mức cao kỷ lục. Nên chờ sale hoặc tìm shop khác.
            </div>
          </div>

          <!-- Price range -->
          <div class="mt-3">
            <div
              class="relative h-1.5 overflow-visible rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500"
            >
              <span
                class="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white bg-rose-500 shadow"
                :style="{
                  left: `calc(${pricePercent(
                    result.product_info.original_price,
                    result.product_info.price_stats.minPrice,
                    result.product_info.price_stats.maxPrice,
                  )}% - 6px)`,
                }"
              />
            </div>

            <div class="mt-2 flex justify-between text-[9px] font-semibold">
              <span class="text-emerald-600">
                Min:
                {{ formatNumber(result.product_info.price_stats.minPrice) }}đ
              </span>

              <span class="text-gray-400">
                TB:
                {{
                  formatNumber(
                    Math.round(result.product_info.price_stats.avgPrice),
                  )
                }}đ
              </span>

              <span class="text-rose-500">
                Max:
                {{ formatNumber(result.product_info.price_stats.maxPrice) }}đ
              </span>
            </div>

            <!-- Min / Avg / Max -->
            <div class="mt-2 grid grid-cols-3 gap-2">
              <div
                class="rounded-xl border border-gray-100 bg-gray-50 px-2 py-2.5 text-center dark:border-gray-800 dark:bg-gray-800/50"
              >
                <div class="text-[9px] text-gray-400">Thấp nhất</div>

                <div class="mt-0.5 text-sm font-bold text-emerald-600">
                  {{ formatNumber(result.product_info.price_stats.minPrice) }}đ
                </div>
              </div>

              <div
                class="rounded-xl border border-gray-100 bg-gray-50 px-2 py-2.5 text-center dark:border-gray-800 dark:bg-gray-800/50"
              >
                <div class="text-[9px] text-gray-400">Trung bình</div>

                <div
                  class="mt-0.5 text-sm font-bold text-gray-600 dark:text-gray-200"
                >
                  {{
                    formatNumber(
                      Math.round(result.product_info.price_stats.avgPrice),
                    )
                  }}đ
                </div>
              </div>

              <div
                class="rounded-xl border border-gray-100 bg-gray-50 px-2 py-2.5 text-center dark:border-gray-800 dark:bg-gray-800/50"
              >
                <div class="text-[9px] text-gray-400">Cao nhất</div>

                <div class="mt-0.5 text-sm font-bold text-rose-500">
                  {{ formatNumber(result.product_info.price_stats.maxPrice) }}đ
                </div>
              </div>
            </div>

            <!-- 30 days -->
            <div
              v-if="result.product_info.price_stats.change30d != null"
              class="mt-2 rounded-xl bg-gray-50 py-2 text-center text-[11px] text-gray-500 dark:bg-gray-800/50"
            >
              30N:

              <span
                :class="
                  result.product_info.price_stats.change30d > 0
                    ? 'font-bold text-rose-500'
                    : 'font-bold text-emerald-600'
                "
              >
                {{ result.product_info.price_stats.change30d > 0 ? "▲" : "▼" }}

                {{
                  formatNumber(
                    Math.abs(result.product_info.price_stats.change30d),
                  )
                }}đ
              </span>
            </div>
          </div>

          <!-- History chart -->
          <div
            v-if="historyPoints(result.product_info.price_stats)"
            class="mt-3 pb-4"
          >
            <div class="mb-2 flex items-center gap-4 text-[9px] text-gray-400">
              <span class="inline-flex items-center gap-1.5">
                <i class="h-0.5 w-3 bg-[#ff5a36]" />
                Giá sản phẩm
              </span>

              <span class="inline-flex items-center gap-1.5">
                <i class="h-px w-3 border-t border-dashed border-gray-400" />
                Giá trung bình
              </span>
            </div>

            <div class="relative h-24 overflow-hidden rounded-lg">
              <svg
                viewBox="0 0 100 50"
                preserveAspectRatio="none"
                class="absolute inset-0 h-full w-full"
              >
                <line
                  x1="0"
                  y1="15"
                  x2="100"
                  y2="15"
                  stroke="currentColor"
                  stroke-width="0.35"
                  stroke-dasharray="2 2"
                  class="text-gray-300 dark:text-gray-700"
                />

                <line
                  x1="0"
                  y1="32"
                  x2="100"
                  y2="32"
                  stroke="currentColor"
                  stroke-width="0.3"
                  class="text-gray-200 dark:text-gray-800"
                />

                <polyline
                  :points="historyPoints(result.product_info.price_stats)"
                  fill="none"
                  stroke="#ff5a36"
                  stroke-width="1.1"
                  vector-effect="non-scaling-stroke"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="border-t border-gray-100 px-4 py-4 dark:border-gray-800">
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="shareResultLink"
              class="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-4 py-3 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <ShareIcon class="w-4 h-4" />
              Chia sẻ
            </button>

            <a
              :href="result.short_tracking_url || result.tracking_url"
              target="_blank"
              rel="noopener"
              class="flex-1 inline-flex items-center justify-center rounded-xl bg-emerald-500 py-3 text-xs font-extrabold tracking-wide text-white transition hover:bg-emerald-600"
            >
              MUA NGAY TRÊN SHOPEE

              <template v-if="result.product_info?.estimated_cashback">
                &nbsp;· +{{
                  formatNumber(result.product_info.estimated_cashback)
                }}
                🪙
              </template>
            </a>
          </div>
        </div>
      </section>

      <!-- Help -->
      <div
        v-if="copied"
        class="text-center text-xs text-green-600 dark:text-green-400"
      >
        Đã sao chép link!
      </div>

      <!-- Help modal -->
      <div
        v-if="showHelp"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="showHelp = false"
      >
        <div
          class="w-full max-w-sm space-y-3 rounded-2xl bg-white p-5 shadow-2xl dark:bg-gray-900"
        >
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
            Cách lấy link sản phẩm
          </h3>

          <ol
            class="list-decimal list-inside space-y-1.5 text-xs text-gray-600 dark:text-gray-300"
          >
            <li>
              Mở app Shopee / Lazada / TikTok Shop, tìm sản phẩm bạn muốn mua.
            </li>

            <li>
              Bấm nút "Chia sẻ" trên trang sản phẩm và chọn "Sao chép liên kết".
            </li>

            <li>
              Quay lại đây, dán link vào ô bên trên và bấm "MUA NGAY CÓ HOÀN
              TIỀN".
            </li>
          </ol>

          <button
            type="button"
            @click="showHelp = false"
            class="w-full rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ShoppingCartIcon,
  QuestionMarkCircleIcon,
  ClipboardDocumentIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ShareIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/vue/24/outline";

import { StarIcon } from "@heroicons/vue/24/solid";

definePageMeta({
  middleware: "auth",
});

const authStore = useAuthStore();
const config = useRuntimeConfig();

const platforms = [
  {
    id: "shopee",
    label: "Shopee",
    initial: "S",
    color: "bg-orange-500",
  },
  {
    id: "tiktok",
    label: "TikTok Shop",
    initial: "T",
    color: "bg-gray-900",
  },
  {
    id: "lazada",
    label: "Lazada",
    initial: "L",
    color: "bg-blue-600",
  },
];

const productUrl = ref("");
const submitting = ref(false);
const error = ref("");
const result = ref<any>(null);
const copied = ref(false);
const showHelp = ref(false);
const showPriceStats = ref(false);
const statsLoading = ref(true);

const wallet = reactive({
  available: 0,
  pending: 0,
});

function formatNumber(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n || 0);
}

// Nhận diện sàn TMĐT từ URL
function detectPlatform(url: string): string | null {
  const u = url.toLowerCase();

  if (u.includes("shopee.")) return "shopee";
  if (u.includes("lazada.")) return "lazada";

  if (u.includes("tiktok.") || u.includes("vt.tiktok")) {
    return "tiktok";
  }

  return null;
}

// Thử tách product_id từ URL Shopee
function extractProductId(url: string): string {
  try {
    const path = url.split("?")[0];
    const match = path.match(/\.(\d+)\.(\d+)$/);

    return match ? match[2] : "";
  } catch {
    return "";
  }
}

// Gọi API lấy thông tin sản phẩm
async function fetchProductInfo(platform: string, url: string) {
  const response = await fetch(
    `${config.public.apiBase}/api/affiliate/${platform}/product-info/?url=${encodeURIComponent(url)}`,
    {
      headers: {
        Authorization: `Token ${authStore.token}`,
      },
    },
  );

  const body = await response.json().catch(() => ({}));

  if (!response.ok || !body?.success) {
    throw new Error(body?.message || "Không lấy được thông tin sản phẩm");
  }

  return body.data;
}

// Gọi API tạo link tracking
async function createAffiliateClick(platform: string, url: string) {
  const response = await fetch(
    `${config.public.apiBase}/api/affiliate/click/`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${authStore.token}`,
      },

      body: JSON.stringify({
        platform,
        product_url: url,
        product_id: extractProductId(url),
      }),
    },
  );

  const body = await response.json().catch(() => ({}));

  if (!response.ok || !body?.success) {
    throw new Error(
      body?.message || body?.detail || "Không tạo được link hoàn tiền",
    );
  }

  return body.data;
}

async function submitLink(url: string) {
  const platform = detectPlatform(url);

  if (!platform) {
    error.value =
      "Link chưa được hỗ trợ. Hiện chỉ hỗ trợ Shopee, Lazada, TikTok Shop.";

    return;
  }

  submitting.value = true;
  error.value = "";
  result.value = null;

  try {
    const [productInfo, click] = await Promise.all([
      fetchProductInfo(platform, url),
      createAffiliateClick(platform, url),
    ]);

    const info = productInfo?.raw?.productInfo;

    result.value = {
      ...click,

      product_info: info
        ? {
            name: info.productName,
            image: productInfo.image,
            shop_name: info.shopName,
            rating: info.rating,
            sold_count: info.sales,
            original_price: info.price,

            // Tạm dùng commission.
            estimated_cashback: info.commission,

            price_stats: info.priceStats,
          }
        : null,
    };

    fetchWalletStats();
  } catch (err: any) {
    error.value = err?.message || "Không tạo được link hoàn tiền";
  } finally {
    submitting.value = false;
  }
}

function handleSubmit() {
  if (!productUrl.value.trim()) return;

  submitLink(productUrl.value.trim());
}

// Nút dán link
async function handlePasteAndSubmit() {
  try {
    const text = await navigator.clipboard.readText();

    if (text) {
      productUrl.value = text.trim();
    }
  } catch {
    // Browser có thể chặn clipboard.
  }

  if (productUrl.value.trim()) {
    submitLink(productUrl.value.trim());
  } else {
    error.value =
      "Không đọc được clipboard, hãy dán link thủ công vào ô nhập rồi bấm lại.";
  }
}

function getResultLink() {
  return (
    result.value?.short_tracking_url ||
    result.value?.tracking_url ||
    productUrl.value
  );
}

async function copyResultLink() {
  try {
    await navigator.clipboard.writeText(getResultLink());

    copied.value = true;

    setTimeout(() => (copied.value = false), 2000);
  } catch {
    // ignore
  }
}

async function shareResultLink() {
  const link = getResultLink();

  const title =
    result.value?.product_info?.name || "Sản phẩm hoàn tiền trên Monimoni";

  if (navigator.share) {
    try {
      await navigator.share({
        title,
        url: link,
      });

      return;
    } catch {
      // User hủy share.
    }
  }

  copyResultLink();
}

async function fetchWalletStats() {
  statsLoading.value = true;

  try {
    const response = await fetch(
      `${config.public.apiBase}/api/wallet/summary/`,
      {
        headers: {
          Authorization: `Token ${authStore.token}`,
        },
      },
    );

    if (response.ok) {
      const data = await response.json();

      wallet.available = data.available ?? data.data?.available ?? 0;

      wallet.pending = data.pending ?? data.data?.pending ?? 0;
    }
  } catch {
    // Giữ giá trị mặc định.
  } finally {
    statsLoading.value = false;
  }
}

// Vị trí điểm trên thanh Min -> Max
function pricePercent(value: number, min: number, max: number) {
  if (!Number.isFinite(value) || max <= min) {
    return 50;
  }

  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}

// Dữ liệu biểu đồ lịch sử giá
function historyPoints(stats: any) {
  const history = stats?.history || stats?.prices || [];

  if (!Array.isArray(history) || history.length < 2) {
    return "";
  }

  const values = history.map((item: any) =>
    Number(item?.price ?? item?.value ?? item),
  );

  if (values.some((v: number) => !Number.isFinite(v))) {
    return "";
  }

  const min = Math.min(...values);

  const max = Math.max(...values);

  const range = max - min || 1;

  return values
    .map((value: number, index: number) => {
      const x = (index / (values.length - 1)) * 100;

      const y = 44 - ((value - min) / range) * 34;

      return `${x},${y}`;
    })
    .join(" ");
}

onMounted(() => {
  fetchWalletStats();
});
</script>

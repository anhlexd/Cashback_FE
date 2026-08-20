<template>
  <div
    class="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white text-gray-900 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950 dark:text-white"
  >
    <div class="w-full max-w-3xl mx-auto px-5 py-6 sm:px-7 sm:py-8 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1
            class="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl dark:text-white"
          >
            Mua sắm online
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Dán link sản phẩm, tự động tích lũy hoàn tiền vào ví
          </p>
        </div>
        <div
          class="hidden h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-50 text-orange-500 sm:grid dark:bg-orange-950/30 dark:text-orange-400"
        >
          <ShoppingCartIcon class="w-6 h-6" />
        </div>
      </div>

      <!-- Wallet card -->
      <div
        class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-[#ff4b0b] p-5 text-white shadow-[0_16px_40px_-14px_rgba(255,87,34,.5)] sm:p-6"
      >
        <div
          class="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"
        />
        <div
          class="absolute -bottom-10 -left-6 h-32 w-32 rounded-full bg-white/10 blur-2xl"
        />

        <div class="relative flex items-center justify-between">
          <span class="text-[11px] font-semibold uppercase tracking-wider text-white/80">
            MOON khả dụng
          </span>
          <WalletIcon class="h-5 w-5 text-white/70" />
        </div>

        <div class="relative mt-2 flex items-center gap-2">
          <span
            v-if="statsLoading"
            class="h-8 w-28 animate-pulse rounded-lg bg-white/20"
          ></span>
          <template v-else>
            <span class="text-3xl font-black tracking-tight">
              {{ formatNumber(wallet.available || 100000) }}
            </span>
            <span class="text-xl">🪙</span>
          </template>
        </div>

        <div
          class="relative mt-4 flex items-center justify-between rounded-2xl bg-white/15 px-3.5 py-2.5 backdrop-blur-sm"
        >
          <span class="text-xs font-medium text-white/85">Đang chờ xử lý</span>
          <span
            v-if="statsLoading"
            class="h-4 w-14 animate-pulse rounded bg-white/20"
          ></span>
          <span v-else class="text-sm font-bold">
            {{ formatNumber(wallet.pending) }} 🪙
          </span>
        </div>
      </div>

      <!-- Affiliate link -->
      <section class="space-y-3">
        <div class="flex items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-1.5">
            <span
              class="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-500 dark:bg-orange-950/30 dark:text-orange-400"
            >
              Shopee
            </span>
            <span
              class="rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-bold text-cyan-600 dark:bg-cyan-950/30 dark:text-cyan-400"
            >
              TikTok
            </span>
            <span
              class="rounded-full bg-pink-50 px-2.5 py-1 text-[10px] font-bold text-pink-500 dark:bg-pink-950/30 dark:text-pink-400"
            >
              Lazada
            </span>
            <span
              class="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-600 dark:bg-orange-950/30 dark:text-orange-400"
            >
              ShopeeFood
            </span>
          </div>
          <button
            type="button"
            @click="openHelp"
            class="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-orange-500 hover:text-orange-600 dark:hover:text-orange-300"
          >
            Cách lấy link
            <QuestionMarkCircleIcon class="w-3.5 h-3.5" />
          </button>
        </div>

        <form
          @submit.prevent="handleSubmit"
          class="flex items-center w-full gap-1 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] transition-all focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100 dark:border-gray-700 dark:bg-gray-900 dark:focus-within:border-orange-500 dark:focus-within:ring-orange-950/40"
        >
          <LinkIcon class="ml-2 h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600" />

          <input
            v-model="productUrl"
            type="url"
            placeholder="Dán link sản phẩm Shopee, TikTok, Lazada hoặc ShopeeFood..."
            class="min-w-0 flex-1 h-9 px-2 bg-transparent border-0 outline-none text-[12px] sm:text-[13px] text-gray-700 placeholder:text-gray-400 focus:border-0 focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-gray-500"
            @paste="handlePaste"
          />

          <button
            type="submit"
            :disabled="submitting"
            class="h-9 shrink-0 px-5 sm:px-6 rounded-xl bg-orange-500 text-[11px] font-bold tracking-wide text-white transition-all hover:bg-orange-600 disabled:opacity-60"
          >
            <span
              v-if="submitting"
              class="inline-block w-3.5 h-3.5 mr-1.5 align-[-2px] border-2 border-white/40 border-t-white rounded-full animate-spin"
            />

            <span v-else>Kiểm tra hoàn tiền</span>
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
        class="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_12px_32px_rgba(0,0,0,0.07)] dark:border-gray-800 dark:bg-gray-900"
      >
        <!-- Cashback highlight -->
        <div
          v-if="result.product_info?.estimated_cashback"
          class="flex items-center justify-between gap-3 bg-gradient-to-r from-orange-500 to-[#ff4b0b] px-5 py-3.5 text-white"
        >
          <span class="text-xs font-semibold text-white/85">
            Bạn sẽ nhận được
          </span>
          <span class="text-lg font-black tracking-tight">
            +{{ formatNumber(result.product_info.estimated_cashback) }}đ
          </span>
        </div>

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

          <!-- Price row -->
          <div
            v-if="result.product_info?.original_price"
            class="mt-4 flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-800/50"
          >
            <span class="text-xs text-gray-500 dark:text-gray-400">
              Giá sản phẩm
            </span>
            <span class="text-base font-extrabold text-gray-900 dark:text-white">
              {{ formatNumber(result.product_info.original_price) }}đ
            </span>
          </div>
        </div>

        <!-- Price analysis -->
        <div v-if="result.product_info?.price_stats" class="px-4 pb-1 sm:px-5">
          <!-- Highest price warning -->
          <div
            class="rounded-2xl border border-pink-200 bg-pink-50/70 px-3.5 py-3 dark:border-pink-900/40 dark:bg-pink-950/20"
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
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        @click.self="closeHelp"
      >
        <div class="relative w-full max-w-sm rounded-3xl bg-[#111a2e] p-6 shadow-2xl">
          <button
            type="button"
            @click="closeHelp"
            class="absolute right-4 top-4 text-gray-400 transition hover:text-white"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>

          <h3 class="pr-6 text-center text-lg font-bold leading-snug text-white">
            Cách lấy link sản phẩm trên<br />
            Shopee/TikTok
          </h3>

          <!-- Phone illustration -->
          <div class="relative mx-auto mt-5 w-full max-w-[220px] rounded-2xl bg-white p-3 shadow-xl">
            <!-- Top bar -->
            <div class="flex items-center justify-between">
              <div class="h-2 w-10 rounded-full bg-gray-200" />
              <div class="flex items-center gap-2">
                <div class="relative">
                  <span
                    v-if="helpStep === 0"
                    class="absolute inset-0 rounded-full bg-orange-400 opacity-40 animate-ping"
                  />
                  <div
                    class="relative grid h-7 w-7 place-items-center rounded-full transition-colors"
                    :class="helpStep === 0 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'"
                  >
                    <ShareIcon class="h-3.5 w-3.5" />
                  </div>
                  <SparklesIcon
                    v-if="helpStep === 0"
                    class="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 text-orange-400"
                  />
                </div>
                <div class="h-7 w-7 rounded-full bg-gray-100" />
              </div>
            </div>

            <!-- Image placeholder -->
            <div class="mt-3 h-24 w-full rounded-xl bg-gray-100" />

            <!-- Below-image content: fixed min-height so both steps render the same card size -->
            <div class="mt-3 flex min-h-[112px] flex-col justify-center">
              <!-- Step 1: product page -->
              <template v-if="helpStep === 0">
                <div class="space-y-1.5">
                  <div class="h-2 w-full rounded-full bg-gray-200" />
                  <div class="h-2 w-2/3 rounded-full bg-gray-200" />
                </div>
                <div class="mt-2 h-2 w-1/3 rounded-full bg-orange-200" />
              </template>

              <!-- Step 2: share sheet -->
              <template v-else>
                <div class="h-2 w-2/3 rounded-full bg-gray-200" />

                <div class="mt-2.5 text-left text-[9px] font-medium text-gray-400">
                  Gửi cho bạn bè
                </div>
                <div class="mt-1.5 flex gap-2">
                  <div v-for="i in 4" :key="i" class="h-6 w-6 rounded-full bg-gray-100" />
                </div>

                <div class="mt-2.5 text-left text-[9px] font-medium text-gray-400">
                  Chia sẻ qua
                </div>
                <div class="mt-1.5 flex items-center gap-2.5">
                  <div class="h-6 w-6 rounded-full bg-blue-100" />
                  <div class="relative">
                    <span class="absolute inset-0 rounded-full bg-orange-400 opacity-40 animate-ping" />
                    <div class="relative grid h-6 w-6 place-items-center rounded-full bg-orange-500 text-white">
                      <LinkIcon class="h-3 w-3" />
                    </div>
                    <SparklesIcon class="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 text-orange-400" />
                  </div>
                  <div class="h-6 w-6 rounded-full bg-sky-100" />
                  <div class="h-6 w-6 rounded-full bg-emerald-100" />
                </div>
                <div class="mt-1 text-center text-[9px] font-bold text-orange-500">
                  Copy link
                </div>
              </template>
            </div>
          </div>

          <!-- Caption + nav -->
          <div class="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-gray-400 transition hover:bg-white/10 disabled:opacity-30"
              @click="goHelpStep(helpStep === 0 ? helpCaptions.length - 1 : helpStep - 1)"
            >
              <ChevronLeftIcon class="h-4 w-4" />
            </button>

            <p class="text-center text-sm font-bold text-orange-400">
              {{ helpStep + 1 }}. {{ helpCaptions[helpStep] }}
            </p>

            <button
              type="button"
              class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-gray-400 transition hover:bg-white/10"
              @click="goHelpStep(helpStep === helpCaptions.length - 1 ? 0 : helpStep + 1)"
            >
              <ChevronRightIcon class="h-4 w-4" />
            </button>
          </div>

          <!-- Dots -->
          <div class="mt-3 flex items-center justify-center gap-1.5">
            <button
              v-for="(_, i) in helpCaptions"
              :key="i"
              type="button"
              class="h-1.5 rounded-full transition-all"
              :class="i === helpStep ? 'w-4 bg-orange-500' : 'w-1.5 bg-white/20'"
              @click="goHelpStep(i)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ShoppingCartIcon,
  QuestionMarkCircleIcon,
  ExclamationCircleIcon,
  ShareIcon,
  WalletIcon,
  LinkIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
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
const helpStep = ref(0);
const helpCaptions = ["Bấm vào biểu tượng chia sẻ", "Chọn Sao chép đường dẫn"];
let helpTimer: ReturnType<typeof setInterval> | null = null;

function stopHelpAutoplay() {
  if (helpTimer) {
    clearInterval(helpTimer);
    helpTimer = null;
  }
}

function startHelpAutoplay() {
  stopHelpAutoplay();
  helpTimer = setInterval(() => {
    helpStep.value = helpStep.value === helpCaptions.length - 1 ? 0 : helpStep.value + 1;
  }, 2000);
}

function openHelp() {
  showHelp.value = true;
  helpStep.value = 0;
  startHelpAutoplay();
}

function closeHelp() {
  showHelp.value = false;
  helpStep.value = 0;
  stopHelpAutoplay();
}

// Bấm điều hướng thủ công thì reset lại đồng hồ tự chuyển bước
function goHelpStep(step: number) {
  helpStep.value = step;
  startHelpAutoplay();
}

onBeforeUnmount(() => {
  stopHelpAutoplay();
});
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

// Dán link xong tự động kiểm tra luôn, không cần bấm nút
function handlePaste(e: ClipboardEvent) {
  const text = e.clipboardData?.getData("text")?.trim();
  if (!text) return;
  e.preventDefault();
  productUrl.value = text;
  handleSubmit();
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

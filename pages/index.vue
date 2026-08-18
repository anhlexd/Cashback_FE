<template>
  <div class="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
    <!-- Header -->
    <div>
      <h1 class="flex items-center gap-2 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
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
        <div class="text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">Moni khả dụng</div>
        <div class="flex items-center gap-1.5">
          <span v-if="statsLoading" class="h-6 w-16 bg-surface-100 dark:bg-dark-50 rounded animate-pulse"></span>
          <span v-else class="text-xl font-bold text-brand-600">{{ formatNumber(wallet.available) }}</span>
          <span class="text-base">🪙</span>
        </div>
      </div>
      <div class="card p-4">
        <div class="text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">Đang chờ xử lý</div>
        <div class="flex items-center gap-1.5">
          <span v-if="statsLoading" class="h-6 w-10 bg-surface-100 dark:bg-dark-50 rounded animate-pulse"></span>
          <span v-else class="text-xl font-bold text-gray-900 dark:text-white">{{ formatNumber(wallet.pending) }}</span>
          <span class="text-base opacity-70">🪙</span>
        </div>
      </div>
    </div>

    <!-- Paste link card -->
    <div class="card p-5">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <span class="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">Dán link sản phẩm</span>
          <div class="flex items-center gap-1">
            <span
              v-for="p in platforms" :key="p.id"
              class="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
              :class="p.color"
              :title="p.label"
            >
              {{ p.initial }}
            </span>
          </div>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
          @click="showHelp = true"
        >
          Cách lấy link
          <QuestionMarkCircleIcon class="w-3.5 h-3.5" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="flex items-center gap-2">
        <input
          v-model="productUrl"
          type="url"
          class="flex-1 px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-surface-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-all"
          placeholder="Dán link Shopee, Lazada hoặc TikTok Shop tại đây..."
        />
        <button
          type="button"
          @click="handlePasteAndSubmit"
          :disabled="submitting"
          class="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 border border-surface-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-surface-50 dark:hover:bg-gray-800 disabled:opacity-60 transition-colors"
        >
          <span v-if="submitting" class="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></span>
          <ClipboardDocumentIcon v-else class="w-3.5 h-3.5" />
          Dán link
        </button>
      </form>

      <div v-if="error" class="flex items-start gap-2 mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-lg text-red-700 dark:text-red-400 text-xs">
        <ExclamationCircleIcon class="w-4 h-4 flex-shrink-0 mt-0.5" />
        {{ error }}
      </div>

      <!-- Result: product card -->
      <div v-if="result" class="mt-4 rounded-xl border border-surface-200 dark:border-gray-800 overflow-hidden">
        <div class="p-4 relative">
          <button
            type="button"
            class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            @click="result = null"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>

          <!-- ASSUMPTION: các field name/image/shop/rating/sold/original_price/estimated_cashback
               KHÔNG có trong response /api/affiliate/click/ hiện tại (chỉ có id, platform, sub_id,
               product_url, tracking_url, short_tracking_url). Cần backend bổ sung 1 trong 2 cách:
               (1) click/ trả kèm luôn field product_info, hoặc
               (2) 1 API riêng (vd /api/affiliate/product-info/?url=...) gọi song song để lấy phần này.
               Bên dưới đang dùng optional chaining nên nếu thiếu field, card vẫn không crash —
               chỉ ẩn phần tương ứng. -->
          <div class="flex gap-3">
            <img
              v-if="result.product_info?.image"
              :src="result.product_info.image"
              class="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-gray-100"
              alt=""
            />
            <div class="min-w-0 flex-1">
              <div class="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2">
                {{ result.product_info?.name || 'Sản phẩm Shopee' }}
              </div>
              <div v-if="result.product_info?.shop_name" class="text-xs text-gray-400 mt-1">
                Shop: {{ result.product_info.shop_name }}
              </div>
              <div v-if="result.product_info?.rating" class="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                <span class="flex items-center gap-0.5 text-orange-500">
                  <StarIcon class="w-3 h-3 fill-current" /> {{ result.product_info.rating }}
                </span>
                <span v-if="result.product_info?.sold_count">· Đã bán {{ formatNumber(result.product_info.sold_count) }}+</span>
              </div>
            </div>
          </div>

          <div v-if="result.product_info?.original_price || result.product_info?.estimated_cashback" class="flex items-end justify-between mt-3 pt-3 border-t border-dashed border-surface-200 dark:border-gray-800">
            <div v-if="result.product_info?.original_price">
              <div class="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Giá gốc, chưa khuyến mãi</div>
              <div class="text-base font-bold text-gray-900 dark:text-white">{{ formatNumber(result.product_info.original_price) }}đ</div>
            </div>
            <div v-if="result.product_info?.estimated_cashback" class="text-right">
              <div class="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Dự kiến hoàn lại</div>
              <div class="text-base font-bold text-brand-600 flex items-center gap-1 justify-end">+{{ formatNumber(result.product_info.estimated_cashback) }} <span class="text-sm">🪙</span></div>
            </div>
          </div>
        </div>

        <div class="px-4 pb-3">
          <div class="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 text-xs text-gray-600 dark:text-gray-300">
            <span class="font-semibold text-red-500 flex-shrink-0">CHÚ Ý:</span>
            <span>
              Tránh đặt hàng trực tiếp qua ứng dụng <strong>Shopee Live</strong> hoặc <strong>Shopee Video</strong>
              để đảm bảo không bị lỗi hệ thống ghi nhận đối soát hoàn tiền.
            </span>
          </div>
        </div>

        <div class="px-4 pb-4 flex items-center gap-2">
          <button
            type="button"
            @click="shareResultLink"
            class="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-3 border border-surface-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-surface-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ShareIcon class="w-4 h-4" />
            Chia sẻ
          </button>
          <a
            :href="result.short_tracking_url || result.tracking_url"
            target="_blank"
            rel="noopener"
            class="flex-1 inline-flex items-center justify-center gap-1.5 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold tracking-wide transition-colors"
          >
            MUA NGAY TRÊN SHOPEE
            <template v-if="result.product_info?.estimated_cashback">
              · +{{ formatNumber(result.product_info.estimated_cashback) }} <span>🪙</span>
            </template>
          </a>
        </div>
      </div>

      <div v-if="copied" class="text-xs text-green-600 dark:text-green-400 mt-2">Đã sao chép link!</div>

      <!-- Phân tích biến động giá -->
      <div v-if="result?.product_info?.price_stats" class="mt-3 card overflow-hidden">
        <button
          type="button"
          class="w-full flex items-center justify-between p-4 text-left"
          @click="showPriceStats = !showPriceStats"
        >
          <span class="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">Phân tích biến động giá</span>
          <ArrowTrendingUpIcon
            class="w-4 h-4 text-gray-400 transition-transform"
            :class="{ 'rotate-180': showPriceStats }"
          />
        </button>
        <div v-if="showPriceStats" class="px-4 pb-4 grid grid-cols-3 gap-3 text-center">
          <div>
            <div class="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Thấp nhất</div>
            <div class="text-sm font-bold text-emerald-600">{{ formatNumber(result.product_info.price_stats.minPrice) }}đ</div>
          </div>
          <div>
            <div class="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Trung bình</div>
            <div class="text-sm font-bold text-gray-900 dark:text-white">{{ formatNumber(Math.round(result.product_info.price_stats.avgPrice)) }}đ</div>
          </div>
          <div>
            <div class="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Cao nhất</div>
            <div class="text-sm font-bold text-red-500">{{ formatNumber(result.product_info.price_stats.maxPrice) }}đ</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Help modal -->
    <div v-if="showHelp" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" @click.self="showHelp = false">
      <div class="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full p-5 space-y-3">
        <h3 class="font-semibold text-gray-900 dark:text-white text-sm">Cách lấy link sản phẩm</h3>
        <ol class="text-xs text-gray-600 dark:text-gray-300 space-y-1.5 list-decimal list-inside">
          <li>Mở app Shopee / Lazada / TikTok Shop, tìm sản phẩm bạn muốn mua.</li>
          <li>Bấm nút "Chia sẻ" trên trang sản phẩm và chọn "Sao chép liên kết".</li>
          <li>Quay lại đây, dán link vào ô bên trên và bấm "Dán link".</li>
        </ol>
        <button
          type="button"
          class="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-colors"
          @click="showHelp = false"
        >
          Đã hiểu
        </button>
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
} from '@heroicons/vue/24/outline'
import { StarIcon } from '@heroicons/vue/24/solid'

definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const config = useRuntimeConfig()

const platforms = [
  { id: 'shopee', label: 'Shopee', initial: 'S', color: 'bg-orange-500' },
  { id: 'tiktok', label: 'TikTok Shop', initial: 'T', color: 'bg-gray-900' },
  { id: 'lazada', label: 'Lazada', initial: 'L', color: 'bg-blue-600' },
]

const productUrl = ref('')
const submitting = ref(false)
const error = ref('')
const result = ref<any>(null)
const copied = ref(false)
const showHelp = ref(false)
const showPriceStats = ref(false)

const statsLoading = ref(true)
const wallet = reactive({ available: 0, pending: 0 })

function formatNumber(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n || 0)
}

// Nhận diện sàn TMĐT từ URL
function detectPlatform(url: string): string | null {
  const u = url.toLowerCase()
  if (u.includes('shopee.')) return 'shopee'
  if (u.includes('lazada.')) return 'lazada'
  if (u.includes('tiktok.') || u.includes('vt.tiktok')) return 'tiktok'
  return null
}

// Thử tách product_id từ URL Shopee dạng ...slug.SHOPID.ITEMID?...
function extractProductId(url: string): string {
  try {
    const path = url.split('?')[0]
    const match = path.match(/\.(\d+)\.(\d+)$/)
    return match ? match[2] : ''
  } catch {
    return ''
  }
}

// Gọi API lấy thông tin sản phẩm (tên, ảnh, giá, rating, lịch sử giá...)
async function fetchProductInfo(platform: string, url: string) {
  const response = await fetch(
    `${config.public.apiBase}/api/affiliate/${platform}/product-info/?url=${encodeURIComponent(url)}`,
    { headers: { 'Authorization': `Token ${authStore.token}` } }
  )
  const body = await response.json().catch(() => ({}))
  if (!response.ok || !body?.success) {
    throw new Error(body?.message || 'Không lấy được thông tin sản phẩm')
  }
  return body.data
}

// Gọi API tạo link tracking hoàn tiền
async function createAffiliateClick(platform: string, url: string) {
  const response = await fetch(`${config.public.apiBase}/api/affiliate/click/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${authStore.token}`,
    },
    body: JSON.stringify({
      platform,
      product_url: url,
      product_id: extractProductId(url),
    }),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || !body?.success) {
    throw new Error(body?.message || body?.detail || 'Không tạo được link hoàn tiền')
  }
  return body.data
}

async function submitLink(url: string) {
  const platform = detectPlatform(url)
  if (!platform) {
    error.value = 'Link chưa được hỗ trợ. Hiện chỉ hỗ trợ Shopee, Lazada, TikTok Shop.'
    return
  }

  submitting.value = true
  error.value = ''
  result.value = null
  try {
    const [productInfo, click] = await Promise.all([
      fetchProductInfo(platform, url),
      createAffiliateClick(platform, url),
    ])

    const info = productInfo?.raw?.productInfo
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
            // ASSUMPTION: response chỉ trả tổng "commission" (hoa hồng Monimoni nhận từ sàn),
            // chưa có field số tiền hoàn lại thực tế cho user (thường = commission * % chia sẻ
            // theo chính sách Monimoni). Đang tạm dùng commission làm giá trị hiển thị —
            // cần backend xác nhận field đúng hoặc bổ sung "estimated_user_cashback".
            estimated_cashback: info.commission,
            price_stats: info.priceStats,
          }
        : null,
    }
    fetchWalletStats()
  } catch (err: any) {
    error.value = err?.message || 'Không tạo được link hoàn tiền'
  } finally {
    submitting.value = false
  }
}

function handleSubmit() {
  if (!productUrl.value.trim()) return
  submitLink(productUrl.value.trim())
}

// Nút "Dán link": lấy nội dung từ clipboard, điền vào ô rồi gửi luôn
async function handlePasteAndSubmit() {
  try {
    const text = await navigator.clipboard.readText()
    if (text) productUrl.value = text.trim()
  } catch {
    // Trình duyệt chặn đọc clipboard tự động (vd Safari) -> để user tự dán bằng Ctrl+V
  }
  if (productUrl.value.trim()) {
    submitLink(productUrl.value.trim())
  } else {
    error.value = 'Không đọc được clipboard, hãy dán link thủ công vào ô nhập rồi bấm lại.'
  }
}

function getResultLink() {
  return result.value?.short_tracking_url || result.value?.tracking_url || productUrl.value
}

async function copyResultLink() {
  try {
    await navigator.clipboard.writeText(getResultLink())
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    // ignore
  }
}

async function shareResultLink() {
  const link = getResultLink()
  const title = result.value?.product_info?.name || 'Sản phẩm hoàn tiền trên Monimoni'
  if (navigator.share) {
    try {
      await navigator.share({ title, url: link })
      return
    } catch {
      // user hủy share hoặc trình duyệt không hỗ trợ -> fallback copy
    }
  }
  copyResultLink()
}

async function fetchWalletStats() {
  statsLoading.value = true
  try {
    // TODO: thay bằng endpoint thật khi có doc — đây là endpoint giả định
    const response = await fetch(`${config.public.apiBase}/api/wallet/summary/`, {
      headers: { 'Authorization': `Token ${authStore.token}` },
    })
    if (response.ok) {
      const data = await response.json()
      wallet.available = data.available ?? data.data?.available ?? 0
      wallet.pending = data.pending ?? data.data?.pending ?? 0
    }
  } catch {
    // ignore, giữ giá trị mặc định 0
  } finally {
    statsLoading.value = false
  }
}

onMounted(() => {
  fetchWalletStats()
})
</script>
<template>
  <div :class="layout === 'tab' ? '' : 'card p-4'">
    <!-- Header -->
    <div class="flex items-center gap-2 mb-4">
      <SparklesIcon class="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
      <span class="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
        AI Story Point
      </span>
      <span
        v-if="estimate && modelLabel"
        class="text-[10px] font-medium px-1.5 py-0.5 rounded"
        :class="estimate.model_version?.startsWith('openai')
          ? 'text-brand-600 bg-brand-100 dark:bg-brand-900/40'
          : 'text-gray-500 bg-surface-100 dark:bg-dark-50'"
      >
        {{ modelLabel }}
      </span>
      <div class="flex-1" />
      <button
        type="button"
        class="btn-primary btn-sm flex items-center gap-1"
        :disabled="loading"
        @click="runEstimate"
      >
        <ArrowPathIcon class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
        {{ estimate ? 'Phân tích lại' : 'Phân tích AI' }}
      </button>
    </div>

    <!-- No OpenAI key -->
    <p v-if="!openaiConfigured && !estimate" class="text-xs text-amber-700 dark:text-amber-400 mb-2">
      Chưa có OpenAI API key — Admin thêm tại
      <NuxtLink to="/settings/company" class="underline font-medium">Cài đặt công ty</NuxtLink>
      hoặc cấu hình <code class="text-[10px]">OPENAI_API_KEY</code>. Hiện dùng ước lượng dự phòng.
    </p>
    <p
      v-else-if="openaiError"
      class="text-xs text-red-700 dark:text-red-400 mb-2 bg-red-50 dark:bg-red-950/30 rounded-lg px-2 py-1.5"
    >
      OpenAI lỗi: {{ openaiError }} — đang hiển thị ước lượng dự phòng.
    </p>

    <!-- Loading skeleton -->
    <div v-if="loading && !estimate" class="space-y-3 animate-pulse">
      <div class="h-16 bg-surface-100 dark:bg-dark-50 rounded-xl" />
      <div class="h-2 bg-surface-100 dark:bg-dark-50 rounded w-2/3" />
      <div class="h-2 bg-surface-100 dark:bg-dark-50 rounded w-1/2" />
    </div>

    <!-- Empty -->
    <p v-else-if="!estimate" class="text-xs text-gray-500 italic">
      Bấm <strong>Phân tích AI</strong> — AI đọc mô tả issue + lịch sử task tương tự để gợi ý Story Point theo 4 chiều.
    </p>

    <!-- Result -->
    <div v-else class="space-y-4">
      <!-- Clarification warning -->
      <div
        v-if="estimate.needs_clarification"
        class="flex items-start gap-2 text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 rounded-lg px-3 py-2"
      >
        <ExclamationTriangleIcon class="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          <p class="font-semibold mb-0.5">Cần làm rõ trước khi estimate chắc chắn:</p>
          <ul class="list-disc list-inside space-y-0.5">
            <li v-for="(q, i) in estimate.clarification_questions" :key="i">{{ q }}</li>
          </ul>
        </div>
      </div>

      <!-- SP + confidence -->
      <div class="flex items-center gap-4">
        <div
          class="flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-2"
          :class="estimate.sp_final
            ? 'border-green-400 bg-green-50 dark:bg-green-950/30'
            : 'border-brand-300 bg-brand-50/40 dark:bg-brand-950/20'"
        >
          <span class="text-3xl font-bold" :class="estimate.sp_final ? 'text-green-600' : 'text-brand-600'">
            {{ estimate.sp_final ?? estimate.sp_suggested }}
          </span>
          <span class="text-[10px] text-gray-500 uppercase tracking-wide">SP</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between text-[11px] text-gray-500 mb-1">
            <span>Độ tin cậy</span>
            <span class="font-semibold">{{ Math.round((estimate.confidence || 0) * 100) }}%</span>
          </div>
          <div class="h-2 bg-surface-100 dark:bg-dark-50 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all"
              :class="confidenceColor"
              :style="{ width: Math.round((estimate.confidence || 0) * 100) + '%' }"
            />
          </div>
          <p v-if="estimate.sp_final" class="text-[11px] mt-2 text-green-600 flex items-center gap-1 flex-wrap">
            <CheckCircleIcon class="w-3.5 h-3.5" />
            Đã áp dụng {{ estimate.sp_final }} SP
            <span v-if="downgraded" class="text-amber-600">(hạ từ {{ estimate.sp_suggested }} để khích lệ)</span>
            <span v-else-if="estimate.auto_confirmed" class="text-gray-400">(tự áp dụng AI)</span>
            <span v-else-if="estimate.confirmed_by" class="text-gray-400">· {{ estimate.confirmed_by.full_name }}</span>
          </p>
        </div>
      </div>

      <!-- 4 dimensions -->
      <div class="grid grid-cols-2 gap-2">
        <div v-for="d in dimensions" :key="d.key" class="text-[11px]">
          <div class="flex items-center justify-between mb-0.5">
            <span class="text-gray-600 dark:text-gray-400">{{ d.label }}</span>
            <span class="font-semibold text-gray-700 dark:text-gray-300">{{ (estimate[d.key] || 0).toFixed(0) }}/10</span>
          </div>
          <div class="h-1.5 bg-surface-100 dark:bg-dark-50 rounded-full overflow-hidden">
            <div class="h-full rounded-full" :class="d.color" :style="{ width: (estimate[d.key] || 0) * 10 + '%' }" />
          </div>
        </div>
      </div>

      <!-- Reasoning -->
      <div v-if="estimate.reasoning" class="text-xs text-gray-600 dark:text-gray-300 bg-surface-50 dark:bg-dark-50/50 rounded-lg px-3 py-2 leading-relaxed">
        {{ estimate.reasoning }}
      </div>

      <!-- Similar tasks -->
      <div v-if="estimate.similar_tasks?.length">
        <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Task tương tự</p>
        <div class="space-y-1">
          <div
            v-for="t in estimate.similar_tasks.slice(0, 3)" :key="t.id"
            class="flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg bg-surface-50 dark:bg-dark-50/50"
          >
            <span class="font-mono text-[10px] text-gray-400">{{ t.issue_key }}</span>
            <span class="truncate flex-1 text-gray-700 dark:text-gray-300">{{ t.title }}</span>
            <span class="font-bold text-gray-500 bg-surface-100 dark:bg-dark-100 px-1.5 py-0.5 rounded">{{ t.sp }} SP</span>
          </div>
        </div>
      </div>

      <!-- Confirm / override -->
      <div class="border-t border-surface-200 dark:border-dark-50 pt-3">
        <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
          {{ estimate.sp_final ? 'Điều chỉnh lại' : 'Xác nhận Story Point' }}
        </p>
        <div class="flex flex-wrap gap-1.5 mb-2">
          <button
            v-for="sp in VALID_SP" :key="sp"
            type="button"
            class="w-9 h-9 rounded-lg text-sm font-bold border transition-colors"
            :class="selectedSp === sp
              ? 'bg-brand-500 text-white border-brand-500'
              : 'border-surface-200 dark:border-dark-50 text-gray-600 dark:text-gray-300 hover:border-brand-300'"
            @click="selectedSp = sp"
          >
            {{ sp }}
          </button>
        </div>
        <textarea
          v-if="selectedSp !== estimate.sp_suggested"
          v-model="overrideReason"
          rows="2"
          class="input text-xs mb-2"
          placeholder="Lý do điều chỉnh khác gợi ý của AI (bắt buộc)…"
        />
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="btn-primary btn-sm flex items-center gap-1"
            :disabled="confirming || (selectedSp !== estimate.sp_suggested && !overrideReason.trim())"
            @click="confirmEstimate"
          >
            <CheckIcon class="w-3.5 h-3.5" />
            {{ selectedSp === estimate.sp_suggested ? 'Đồng ý ' + selectedSp + ' SP' : 'Chốt ' + selectedSp + ' SP' }}
          </button>
          <span v-if="generatedAt" class="text-[10px] text-gray-400">
            Phân tích {{ formatTime(generatedAt) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  SparklesIcon, ArrowPathIcon, CheckIcon, CheckCircleIcon, ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'
import { format } from 'date-fns'

const props = withDefaults(
  defineProps<{
    issueId: number
    initialEstimate?: any | null
    layout?: 'tab' | 'card'
  }>(),
  { layout: 'card', initialEstimate: null },
)

const emit = defineEmits<{
  updated: [payload: { ai_estimate: any; story_points?: number | null }]
}>()

const api = useApi()
const toast = useToast()

const VALID_SP = [1, 2, 3, 5, 8, 13]
const dimensions = [
  { key: 'complexity', label: 'Phức tạp', color: 'bg-purple-400' },
  { key: 'effort', label: 'Khối lượng', color: 'bg-blue-400' },
  { key: 'uncertainty', label: 'Chưa chắc', color: 'bg-amber-400' },
  { key: 'risk', label: 'Rủi ro', color: 'bg-red-400' },
]

const estimate = ref<any | null>(props.initialEstimate)
const generatedAt = ref<string | null>(props.initialEstimate?.created_at || null)
const openaiConfigured = ref(false)
const openaiError = ref<string | null>(null)
const loading = ref(false)
const confirming = ref(false)
const selectedSp = ref<number>(props.initialEstimate?.sp_final ?? props.initialEstimate?.sp_suggested ?? 3)
const overrideReason = ref('')

const modelLabel = computed(() => {
  const m = estimate.value?.model_version || ''
  if (m.startsWith('openai')) return 'OpenAI'
  if (m === 'rule-based') return 'Rule-based'
  return ''
})

const downgraded = computed(() => {
  const e = estimate.value
  return !!e && e.auto_confirmed && e.sp_final != null && e.sp_suggested != null
    && e.sp_final < e.sp_suggested
})

const confidenceColor = computed(() => {
  const c = estimate.value?.confidence || 0
  if (c >= 0.7) return 'bg-green-400'
  if (c >= 0.4) return 'bg-amber-400'
  return 'bg-red-400'
})

watch(() => props.initialEstimate, (val) => {
  if (val) {
    estimate.value = val
    selectedSp.value = val.sp_final ?? val.sp_suggested ?? 3
    generatedAt.value = val.created_at || null
  }
})

async function loadOpenAiStatus() {
  try {
    const s = await api.get<{ openai_api_key_set?: boolean }>('/api/auth/company-settings/')
    openaiConfigured.value = !!s.openai_api_key_set
  } catch {
    openaiConfigured.value = false
  }
}
onMounted(loadOpenAiStatus)

async function runEstimate() {
  loading.value = true
  openaiError.value = null
  try {
    const res = await api.post<any>(`/api/issues/${props.issueId}/ai_estimate/`, {})
    estimate.value = res
    generatedAt.value = res.created_at
    openaiConfigured.value = res.openai_configured
    openaiError.value = res.openai_error || null
    selectedSp.value = res.sp_final ?? res.sp_suggested
    overrideReason.value = ''
    // analyze tự áp dụng SP (đã hạ bậc) vào task → đồng bộ ô story point
    emit('updated', { ai_estimate: res, story_points: res.sp_final ?? null })
    if (res.auto_applied && res.applied_sp != null && res.applied_sp < res.sp_suggested) {
      toast.success(`Đã áp dụng ${res.applied_sp} SP (hạ từ ${res.sp_suggested} để khích lệ)`)
    } else if (res.model_version?.startsWith('openai')) toast.success('AI đã gợi ý Story Point')
    else if (res.openai_error) toast.warning('OpenAI lỗi — dùng ước lượng dự phòng')
  } catch (e: any) {
    toast.error(e?.data?.detail || 'Không tạo được estimate')
  } finally {
    loading.value = false
  }
}

async function confirmEstimate() {
  confirming.value = true
  try {
    const res = await api.post<any>(`/api/issues/${props.issueId}/confirm_estimate/`, {
      sp_final: selectedSp.value,
      override_reason: overrideReason.value.trim(),
    })
    estimate.value = { ...estimate.value, ...res, sp_final: res.sp_final }
    overrideReason.value = ''
    emit('updated', { ai_estimate: estimate.value, story_points: res.sp_final })
    toast.success(res.message || 'Đã xác nhận Story Point')
  } catch (e: any) {
    toast.error(e?.data?.detail || 'Không xác nhận được')
  } finally {
    confirming.value = false
  }
}

function formatTime(iso: string) {
  try {
    return format(new Date(iso), 'dd/MM/yyyy HH:mm')
  } catch {
    return iso
  }
}
</script>

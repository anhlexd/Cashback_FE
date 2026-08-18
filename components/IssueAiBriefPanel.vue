<template>
  <div
    class="rounded-xl border border-brand-100 dark:border-brand-900/40 bg-brand-50/30 dark:bg-brand-950/20"
    :class="layout === 'tab' ? 'p-0 border-0 bg-transparent' : 'p-4'"
  >
    <div
      class="flex items-center gap-2"
      :class="layout === 'tab' ? 'mb-4' : 'mb-3'"
    >
      <SparklesIcon class="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
      <span class="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
        Gợi ý triển khai (AI)
      </span>
      <span
        v-if="mode === 'ai'"
        class="text-[10px] font-medium text-brand-600 bg-brand-100 dark:bg-brand-900/40 px-1.5 py-0.5 rounded"
      >
        OpenAI
      </span>
      <span
        v-else-if="mode === 'rule'"
        class="text-[10px] font-medium text-gray-500 bg-surface-100 dark:bg-dark-50 px-1.5 py-0.5 rounded"
      >
        Rule-based
      </span>
      <div class="flex-1" />
      <button
        type="button"
        class="btn-primary btn-sm flex items-center gap-1"
        :disabled="loading"
        @click="generateBrief"
      >
        <ArrowPathIcon class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
        {{ brief ? 'Làm mới' : 'Lấy gợi ý' }}
      </button>
    </div>

    <p v-if="!openaiConfigured && !brief" class="text-xs text-amber-700 dark:text-amber-400 mb-2">
      Chưa có OpenAI API key — Admin thêm tại
      <NuxtLink to="/settings/company" class="underline font-medium">Cài đặt công ty</NuxtLink>
      hoặc cấu hình <code class="text-[10px]">OPENAI_API_KEY</code> trên server.
    </p>

    <p
      v-else-if="openaiError"
      class="text-xs text-red-700 dark:text-red-400 mb-2 bg-red-50 dark:bg-red-950/30 rounded-lg px-2 py-1.5"
    >
      OpenAI lỗi: {{ openaiError }}. Đang hiển thị gợi ý dự phòng bên dưới — kiểm tra key/model tại Cài đặt công ty.
    </p>

    <div v-if="loading && !brief" class="flex items-center gap-2 text-sm text-gray-500 py-4">
      <div class="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      Đang phân tích issue, GitHub và tài liệu dự án…
    </div>

    <div
      v-else-if="briefHtml"
      class="markdown-body overflow-y-auto"
      :class="layout === 'tab' ? 'max-h-[min(70vh,640px)] pr-1' : 'max-h-[360px]'"
      v-html="briefHtml"
    />

    <p v-else-if="!loading" class="text-xs text-gray-500 italic">
      Bấm <strong>Lấy gợi ý</strong> — AI đọc mô tả issue, cây repo GitHub, Implementor Note và Knowledge Graph.
    </p>

    <p v-if="generatedAt" class="text-[10px] text-gray-400 mt-2">
      Cập nhật {{ formatGeneratedAt(generatedAt) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { SparklesIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import { format } from 'date-fns'
import { briefMarkdownToHtml } from '~/utils/briefMarkdown'

const props = withDefaults(
  defineProps<{
    issueId: number
    initialBrief?: string
    initialGeneratedAt?: string | null
    /** tab = trong tab chi tiết issue (vùng đọc rộng); card = embed nhỏ */
    layout?: 'tab' | 'card'
  }>(),
  { layout: 'card' },
)

const emit = defineEmits<{
  updated: [payload: { brief: string; mode: string; generated_at: string | null }]
}>()

const api = useApi()
const toast = useToast()

const brief = ref(props.initialBrief || '')
const mode = ref<string | null>(props.initialBrief ? 'ai' : null)
const generatedAt = ref<string | null>(props.initialGeneratedAt || null)
const openaiConfigured = ref(false)
const openaiError = ref<string | null>(null)
const loading = ref(false)

const briefHtml = computed(() => (brief.value ? briefMarkdownToHtml(brief.value) : ''))

watch(
  () => [props.initialBrief, props.initialGeneratedAt] as const,
  ([b, t]) => {
    if (b !== undefined) brief.value = b || ''
    if (t !== undefined) generatedAt.value = t || null
  },
)

async function loadOpenAiStatus() {
  try {
    const s = await api.get<{ openai_api_key_set?: boolean }>('/api/auth/company-settings/')
    openaiConfigured.value = !!s.openai_api_key_set
  } catch {
    openaiConfigured.value = false
  }
}

onMounted(loadOpenAiStatus)

async function generateBrief() {
  loading.value = true
  openaiError.value = null
  try {
    const res = await api.post<{
      brief: string
      mode: string
      generated_at: string
      openai_configured: boolean
      openai_error?: string | null
    }>(`/api/issues/${props.issueId}/ai-brief/`, {})
    brief.value = res.brief
    mode.value = res.mode
    generatedAt.value = res.generated_at
    openaiConfigured.value = res.openai_configured
    openaiError.value = res.openai_error || null
    if (res.mode === 'ai') {
      toast.success('Đã tạo gợi ý AI')
    } else if (res.openai_error) {
      toast.warning('OpenAI lỗi — đang dùng gợi ý dự phòng')
    }
    emit('updated', {
      brief: res.brief,
      mode: res.mode,
      generated_at: res.generated_at,
    })
  } catch (e: any) {
    const msg = e?.data?.detail || e?.message || 'Không tạo được gợi ý AI'
    toast.error(msg)
  } finally {
    loading.value = false
  }
}

function formatGeneratedAt(iso: string) {
  try {
    return format(new Date(iso), 'dd/MM/yyyy HH:mm')
  } catch {
    return iso
  }
}
</script>

<style scoped>
.brief-markdown :deep(h2),
.brief-markdown :deep(h3) {
  scroll-margin-top: 4rem;
}
.brief-markdown :deep(code) {
  word-break: break-all;
}
</style>

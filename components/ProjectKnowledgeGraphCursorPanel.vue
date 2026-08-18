<template>
  <div
    v-if="isAdmin"
    class="rounded-xl border border-violet-200 dark:border-violet-900/50 bg-gradient-to-b from-violet-50/40 to-white dark:from-violet-950/20 dark:to-dark-100 overflow-hidden"
  >
    <!-- Header -->
    <div class="px-5 py-4 border-b border-violet-100 dark:border-violet-900/40 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <CpuChipIcon class="w-5 h-5 text-violet-600" />
          Phân tích logic dự án (Cursor)
        </h2>
        <p class="text-xs text-gray-500 mt-0.5 max-w-xl">
          Đọc codebase repo đã chọn → duyệt kết quả → ghim vào Implementor Note.
          Phạm vi: <strong>{{ scopeLabel }}</strong>
        </p>
      </div>
      <NuxtLink to="/settings/cursor" class="btn-secondary btn-sm shrink-0">Cấu hình API</NuxtLink>
    </div>

    <div v-if="!cursorConfigured" class="px-5 py-8 text-center text-sm text-amber-800 dark:text-amber-200">
      Chưa cấu hình Cursor API key —
      <NuxtLink to="/settings/cursor" class="underline font-medium">Cài đặt → Cursor</NuxtLink>
    </div>

    <template v-else>
      <!-- Thanh hành động -->
      <div class="px-5 py-3 bg-violet-50/50 dark:bg-violet-950/15 border-b border-violet-100/80 dark:border-violet-900/30 flex flex-wrap items-end gap-4">
        <div class="flex flex-col gap-1 min-w-[140px]">
          <label class="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Nhánh Git</label>
          <input
            v-model="branchInput"
            class="input text-sm font-mono py-2 w-40"
            placeholder="develop"
            :disabled="starting"
          />
          <p v-if="branchHint" class="text-[10px] text-gray-400 max-w-[200px]">{{ branchHint }}</p>
        </div>

        <div class="flex flex-wrap gap-2 items-center pb-0.5">
          <button
            type="button"
            class="btn-primary"
            :disabled="starting || !canStartAnalysis"
            @click="startAnalysis"
          >
            {{ starting ? 'Đang gửi Cursor…' : 'Bắt đầu phân tích' }}
          </button>
          <button type="button" class="btn-secondary btn-sm" :disabled="loadingJobs" @click="loadJobs">
            Làm mới
          </button>
        </div>

        <p v-if="startError" class="text-sm text-red-600 w-full">{{ startError }}</p>
      </div>

      <p class="px-5 py-2 text-[11px] text-gray-500 bg-amber-50/80 dark:bg-amber-950/20 border-b border-amber-100/50 dark:border-amber-900/30">
        Nếu Cursor báo lỗi nhánh dù GitHub có nhánh đó: kết nối repo trong
        <a href="https://cursor.com/dashboard" target="_blank" rel="noopener" class="text-brand-600 underline">Cursor Dashboard</a>
        (quyền đọc private repo) hoặc thử đúng tên nhánh (phân biệt hoa thường).
      </p>

      <!-- 2 cột: lịch sử | chi tiết -->
      <div class="grid grid-cols-1 lg:grid-cols-12 min-h-[420px]">
        <!-- Cột trái: danh sách job -->
        <aside class="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-violet-100 dark:border-violet-900/30 flex flex-col">
          <div class="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-surface-100 dark:border-dark-50 flex items-center justify-between gap-2">
            <span>Lịch sử phân tích</span>
            <span v-if="jobs.length" class="text-[10px] font-normal normal-case text-gray-400">{{ jobs.length }} mục</span>
          </div>
          <div v-if="loadingJobs" class="p-4 text-sm text-gray-400">Đang tải…</div>
          <ul v-else-if="jobs.length" class="flex-1 overflow-y-auto divide-y divide-surface-100 dark:divide-dark-50">
            <li
              v-for="job in jobs"
              :key="job.id"
              class="px-4 py-3 cursor-pointer transition-colors hover:bg-violet-50/60 dark:hover:bg-violet-950/20 group"
              :class="activeJobId === job.id && 'bg-violet-100/70 dark:bg-violet-950/40 border-l-2 border-violet-500'"
              @click="selectJob(job)"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="font-mono text-xs font-medium text-gray-900 dark:text-white truncate min-w-0">
                  {{ job.repo_full_name }}
                </div>
                <button
                  type="button"
                  class="shrink-0 p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-opacity"
                  :disabled="deletingId === job.id || job.status === 'running'"
                  :title="job.status === 'running' ? 'Đang chạy — không xóa' : 'Xóa'"
                  @click.stop="deleteJob(job)"
                >
                  <TrashIcon class="w-3.5 h-3.5" />
                </button>
              </div>
              <div class="flex flex-wrap gap-1.5 mt-1.5">
                <span class="badge text-[10px]" :class="statusClass(job.status)">{{ statusLabel(job.status) }}</span>
                <span v-if="job.review_status" class="badge text-[10px]" :class="reviewClass(job.review_status)">
                  {{ reviewLabel(job.review_status) }}
                </span>
              </div>
              <div class="text-[10px] text-gray-400 mt-1">
                #{{ job.id }} · {{ formatDate(job.created_at) }}
                <span v-if="job.default_branch" class="font-mono"> · {{ job.default_branch }}</span>
              </div>
            </li>
          </ul>
          <p v-else class="p-6 text-sm text-gray-400 text-center">Chưa có lần phân tích.</p>
        </aside>

        <!-- Cột phải: chi tiết job -->
        <main class="lg:col-span-8 flex flex-col min-h-[320px]">
          <div v-if="!activeJob" class="flex-1 flex items-center justify-center p-8 text-sm text-gray-400 text-center">
            Chọn một job bên trái hoặc bấm <strong>Bắt đầu phân tích</strong>.
          </div>

          <div v-else class="flex-1 flex flex-col p-5 gap-4 overflow-hidden">
            <div class="flex flex-wrap items-center justify-between gap-2 shrink-0">
              <p class="text-xs text-gray-500 font-mono">
                Job #{{ activeJob.id }}
                <span v-if="activeJob.published_to_implementor_at" class="text-green-600"> · đã ghim note</span>
              </p>
              <button
                type="button"
                class="btn-ghost btn-sm text-red-600 text-xs"
                :disabled="deletingId === activeJob.id || activeJob.status === 'running'"
                @click="deleteJob(activeJob)"
              >
                <TrashIcon class="w-3.5 h-3.5" />
                {{ deletingId === activeJob.id ? 'Đang xóa…' : 'Xóa lịch sử' }}
              </button>
            </div>
            <!-- Trạng thái chạy -->
            <div
              v-if="activeJob.status === 'pending' || activeJob.status === 'running'"
              class="rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 p-5"
            >
              <div class="flex items-start gap-3">
                <span class="w-8 h-8 border-2 border-brand-500/30 border-t-brand-600 rounded-full animate-spin shrink-0 mt-0.5" />
                <div class="space-y-2 min-w-0">
                  <p class="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {{ activeJob.status === 'pending' ? 'Đang chờ worker xử lý…' : 'Cursor đang đọc codebase (5–15 phút)' }}
                  </p>
                  <p class="text-xs text-gray-500">
                    Repo: <code class="font-mono">{{ activeJob.repo_full_name }}</code>
                    · Nhánh: <code class="font-mono">{{ activeJob.default_branch || branchInput }}</code>
                  </p>
                  <div class="flex flex-wrap gap-2">
                    <a
                      v-if="activeJob.cursor_agent_url"
                      :href="activeJob.cursor_agent_url"
                      target="_blank"
                      rel="noopener"
                      class="btn-secondary btn-sm"
                    >
                      Mở Cursor Dashboard
                    </a>
                    <button type="button" class="btn-ghost btn-sm" :disabled="retrying" @click="retryJob">
                      {{ retrying ? 'Đang gửi lại…' : 'Chạy lại' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Chờ duyệt -->
            <template v-else-if="activeJob.status === 'completed' && activeJob.review_status === 'pending_review'">
              <div class="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 px-4 py-2 text-sm text-amber-900 dark:text-amber-100">
                Chờ duyệt — chỉnh nội dung bên dưới rồi ghim vào Implementor Note.
              </div>
              <textarea
                v-model="editMarkdown"
                class="input font-sans text-[15px] leading-relaxed flex-1 min-h-[280px] w-full resize-y"
                placeholder="Nội dung Markdown từ Cursor…"
              />
              <div class="flex flex-wrap gap-2 shrink-0">
                <button type="button" class="btn-primary" :disabled="approving" @click="approveJob">
                  {{ approving ? 'Đang lưu…' : 'Duyệt & ghim Implementor Note' }}
                </button>
                <button type="button" class="btn-secondary btn-sm" :disabled="savingDraft" @click="saveDraft">
                  Lưu nháp
                </button>
                <button type="button" class="btn-ghost btn-sm text-red-600" :disabled="rejecting" @click="rejectJob">
                  Từ chối
                </button>
              </div>
            </template>

            <!-- Xem kết quả / lỗi -->
            <template v-else>
              <div
                v-if="activeJob.content_markdown"
                class="flex-1 min-h-[200px] max-h-[min(50vh,520px)] overflow-y-auto rounded-lg border border-surface-200 dark:border-dark-50 p-5 bg-white dark:bg-dark-50"
                v-html="renderedMarkdown"
              />
              <div
                v-if="activeJob.status === 'error' && activeJob.error_message"
                class="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-800 dark:text-red-200 whitespace-pre-wrap"
              >
                {{ activeJob.error_message }}
              </div>
            </template>

            <p v-if="pinnedJobCount" class="text-sm text-green-700 shrink-0">
              {{ pinnedJobCount }} repo đã ghim vào Implementor Note ·
              <NuxtLink :to="`/projects/${projectId}/implementor-note`" class="underline font-medium">Xem tài liệu</NuxtLink>
            </p>
            <p v-if="actionError" class="text-sm text-red-600 shrink-0">{{ actionError }}</p>
            <p v-if="actionSuccess" class="text-sm text-green-600 shrink-0">{{ actionSuccess }}</p>
          </div>
        </main>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { CpuChipIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { format } from 'date-fns'
import { markdownToHtml } from '~/utils/briefMarkdown'
import { repairUtf8Mojibake } from '~/utils/textEncoding'

type LinkedRepo = { id: number; full_name: string; default_branch: string }

const props = defineProps<{
  projectId: number
  selectedRepoIds: number[]
  scopeAllProject: boolean
  linkedRepos?: LinkedRepo[]
}>()

const emit = defineEmits<{ published: [] }>()

const authStore = useAuthStore()
const api = useApi()

const isAdmin = computed(() => authStore.user?.role === 'admin')
const cursorConfigured = ref(false)
const jobs = ref<any[]>([])
const loadingJobs = ref(false)
const starting = ref(false)
const startError = ref('')
const activeJobId = ref<number | null>(null)
const activeJob = ref<any>(null)
const editMarkdown = ref('')
const branchInput = ref('develop')
const approving = ref(false)
const rejecting = ref(false)
const savingDraft = ref(false)
const retrying = ref(false)
const deletingId = ref<number | null>(null)
const actionError = ref('')
const actionSuccess = ref('')
let pollTimer: ReturnType<typeof setInterval> | null = null

const pinnedJobCount = computed(
  () => jobs.value.filter((j) => j.published_to_implementor_at).length,
)

const scopeLabel = computed(() => {
  if (props.scopeAllProject) return 'Cả dự án'
  if (props.selectedRepoIds.length > 1) return `${props.selectedRepoIds.length} repository`
  if (props.selectedRepoIds.length === 1) return 'Một repository'
  return '—'
})

const branchHint = computed(() => {
  const repos = props.linkedRepos || []
  if (repos.length === 1) {
    return `Mặc định repo: ${repos[0].default_branch}`
  }
  if (repos.length > 1) {
    const branches = [...new Set(repos.map((r) => r.default_branch))]
    return `Nhánh các repo: ${branches.join(', ')}`
  }
  return ''
})

const canStartAnalysis = computed(() =>
  props.scopeAllProject || props.selectedRepoIds.length > 0,
)

const renderedMarkdown = computed(() =>
  markdownToHtml(activeJob.value?.content_markdown || ''),
)

watch(
  () => props.linkedRepos,
  (repos) => {
    if (!repos?.length) return
    if (repos.length === 1) {
      branchInput.value = repos[0].default_branch || 'main'
    }
  },
  { immediate: true, deep: true },
)

function statusLabel(s: string) {
  return ({
    pending: 'Chờ worker',
    running: 'Đang phân tích',
    completed: 'Hoàn thành',
    error: 'Lỗi',
  } as Record<string, string>)[s] || s
}
function statusClass(s: string) {
  if (s === 'completed') return 'bg-green-100 text-green-800'
  if (s === 'running' || s === 'pending') return 'bg-amber-100 text-amber-800'
  return 'bg-red-100 text-red-800'
}
function reviewLabel(s: string) {
  return ({ pending_review: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' } as Record<string, string>)[s] || s
}
function reviewClass(s: string) {
  if (s === 'approved') return 'bg-green-100 text-green-800'
  if (s === 'pending_review') return 'bg-violet-100 text-violet-800'
  return 'bg-gray-200 text-gray-600'
}
function formatDate(iso: string) {
  if (!iso) return '—'
  try { return format(new Date(iso), 'dd/MM HH:mm') } catch { return '—' }
}

function stopPoll() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

async function loadJobs() {
  loadingJobs.value = true
  try {
    const res = await api.get('/api/cursor-logic-analysis/', { project_id: props.projectId })
    jobs.value = res.items || []
    cursorConfigured.value = res.cursor_configured ?? false
    if (activeJobId.value) {
      const fresh = jobs.value.find((j: any) => j.id === activeJobId.value)
      if (fresh) activeJob.value = { ...activeJob.value, ...fresh }
    }
  } finally {
    loadingJobs.value = false
  }
}

async function fetchJob(id: number) {
  const row = await api.get(`/api/cursor-logic-analysis/${id}/`)
  activeJob.value = row
  editMarkdown.value = repairUtf8Mojibake(row.content_markdown || '')
  if (row.default_branch) branchInput.value = row.default_branch
  return row
}

function selectJob(job: any) {
  activeJobId.value = job.id
  activeJob.value = job
  editMarkdown.value = repairUtf8Mojibake(job.content_markdown || '')
  if (job.default_branch) branchInput.value = job.default_branch
  actionError.value = ''
  actionSuccess.value = ''
  stopPoll()
  if (job.status === 'pending' || job.status === 'running') {
    pollTimer = setInterval(async () => {
      const row = await fetchJob(job.id)
      if (row.status === 'completed' || row.status === 'error') {
        stopPoll()
        await loadJobs()
      }
    }, 4000)
  }
}

async function startAnalysis() {
  starting.value = true
  startError.value = ''
  actionError.value = ''
  try {
    const body: Record<string, unknown> = {
      project_id: props.projectId,
      branch: (branchInput.value || '').trim() || undefined,
    }
    if (props.scopeAllProject) {
      body.scope = 'project'
    } else {
      body.repo_ids = props.selectedRepoIds
    }
    const row = await api.post('/api/cursor-logic-analysis/', body)
    await loadJobs()
    selectJob(row)
  } catch (e: any) {
    startError.value = e?.data?.detail || e?.data?.message || 'Không khởi chạy được'
  } finally {
    starting.value = false
  }
}

async function approveJob() {
  if (!activeJob.value?.id) return
  approving.value = true
  actionError.value = ''
  try {
    const row = await api.post(`/api/cursor-logic-analysis/${activeJob.value.id}/approve/`, {
      project_id: props.projectId,
      content_markdown: editMarkdown.value.trim(),
      publish: true,
    })
    actionSuccess.value = row.message || 'Đã ghim vào Implementor Note.'
    await fetchJob(activeJob.value.id)
    await loadJobs()
    emit('published')
  } catch (e: any) {
    actionError.value = e?.data?.detail || 'Duyệt thất bại'
  } finally {
    approving.value = false
  }
}

async function saveDraft() {
  if (!activeJob.value?.id) return
  savingDraft.value = true
  try {
    await api.patch(`/api/cursor-logic-analysis/${activeJob.value.id}/`, {
      content_markdown: editMarkdown.value.trim(),
    })
    await fetchJob(activeJob.value.id)
  } catch (e: any) {
    actionError.value = e?.data?.detail || 'Lưu thất bại'
  } finally {
    savingDraft.value = false
  }
}

async function rejectJob() {
  if (!activeJob.value?.id) return
  rejecting.value = true
  try {
    await api.post(`/api/cursor-logic-analysis/${activeJob.value.id}/reject/`, {})
    await loadJobs()
    activeJob.value = null
    activeJobId.value = null
  } catch (e: any) {
    actionError.value = e?.data?.detail || 'Từ chối thất bại'
  } finally {
    rejecting.value = false
  }
}

async function retryJob() {
  if (!activeJob.value?.id) return
  retrying.value = true
  actionError.value = ''
  try {
    const row = await api.post(`/api/cursor-logic-analysis/${activeJob.value.id}/retry/`, {
      branch: (branchInput.value || '').trim() || undefined,
    })
    selectJob(row)
    await loadJobs()
  } catch (e: any) {
    actionError.value = e?.data?.detail || 'Chạy lại thất bại'
  } finally {
    retrying.value = false
  }
}

async function deleteJob(job: { id: number; status?: string; published_to_implementor_at?: string | null }) {
  if (job.status === 'running') return
  const msg = job.published_to_implementor_at
    ? 'Bản này đã ghim vào Implementor Note. Xóa sẽ gỡ luôn phần Cursor trong tài liệu dự án. Tiếp tục?'
    : `Xóa lịch sử phân tích #${job.id}?`
  if (!confirm(msg)) return

  deletingId.value = job.id
  actionError.value = ''
  actionSuccess.value = ''
  stopPoll()
  try {
    const res = await api.delete<{ detail?: string; removed_from_implementor_note?: boolean }>(
      `/api/cursor-logic-analysis/${job.id}/`,
    )
    if (activeJobId.value === job.id) {
      activeJobId.value = null
      activeJob.value = null
      editMarkdown.value = ''
    }
    await loadJobs()
    if (res?.removed_from_implementor_note) {
      actionSuccess.value = 'Đã xóa và gỡ khỏi Implementor Note.'
      emit('published')
    } else {
      actionSuccess.value = res?.detail || 'Đã xóa lịch sử phân tích.'
    }
  } catch (e: any) {
    actionError.value = e?.data?.detail || 'Xóa thất bại'
  } finally {
    deletingId.value = null
  }
}

watch(() => props.projectId, () => {
  loadJobs()
}, { immediate: true })

onUnmounted(stopPoll)
</script>


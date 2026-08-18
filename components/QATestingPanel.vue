<template>
  <div class="space-y-4">

    <!-- Status banner -->
    <div class="rounded-xl p-4 flex items-start gap-3" :class="bannerClass">
      <component :is="bannerIcon" class="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div>
        <div class="font-semibold text-sm">{{ bannerTitle }}</div>
        <div class="text-xs mt-0.5 opacity-80">{{ bannerDesc }}</div>
      </div>
    </div>

    <!-- Active test session -->
    <template v-if="activeSession">
      <div class="card p-4 border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span class="text-sm font-semibold text-blue-700 dark:text-blue-300">Đang kiểm tra...</span>
          <span class="text-xs text-blue-500 ml-auto">Session #{{ activeSession.id }}</span>
        </div>
        <div class="text-xs text-gray-500 mb-3">
          Bắt đầu lúc {{ formatTime(activeSession.started_at) }} · {{ elapsedTime }}
        </div>

        <!-- Test notes -->
        <div class="mb-3">
          <label class="label text-xs">Ghi chú kiểm tra</label>
          <textarea
            v-model="testNotes"
            class="input text-sm resize-none min-h-[64px]"
            placeholder="Ghi chú về kết quả kiểm tra..."
          ></textarea>
        </div>

        <!-- Action buttons -->
        <div class="flex gap-2">
          <button
            @click="handlePass"
            :disabled="passing"
            class="flex-1 btn text-sm py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <CheckCircleIcon class="w-4 h-4" />
            {{ passing ? 'Đang xử lý...' : '✅ PASS — Không có lỗi' }}
          </button>
          <button
            @click="showBugForm = true"
            class="flex-1 btn text-sm py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <BugAntIcon class="w-4 h-4" />
            🐛 Báo lỗi
          </button>
        </div>
      </div>
    </template>

    <!-- Start test session button (when in_review) -->
    <template v-else-if="issue.status === 'in_review' && isTester">
      <div class="text-center py-4">
        <div class="text-sm text-gray-500 mb-3">
          Dev đã hoàn thành code và đang chờ kiểm tra.
          <span v-if="issue.github_commit_sha" class="block mt-1 text-xs">
            Commit: <code class="font-mono bg-surface-100 dark:bg-dark-50 px-1.5 rounded text-brand-600">{{ issue.github_commit_sha.slice(0, 8) }}</code>
          </span>
        </div>
        <button @click="startTesting" :disabled="starting" class="btn-primary px-6 py-2.5 text-sm font-semibold gap-2">
          <PlayIcon class="w-4 h-4" />
          {{ starting ? 'Đang bắt đầu...' : '🧪 Bắt đầu kiểm tra' }}
        </button>
      </div>
    </template>

    <!-- Bug reporting form -->
    <BugReportForm
      v-if="showBugForm"
      :issue="issue"
      :session-id="activeSession?.id"
      :test-notes="testNotes"
      @submitted="onBugsReported"
      @cancel="showBugForm = false"
    />

    <!-- Test history -->
    <div v-if="issue.test_sessions?.length > 0" class="space-y-2">
      <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
        <ClockIcon class="w-3.5 h-3.5" />
        Lịch sử kiểm tra ({{ issue.test_sessions.length }} lần)
      </div>
      <div
        v-for="session in issue.test_sessions"
        :key="session.id"
        class="flex items-center gap-3 p-2.5 rounded-lg text-xs"
        :class="{
          'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30': session.result === 'pass',
          'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30': session.result === 'fail',
          'bg-surface-50 dark:bg-dark-50 border border-surface-200 dark:border-dark-50': !session.result,
        }"
      >
        <span :class="session.result === 'pass' ? 'text-green-600' : 'text-red-500'" class="font-bold text-base">
          {{ session.result === 'pass' ? '✅' : session.result === 'fail' ? '❌' : '⏳' }}
        </span>
        <div class="flex-1">
          <span class="font-medium text-gray-800 dark:text-gray-200">{{ session.tester?.full_name }}</span>
          <span class="text-gray-400 mx-1">·</span>
          <span class="text-gray-500">{{ formatTime(session.started_at) }}</span>
          <span v-if="session.bugs_created_count" class="ml-1.5 text-red-600 font-medium">{{ session.bugs_created_count }} bug</span>
        </div>
        <span class="text-gray-400">{{ session.duration_seconds ? formatDuration(session.duration_seconds) : '—' }}</span>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { CheckCircleIcon, BugAntIcon, PlayIcon, ClockIcon } from '@heroicons/vue/24/outline'
import { ExclamationCircleIcon, BeakerIcon } from '@heroicons/vue/24/solid'
import { format } from 'date-fns'
import { useIntervalFn } from '@vueuse/core'

const props = defineProps<{
  issue: any
  onUpdated: (issue: any) => void
}>()

const api = useApi()
const authStore = useAuthStore()
const toast = useToast()

const activeSession = ref<any>(null)
const testNotes = ref('')
const showBugForm = ref(false)
const starting = ref(false)
const passing = ref(false)
const elapsedTime = ref('')

const isTester = computed(() =>
  props.issue.tester?.id === authStore.user?.id ||
  authStore.user?.role === 'tester' ||
  authStore.user?.role === 'admin'
)

// Banner config by status
const STATUS_CONFIG: Record<string, any> = {
  todo:        { title: 'Chờ bắt đầu', desc: 'Issue chưa được ai bắt đầu làm', cls: 'bg-gray-100 dark:bg-dark-50 text-gray-700 dark:text-gray-300', icon: ClockIcon },
  in_progress: { title: 'Dev đang làm', desc: 'Dev đang phát triển tính năng này', cls: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300', icon: BeakerIcon },
  in_review:   { title: 'Chờ kiểm tra', desc: 'Dev đã hoàn thành — đang chờ tester kiểm tra', cls: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300', icon: ExclamationCircleIcon },
  testing:     { title: 'Đang kiểm tra', desc: 'Tester đang chạy test', cls: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300', icon: BeakerIcon },
  bug_fixing:  { title: 'Dev đang sửa lỗi', desc: 'Tester tìm thấy lỗi — dev đang khắc phục', cls: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300', icon: BugAntIcon },
  done:        { title: '✅ Hoàn thành', desc: 'Tester đã PASS — issue hoàn tất', cls: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300', icon: CheckCircleIcon },
}

const bannerClass = computed(() => STATUS_CONFIG[props.issue.status]?.cls || 'bg-gray-50')
const bannerIcon  = computed(() => STATUS_CONFIG[props.issue.status]?.icon || ClockIcon)
const bannerTitle = computed(() => STATUS_CONFIG[props.issue.status]?.title || props.issue.status)
const bannerDesc  = computed(() => STATUS_CONFIG[props.issue.status]?.desc || '')

// Elapsed timer
const { pause: pauseTimer } = useIntervalFn(() => {
  if (!activeSession.value?.started_at) return
  const diff = Date.now() - new Date(activeSession.value.started_at).getTime()
  const mins = Math.floor(diff / 60000)
  const secs = Math.floor((diff % 60000) / 1000)
  elapsedTime.value = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}, 1000)

async function startTesting() {
  starting.value = true
  try {
    const res = await api.post(`/api/issues/${props.issue.id}/start_testing/`)
    activeSession.value = { id: res.session_id, started_at: new Date().toISOString() }
    props.onUpdated(res.issue)
    toast.success('🧪 Đã bắt đầu test session')
  } catch (e: any) {
    toast.error(e?.data?.detail || 'Không thể bắt đầu')
  } finally { starting.value = false }
}

async function handlePass() {
  passing.value = true
  try {
    const res = await api.post(`/api/issues/${props.issue.id}/pass_testing/`, {
      session_id: activeSession.value?.id,
      notes: testNotes.value,
    })
    activeSession.value = null
    pauseTimer()
    props.onUpdated(res.issue)
    toast.success('✅ Issue đã PASS! Tổng thời gian: ' + (res.time_report?.total_time_formatted || 'N/A'))
  } catch (e: any) {
    toast.error(e?.data?.detail || 'Không thể pass')
  } finally { passing.value = false }
}

function onBugsReported(result: any) {
  showBugForm.value = false
  activeSession.value = null
  pauseTimer()
  props.onUpdated(result.issue)
  toast.success(`🐛 Đã tạo ${result.bugs_created?.length} bug và thông báo cho dev`)
}

function formatTime(d: string) { return format(new Date(d), 'HH:mm dd/MM') }
function formatDuration(secs: number) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  if (h > 0) return `${h}h${m}m`
  return `${m}m`
}

async function loadActiveSession() {
  if (props.issue.status !== 'testing') return
  try {
    const res = await api.get(`/api/issues/${props.issue.id}/active_session/`)
    if (res) {
      activeSession.value = {
        id: res.id,
        started_at: res.started_at,
      }
    }
  } catch (e) {
    // không có session đang chạy
  }
}

onMounted(loadActiveSession)

onUnmounted(pauseTimer)
</script>

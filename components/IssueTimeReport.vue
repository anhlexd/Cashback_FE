<template>
  <div class="space-y-4">
    <!-- Summary cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 text-center">
        <div class="text-lg font-black text-blue-700 dark:text-blue-300">{{ report.dev_time_formatted || '—' }}</div>
        <div class="text-xs text-gray-500 mt-0.5">⌨️ Dev coding</div>
      </div>
      <div class="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-center">
        <div class="text-lg font-black text-red-600 dark:text-red-400">{{ report.bug_fixing_time_formatted || '—' }}</div>
        <div class="text-xs text-gray-500 mt-0.5">🐛 Sửa bug</div>
      </div>
      <div class="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 text-center">
        <div class="text-lg font-black text-purple-700 dark:text-purple-300">{{ report.test_time_formatted || '—' }}</div>
        <div class="text-xs text-gray-500 mt-0.5">🧪 Kiểm tra</div>
      </div>
      <div class="p-3 rounded-xl text-center" :class="report.total_time_formatted ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30' : 'bg-surface-100 dark:bg-dark-50'">
        <div class="text-lg font-black" :class="report.total_time_formatted ? 'text-green-700 dark:text-green-300' : 'text-gray-400'">
          {{ report.total_time_formatted || '—' }}
        </div>
        <div class="text-xs text-gray-500 mt-0.5">⏱ Tổng cộng</div>
      </div>
    </div>

    <!-- Stats row -->
    <div class="flex items-center gap-4 text-xs text-gray-500 bg-surface-50 dark:bg-dark-50 rounded-xl px-4 py-2.5">
      <span>🔁 {{ report.test_rounds || 0 }} lần test</span>
      <span>🐛 {{ report.total_bug_count || 0 }} bugs</span>
      <span v-if="report.open_bug_count > 0" class="text-red-500 font-medium">{{ report.open_bug_count }} bug chưa xong</span>
    </div>

    <!-- Timeline -->
    <div class="space-y-1.5">
      <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Timeline</div>
      <div class="relative pl-6">
        <div class="absolute left-2 top-0 bottom-0 w-px bg-surface-200 dark:bg-dark-50"></div>
        <div
          v-for="event in timelineEvents"
          :key="event.label"
          class="relative flex items-start gap-2 pb-3"
        >
          <div class="absolute -left-4 w-3 h-3 rounded-full border-2 border-white dark:border-dark-100"
               :class="event.color"></div>
          <div>
            <div class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ event.label }}</div>
            <div class="text-xs text-gray-400 mt-0.5">{{ event.time ? formatDateTime(event.time) : '—' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bug list -->
    <div v-if="report.bugs?.length > 0" class="space-y-2">
      <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bugs trong task này</div>
      <div
        v-for="bug in report.bugs"
        :key="bug.id"
        class="flex items-center gap-3 p-2.5 rounded-lg text-xs border"
        :class="bug.status === 'done'
          ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/20'
          : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/20'"
      >
        <span class="font-mono font-bold" :class="bug.status === 'done' ? 'text-green-600' : 'text-red-500'">
          {{ bug.status === 'done' ? '✅' : '❌' }}
        </span>
        <span class="font-mono text-gray-400 flex-shrink-0">{{ bug.key }}</span>
        <span class="flex-1 text-gray-700 dark:text-gray-300 truncate">{{ bug.title }}</span>
        <span :class="`priority-${bug.priority}`">{{ bug.priority }}</span>
        <span class="text-gray-400 flex-shrink-0">{{ bug.duration_formatted || '—' }}</span>
      </div>
    </div>

    <!-- Refresh button -->
    <div class="text-center">
      <button @click="load" :disabled="loading" class="btn-ghost btn-sm text-xs text-gray-400 gap-1.5">
        <ArrowPathIcon class="w-3.5 h-3.5" :class="loading ? 'animate-spin' : ''" />
        Làm mới
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowPathIcon } from '@heroicons/vue/24/outline'
import { format } from 'date-fns'

const props = defineProps<{ issueId: number }>()
const api = useApi()
const report = ref<any>({})
const loading = ref(false)

const timelineEvents = computed(() => {
  const t = report.value?.timeline || {}
  return [
    { label: 'Tạo issue',        time: t.created_at,       color: 'bg-gray-400' },
    { label: 'Dev bắt đầu',      time: t.dev_started_at,   color: 'bg-blue-500' },
    { label: 'Dev hoàn thành',   time: t.dev_completed_at, color: 'bg-yellow-500' },
    { label: 'Bắt đầu test',     time: t.test_started_at,  color: 'bg-purple-500' },
    { label: 'Test PASS',        time: t.test_passed_at,   color: 'bg-green-500' },
  ].filter(e => e.time)
})

async function load() {
  loading.value = true
  try {
    report.value = await api.get(`/api/issues/${props.issueId}/time_report/`)
  } catch {} finally { loading.value = false }
}

function formatDateTime(d: string) { return format(new Date(d), 'HH:mm dd/MM/yyyy') }

onMounted(load)
</script>

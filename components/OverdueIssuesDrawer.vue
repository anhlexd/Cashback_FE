<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex justify-end" @keydown.esc="$emit('close')">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" @click="$emit('close')"></div>

      <!-- Drawer -->
      <div class="relative w-full max-w-[640px] h-full bg-white dark:bg-dark-100 shadow-2xl flex flex-col animate-slide-in-right">
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-surface-200 dark:border-dark-50 flex-shrink-0">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/30">
              <ExclamationTriangleIcon class="w-5 h-5 text-white" />
            </div>
            <div class="min-w-0">
              <div class="text-[10px] uppercase tracking-wider font-semibold text-red-600 dark:text-red-400">Issue quá hạn</div>
              <h3 class="font-bold text-gray-900 dark:text-white truncate">{{ title }}</h3>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ filtered.length }} issue đang quá hạn
                <span v-if="totalDaysOverdue" class="text-red-500 ml-1">· tổng {{ totalDaysOverdue }} ngày trễ</span>
              </p>
            </div>
          </div>
          <button @click="$emit('close')" class="btn-ghost btn-icon" title="Đóng (Esc)">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Summary stats -->
        <div v-if="filtered.length" class="grid grid-cols-3 gap-2 px-5 py-3 border-b border-surface-200 dark:border-dark-50 flex-shrink-0">
          <div class="text-center">
            <div class="text-[10px] text-gray-400 uppercase tracking-wider">Trung bình</div>
            <div class="text-sm font-bold text-red-600 dark:text-red-400">{{ avgDaysOverdue }} ngày</div>
          </div>
          <div class="text-center">
            <div class="text-[10px] text-gray-400 uppercase tracking-wider">Cao nhất</div>
            <div class="text-sm font-bold text-red-600 dark:text-red-400">{{ maxDaysOverdue }} ngày</div>
          </div>
          <div class="text-center">
            <div class="text-[10px] text-gray-400 uppercase tracking-wider">Đang làm</div>
            <div class="text-sm font-bold text-blue-600 dark:text-blue-400">{{ filtered.filter((i) => i.status === 'in_progress').length }}</div>
          </div>
        </div>

        <!-- List -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="filtered.length === 0" class="flex flex-col items-center justify-center h-full text-center px-6">
            <div class="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
              <CheckCircleIcon class="w-8 h-8 text-green-500" />
            </div>
            <h3 class="font-semibold text-gray-800 dark:text-gray-200">Không có issue quá hạn 🎉</h3>
            <p class="text-sm text-gray-500 mt-1">Mọi thứ vẫn đang trong tầm kiểm soát.</p>
          </div>
          <div v-else class="divide-y divide-surface-100 dark:divide-dark-50/50">
            <button
              v-for="issue in filtered"
              :key="issue.id"
              type="button"
              @click="selectedIssueId = issue.id"
              class="w-full flex items-start gap-3 px-5 py-3 hover:bg-surface-50 dark:hover:bg-dark-50/50 transition-colors text-left"
            >
              <!-- Severity badge -->
              <div
                class="w-10 h-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0 text-white font-bold leading-none"
                :class="severityBg(daysOverdue(issue.due_date))"
              >
                <div class="text-base">{{ daysOverdue(issue.due_date) }}</div>
                <div class="text-[8px] opacity-80">ngày</div>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                  <span class="text-[10px] font-mono text-gray-400">{{ issue.issue_key }}</span>
                  <span class="badge text-[10px]" :class="statusBadge(issue.status)">{{ statusLabel(issue.status) }}</span>
                  <span v-if="issue.priority === 'critical'" class="badge bg-red-100 text-red-700 text-[10px]">🔴 Critical</span>
                  <span v-else-if="issue.priority === 'high'" class="badge bg-orange-100 text-orange-700 text-[10px]">🟠 High</span>
                </div>
                <div class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{{ issue.title }}</div>
                <div class="text-xs text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                  <span class="flex items-center gap-1 text-red-500">
                    <ClockIcon class="w-3 h-3" />
                    Hạn {{ formatDate(issue.due_date) }}
                  </span>
                  <span v-if="!filterByAssignee && issue.assignee" class="flex items-center gap-1">
                    <UserAvatar :user="issue.assignee" size="xs" class="w-4 h-4" />
                    {{ issue.assignee?.full_name }}
                  </span>
                  <span v-if="!filterByProject && projectName(issue.project)" class="text-brand-600 dark:text-brand-400">
                    {{ projectName(issue.project) }}
                  </span>
                </div>
              </div>
              <ChevronRightIcon class="w-4 h-4 text-gray-300 mt-1 flex-shrink-0" />
            </button>
          </div>
        </div>
      </div>

      <!-- Nested issue modal -->
      <IssueModal v-if="selectedIssueId" :issue-id="selectedIssueId" @close="selectedIssueId = null" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  XMarkIcon, ExclamationTriangleIcon, ChevronRightIcon, ClockIcon, CheckCircleIcon,
} from '@heroicons/vue/24/outline'
import { format } from 'date-fns'

const props = defineProps<{
  issues: any[]
  title: string
  filterByProject?: number
  filterByAssignee?: number
  projects?: any[]
}>()
defineEmits(['close'])

const selectedIssueId = ref<number | null>(null)

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function daysOverdue(due: string) {
  if (!due) return 0
  const today = startOfToday()
  return Math.floor((today.getTime() - new Date(due).getTime()) / (24 * 60 * 60 * 1000))
}

const filtered = computed(() => {
  const today = startOfToday()
  return props.issues
    .filter((i: any) =>
      i.due_date &&
      new Date(i.due_date) < today &&
      i.status !== 'done' &&
      i.status !== 'cancelled' &&
      (props.filterByProject == null || i.project === props.filterByProject) &&
      (props.filterByAssignee == null || i.assignee?.id === props.filterByAssignee)
    )
    .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
})

const totalDaysOverdue = computed(() =>
  filtered.value.reduce((acc: number, i: any) => acc + daysOverdue(i.due_date), 0)
)
const avgDaysOverdue = computed(() =>
  filtered.value.length ? Math.round(totalDaysOverdue.value / filtered.value.length) : 0
)
const maxDaysOverdue = computed(() =>
  filtered.value.reduce((m: number, i: any) => Math.max(m, daysOverdue(i.due_date)), 0)
)

function severityBg(days: number) {
  if (days >= 14) return 'bg-gradient-to-br from-red-700 to-red-900'
  if (days >= 7) return 'bg-gradient-to-br from-red-500 to-red-600'
  if (days >= 3) return 'bg-gradient-to-br from-orange-500 to-red-500'
  return 'bg-gradient-to-br from-amber-400 to-orange-500'
}

const STATUS_LABELS: Record<string, string> = {
  todo: 'Chưa làm',
  in_progress: 'Đang làm',
  in_review: 'Đang review',
  testing: 'Testing',
  bug_fixing: 'Sửa lỗi',
  done: 'Hoàn thành',
  cancelled: 'Đã hủy',
}
const STATUS_BADGES: Record<string, string> = {
  todo: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  in_review: 'bg-purple-100 text-purple-700',
  testing: 'bg-cyan-100 text-cyan-700',
  bug_fixing: 'bg-orange-100 text-orange-700',
}
function statusLabel(s: string) { return STATUS_LABELS[s] || s }
function statusBadge(s: string) { return STATUS_BADGES[s] || 'bg-gray-100 text-gray-700' }
function formatDate(d: string) { return format(new Date(d), 'dd/MM/yyyy') }
function projectName(id: number) { return props.projects?.find((p: any) => p.id === id)?.name }
</script>

<style scoped>
@keyframes slide-in-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-slide-in-right { animation: slide-in-right 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
.animate-fade-in { animation: fade-in 0.2s ease-out; }
</style>

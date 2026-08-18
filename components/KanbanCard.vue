<template>
  <div
    :data-id="issue.id"
    @click="$emit('click')"
    class="group relative bg-white dark:bg-dark-50
           rounded-xl border border-surface-200/80 dark:border-dark-50
           p-3 cursor-grab active:cursor-grabbing
           hover:border-brand-300 dark:hover:border-brand-700
           hover:shadow-card-hover
           transition-all duration-150 select-none"
    :class="{
      'border-l-4 border-l-red-500':    isOverdue,
      'border-l-4 border-l-orange-400': isDueToday && !isOverdue,
      'opacity-60':                     issue.status === 'cancelled',
    }"
  >
    <!-- ── Top row: type icon + key + priority ── -->
    <div class="flex items-center gap-1.5 mb-2">
      <IssueTypeIcon :type="issue.issue_type" class="w-3.5 h-3.5 flex-shrink-0" />
      <span class="text-[11px] font-mono text-gray-400 dark:text-gray-500 leading-none">
        {{ issue.issue_key }}
      </span>
      <CopyButton
        :text="issue.issue_key"
        :label="issue.issue_key"
        size="xs"
        class="opacity-0 group-hover:opacity-100 transition-opacity -ml-1"
      />

      <!-- GitHub commit badge -->
      <span v-if="issue.github_commit_sha"
            class="text-[10px] font-mono bg-gray-100 dark:bg-dark-100 text-gray-500 px-1 rounded leading-none"
            :title="`Commit: ${issue.github_commit_sha}`">
        {{ issue.github_commit_sha.slice(0,7) }}
      </span>

      <div class="ml-auto flex items-center gap-1">
        <!-- Báo đỏ (escalate) -->
        <span v-if="issue.is_escalated"
              class="flex items-center gap-0.5 text-[10px] font-bold text-white
                     bg-red-600 px-1.5 py-0.5 rounded-md leading-none animate-pulse"
              :title="issue.escalation_note || 'Task bị báo đỏ — cần xử lý gấp'">
          🚩 Báo đỏ
        </span>
        <!-- Bug count badge -->
        <span v-if="issue.open_bug_count > 0"
              class="flex items-center gap-0.5 text-[10px] font-bold text-red-500
                     bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-md leading-none"
              :title="`${issue.open_bug_count} bug chưa sửa`">
          🐛{{ issue.open_bug_count }}
        </span>
        <IssuePriorityIcon :priority="issue.priority" class="w-3.5 h-3.5" />
      </div>
    </div>

    <!-- ── Title ── -->
    <p class="text-sm font-semibold text-gray-900 dark:text-gray-100
              leading-snug mb-2.5 line-clamp-2
              group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors">
      {{ issue.title }}
    </p>

    <!-- ── Labels ── -->
    <div v-if="issue.labels?.length" class="flex flex-wrap gap-1 mb-2">
      <span v-for="lb in issue.labels.slice(0,3)" :key="lb.id"
            class="text-[10px] font-semibold px-1.5 py-0.5 rounded-md leading-none"
            :style="{ backgroundColor: lb.color + '18', color: lb.color }">
        {{ lb.name }}
      </span>
    </div>

    <!-- ── Footer ── -->
    <div class="flex items-center gap-1.5 mt-2">
      <!-- Story points -->
      <span v-if="issue.story_points"
            class="text-[11px] font-bold text-gray-500 bg-surface-100 dark:bg-dark-100
                   px-1.5 py-0.5 rounded-md leading-none">
        {{ issue.story_points }}pt
      </span>

      <!-- AI estimate badge -->
      <span v-if="issue.ai_estimate"
            class="text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none"
            :class="issue.ai_estimate.sp_final
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'"
            :title="`AI gợi ý ${issue.ai_estimate.sp_suggested} SP, tin cậy ${Math.round((issue.ai_estimate.confidence || 0) * 100)}%`">
        🤖 {{ issue.ai_estimate.sp_final ?? issue.ai_estimate.sp_suggested }} SP
      </span>

      <!-- Due date -->
      <span v-if="issue.due_date"
            class="flex items-center gap-0.5 text-[11px] font-medium leading-none"
            :class="{
              'text-red-500':    isOverdue,
              'text-orange-500': isDueToday && !isOverdue,
              'text-gray-400':   !isOverdue && !isDueToday,
            }">
        <CalendarIcon class="w-3 h-3" />
        {{ formatDate(issue.due_date) }}
      </span>

      <!-- Comment count -->
      <span v-if="issue.comment_count"
            class="flex items-center gap-0.5 text-[11px] text-gray-400 leading-none">
        <ChatBubbleLeftIcon class="w-3 h-3" />
        {{ issue.comment_count }}
      </span>

      <!-- Subtask progress -->
      <span v-if="issue.subtask_count"
            class="flex items-center gap-0.5 text-[11px] text-gray-400 leading-none">
        <CheckCircleIcon class="w-3 h-3" />
        {{ issue.subtask_count }}
      </span>

      <!-- Total time (if tracked) -->
      <span v-if="issue.total_time_formatted"
            class="flex items-center gap-0.5 text-[10px] text-gray-400 leading-none ml-0.5"
            title="Tổng thời gian">
        <ClockIcon class="w-3 h-3" />
        {{ issue.total_time_formatted }}
      </span>

      <!-- Tester avatar (if assigned) -->
      <div v-if="issue.tester"
           class="flex items-center gap-0.5 ml-auto"
           :title="`Tester: ${issue.tester.full_name}`">
        <span class="text-[9px] text-purple-400 font-bold">QA</span>
        <UserAvatar :user="issue.tester" size="xs" />
      </div>

      <!-- Assignee avatar -->
      <div v-else class="ml-auto">
        <UserAvatar v-if="issue.assignee" :user="issue.assignee" size="xs" :tooltip="true" />
        <button v-else
                @click.stop="showAssignMenu = !showAssignMenu"
                class="w-5 h-5 rounded-full border border-dashed border-gray-300 dark:border-gray-600
                       hover:border-brand-400 flex items-center justify-center
                       opacity-0 group-hover:opacity-100 transition-opacity"
                title="Phân công">
          <PlusIcon class="w-2.5 h-2.5 text-gray-400" />
        </button>
      </div>
    </div>

    <!-- ── QA status bar (when in testing / bug_fixing) ── -->
    <div v-if="issue.status === 'bug_fixing'"
         class="mt-2 pt-2 border-t border-red-100 dark:border-red-900/30
                flex items-center gap-1.5 text-[10px] text-red-500 font-medium">
      <BugAntIcon class="w-3 h-3" />
      {{ issue.open_bug_count || '?' }} bug chờ sửa
    </div>
    <div v-else-if="issue.status === 'testing'"
         class="mt-2 pt-2 border-t border-purple-100 dark:border-purple-900/30
                flex items-center gap-1.5 text-[10px] text-purple-500 font-medium">
      <BeakerIcon class="w-3 h-3" />
      Đang kiểm tra...
    </div>

    <!-- ── Hover action strip (appears on hover) ── -->
    <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity
                flex items-center gap-0.5 bg-white dark:bg-dark-100 rounded-lg shadow-sm
                border border-surface-200 dark:border-dark-50 px-1 py-0.5">
      <button v-for="action in quickActions" :key="action.status"
              @click.stop="$emit('quick-status', action.status)"
              :title="action.label"
              class="px-1.5 py-0.5 text-[10px] rounded hover:bg-surface-100 dark:hover:bg-dark-50
                     font-medium transition-colors leading-none"
              :class="action.class">
        {{ action.emoji }}
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import {
  CalendarIcon, ChatBubbleLeftIcon, ClockIcon,
  CheckCircleIcon, PlusIcon, BugAntIcon, BeakerIcon
} from '@heroicons/vue/24/outline'
import { format, isToday, isPast } from 'date-fns'

const props = defineProps<{
  issue: any
  colKey: string
}>()
const emit = defineEmits(['click', 'quick-status', 'quick-assign'])

const showAssignMenu = ref(false)

// Due date helpers
const dueDate = computed(() =>
  props.issue.due_date ? new Date(props.issue.due_date) : null
)
const isOverdue = computed(() =>
  dueDate.value && props.issue.status !== 'done' && isPast(dueDate.value) && !isToday(dueDate.value)
)
const isDueToday = computed(() =>
  dueDate.value && props.issue.status !== 'done' && isToday(dueDate.value)
)

function formatDate(d: string) {
  const dt = new Date(d)
  if (isToday(dt)) return 'Hôm nay'
  return format(dt, 'dd/MM')
}

// Quick action buttons (shown on card hover, skip current status)
const ALL_ACTIONS = [
  { status: 'todo',        label: 'Chuyển To Do',        emoji: '📋', class: 'text-gray-500' },
  { status: 'in_progress', label: 'Bắt đầu làm',         emoji: '⚡', class: 'text-blue-500' },
  { status: 'in_review',   label: 'Chờ test',            emoji: '👀', class: 'text-yellow-500' },
  { status: 'done',        label: 'Đánh dấu hoàn thành', emoji: '✅', class: 'text-green-500' },
]
const quickActions = computed(() =>
  ALL_ACTIONS.filter(a => a.status !== props.colKey)
)
</script>

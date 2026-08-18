<template>
  <div
    class="flex items-center gap-3 px-5 py-3 hover:bg-surface-50 dark:hover:bg-dark-50/50 transition-colors group"
    :class="{
      'bg-red-50/40 dark:bg-red-900/5': variant === 'overdue',
      'bg-orange-50/30 dark:bg-orange-900/5': variant === 'today',
    }"
  >
    <!-- Type icon -->
    <IssueTypeIcon :type="issue.issue_type" class="w-4 h-4 flex-shrink-0" />

    <!-- Key -->
    <span class="text-xs font-mono text-gray-400 w-20 flex-shrink-0">{{ issue.issue_key }}</span>

    <!-- Title (clickable) -->
    <button
      @click="$emit('click')"
      class="flex-1 text-left text-sm text-gray-900 dark:text-gray-100 hover:text-brand-600 dark:hover:text-brand-400 font-medium truncate transition-colors"
    >
      {{ issue.title }}
    </button>

    <!-- Due date badge -->
    <div class="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium" :class="dueDateClass">
      <CalendarIcon class="w-3.5 h-3.5" />
      <span>{{ dueDateText }}</span>
    </div>

    <!-- Priority -->
    <IssuePriorityIcon :priority="issue.priority" class="w-3.5 h-3.5 flex-shrink-0" />

    <!-- Assignee -->
    <UserAvatar v-if="issue.assignee" :user="issue.assignee" size="xs" />

    <!-- Actions -->
    <div class="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
      <!-- Mark done -->
      <button
        @click="$emit('mark-done')"
        class="btn-sm text-xs bg-green-500 hover:bg-green-600 text-white rounded-lg px-2.5 py-1 flex items-center gap-1 transition-colors"
        title="Đánh dấu hoàn thành"
      >
        <CheckIcon class="w-3.5 h-3.5" />
        Done
      </button>

      <!-- Snooze -->
      <DeadlineSnoozeMenu :issue="issue" @snoozed="$emit('snoozed')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarIcon, CheckIcon } from '@heroicons/vue/24/outline'
import { format, differenceInHours, differenceInDays } from 'date-fns'

const props = defineProps<{
  issue: any
  variant: 'overdue' | 'today' | 'upcoming'
}>()
defineEmits(['click', 'mark-done', 'snoozed'])

const now = new Date()
const dueDate = computed(() => props.issue.due_date ? new Date(props.issue.due_date) : null)

const dueDateText = computed(() => {
  if (!dueDate.value) return '—'
  const diffH = differenceInHours(dueDate.value, now)
  const diffD = differenceInDays(dueDate.value, now)
  if (diffH < 0) return `Quá hạn ${Math.abs(diffD) > 0 ? Math.abs(diffD) + ' ngày' : Math.abs(diffH) + ' giờ'}`
  if (diffH < 1) return 'Dưới 1 giờ'
  if (diffH < 24) return `Còn ${diffH} giờ`
  if (diffD === 0) return 'Hôm nay'
  if (diffD === 1) return 'Ngày mai'
  return format(dueDate.value, 'dd/MM/yyyy')
})

const dueDateClass = computed(() => {
  if (props.variant === 'overdue') return 'text-red-600 dark:text-red-400'
  if (props.variant === 'today') return 'text-orange-600 dark:text-orange-400'
  return 'text-blue-600 dark:text-blue-400'
})
</script>

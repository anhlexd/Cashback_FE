<template>
  <div
    @click="$emit('click')"
    class="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-50 dark:hover:bg-dark-50/50 cursor-pointer group transition-colors"
  >
    <!-- Checkbox chọn nhiều -->
    <input
      v-if="selectable"
      type="checkbox"
      :checked="selected"
      class="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 flex-shrink-0 cursor-pointer"
      @click.stop="$emit('toggle-select')"
      @mousedown.stop
    />

    <!-- Drag handle -->
    <div class="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-gray-300 flex-shrink-0">
      <Bars2Icon class="w-3.5 h-3.5" />
    </div>

    <!-- Type icon -->
    <IssueTypeIcon :type="issue.issue_type" class="w-3.5 h-3.5 flex-shrink-0 self-start mt-0.5" />

    <!-- Key -->
    <span class="text-xs font-mono text-gray-400 dark:text-gray-500 flex-shrink-0 self-start mt-0.5 inline-flex items-center gap-0.5">
      {{ issue.issue_key }}
      <CopyButton
        :text="issue.issue_key"
        :label="issue.issue_key"
        size="xs"
        class="opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </span>

    <!-- Title (hiển thị đầy đủ, xuống dòng) -->
    <span class="flex-1 min-w-0 text-sm text-gray-800 dark:text-gray-200 break-words leading-snug">
      <span v-if="issue.epic_key && issue.issue_type !== 'epic'" class="text-purple-500 text-xs mr-1">{{ issue.epic_key }}</span>
      {{ issue.title }}
    </span>

    <!-- Labels -->
    <div class="hidden md:flex items-center gap-1">
      <span
        v-for="label in issue.labels?.slice(0, 2)"
        :key="label.id"
        class="badge text-xs"
        :style="{ backgroundColor: label.color + '20', color: label.color }"
      >{{ label.name }}</span>
    </div>

    <!-- Story points -->
    <span
      class="w-6 h-6 rounded flex items-center justify-center text-xs font-medium flex-shrink-0"
      :class="issue.story_points
        ? 'bg-surface-200 dark:bg-dark-100 text-gray-600 dark:text-gray-300'
        : 'border border-dashed border-gray-200 dark:border-gray-700 text-gray-300'"
    >
      {{ issue.story_points || '?' }}
    </span>

    <!-- Priority -->
    <IssuePriorityIcon :priority="issue.priority" class="w-3.5 h-3.5 flex-shrink-0" />

    <!-- Status badge -->
    <span :class="`status-${issue.status}`" class="hidden sm:inline-flex text-xs">
      {{ statusLabel(issue.status) }}
    </span>

    <!-- Assignee -->
    <UserAvatar :user="issue.assignee" size="xs" />

    <!-- Due date -->
    <span
      v-if="issue.due_date"
      class="text-xs flex-shrink-0 hidden lg:block"
      :class="isOverdue ? 'text-red-500' : 'text-gray-400'"
    >
      {{ formatDate(issue.due_date) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { Bars2Icon } from '@heroicons/vue/24/outline'
import { format } from 'date-fns'

const props = defineProps<{ issue: any; selectable?: boolean; selected?: boolean }>()
defineEmits(['click', 'quick-assign', 'toggle-select'])

const isOverdue = computed(() =>
  props.issue.due_date &&
  props.issue.status !== 'done' &&
  new Date(props.issue.due_date) < new Date()
)

function formatDate(d: string) { return format(new Date(d), 'dd/MM') }

const STATUS_LABELS: Record<string, string> = {
  todo: 'To Do', in_progress: 'In Progress',
  in_review: 'In Review', done: 'Done', cancelled: 'Cancelled'
}
function statusLabel(s: string) { return STATUS_LABELS[s] || s }
</script>

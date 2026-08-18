<template>
  <div
    @click="$emit('click')"
    class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-50 dark:hover:bg-dark-50 cursor-pointer transition-colors group"
  >
    <IssueTypeIcon :type="issue.issue_type" class="w-4 h-4 flex-shrink-0" />
    <div class="flex-1 min-w-0">
      <div class="text-sm text-gray-800 dark:text-gray-200 truncate">{{ issue.title }}</div>
      <div class="flex items-center gap-0.5">
        <span class="text-xs text-gray-400 font-mono">{{ issue.issue_key }}</span>
        <CopyButton
          :text="issue.issue_key"
          :label="issue.issue_key"
          size="xs"
          class="opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
    </div>
    <IssuePriorityIcon :priority="issue.priority" class="w-3.5 h-3.5 flex-shrink-0" />
    <span :class="`status-${issue.status}`" class="text-xs hidden sm:inline-flex">
      {{ issue.status?.replace('_', ' ') }}
    </span>
    <span
      v-if="issue.due_date"
      class="text-xs flex-shrink-0"
      :class="isOverdue ? 'text-red-500' : 'text-gray-400'"
    >
      {{ formatDate(issue.due_date) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

const props = defineProps<{ issue: any }>()
defineEmits(['click'])

const isOverdue = computed(() =>
  props.issue.due_date &&
  props.issue.status !== 'done' &&
  new Date(props.issue.due_date) < new Date()
)

function formatDate(d: string) { return format(new Date(d), 'dd/MM') }
</script>

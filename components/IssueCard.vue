<template>
  <div
    @click="$emit('click')"
    class="group bg-white dark:bg-dark-50 rounded-lg border border-surface-200 dark:border-dark-50 p-3
           hover:shadow-card-hover hover:border-brand-200 dark:hover:border-brand-800
           transition-all duration-150 cursor-pointer select-none"
  >
    <!-- Type + Priority -->
    <div class="flex items-center gap-1.5 mb-2">
      <IssueTypeIcon :type="issue.issue_type" class="w-3.5 h-3.5 flex-shrink-0" />
      <span class="text-xs font-mono text-gray-400 dark:text-gray-500">{{ issue.issue_key }}</span>
      <div class="ml-auto">
        <IssuePriorityIcon :priority="issue.priority" class="w-3.5 h-3.5" />
      </div>
    </div>

    <!-- Title -->
    <p class="text-sm text-gray-900 dark:text-gray-100 font-medium leading-snug mb-2.5 line-clamp-2">
      {{ issue.title }}
    </p>

    <!-- Labels -->
    <div v-if="issue.labels?.length" class="flex flex-wrap gap-1 mb-2">
      <span
        v-for="label in issue.labels.slice(0, 3)"
        :key="label.id"
        class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
        :style="{ backgroundColor: label.color + '20', color: label.color }"
      >
        {{ label.name }}
      </span>
    </div>

    <!-- Footer -->
    <div class="flex items-center gap-2 mt-2">
      <!-- Story points -->
      <span v-if="issue.story_points" class="text-xs font-medium text-gray-400 bg-surface-100 dark:bg-dark-100 px-1.5 py-0.5 rounded">
        {{ issue.story_points }}
      </span>

      <!-- AI estimate badge -->
      <span v-if="issue.ai_estimate"
            class="text-[10px] font-bold px-1.5 py-0.5 rounded leading-none"
            :class="issue.ai_estimate.sp_final
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'"
            :title="`AI gợi ý ${issue.ai_estimate.sp_suggested} SP, tin cậy ${Math.round((issue.ai_estimate.confidence || 0) * 100)}%`">
        🤖 {{ issue.ai_estimate.sp_final ?? issue.ai_estimate.sp_suggested }}
      </span>

      <!-- Due date -->
      <span
        v-if="issue.due_date"
        class="text-xs flex items-center gap-1"
        :class="isOverdue ? 'text-red-500' : 'text-gray-400'"
      >
        <CalendarIcon class="w-3 h-3" />
        {{ formatDate(issue.due_date) }}
      </span>

      <!-- Comment count -->
      <span v-if="issue.comment_count" class="text-xs text-gray-400 flex items-center gap-1">
        <ChatBubbleOvalLeftIcon class="w-3 h-3" />
        {{ issue.comment_count }}
      </span>

      <!-- Subtask count -->
      <span v-if="issue.subtask_count" class="text-xs text-gray-400 flex items-center gap-1">
        <Bars3Icon class="w-3 h-3" />
        {{ issue.subtask_count }}
      </span>

      <!-- Assignee -->
      <div class="ml-auto">
        <UserAvatar v-if="issue.assignee" :user="issue.assignee" size="xs" :tooltip="true" />
        <div v-else class="w-5 h-5 rounded-full border border-dashed border-gray-300 dark:border-gray-600"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarIcon, ChatBubbleOvalLeftIcon, Bars3Icon } from '@heroicons/vue/24/outline'
import { format } from 'date-fns'

const props = defineProps<{ issue: any }>()
defineEmits(['click', 'update'])

const isOverdue = computed(() => {
  if (!props.issue.due_date || props.issue.status === 'done') return false
  return new Date(props.issue.due_date) < new Date()
})

function formatDate(d: string) {
  return format(new Date(d), 'dd/MM')
}
</script>

<template>
  <div class="card overflow-hidden">
    <!-- Sprint Header -->
    <div class="flex items-center gap-3 px-4 py-3 border-b border-surface-200 dark:border-dark-50"
         :class="isActive ? 'bg-brand-50 dark:bg-brand-950/20' : ''">
      <button @click="open = !open" class="flex items-center gap-2">
        <ChevronRightIcon class="w-4 h-4 text-gray-400 transition-transform duration-200"
                          :class="{ 'rotate-90': open }" />
        <span class="font-semibold text-sm" :class="isActive ? 'text-brand-700 dark:text-brand-300' : 'text-gray-900 dark:text-white'">
          {{ sprint.name }}
        </span>
        <span v-if="isActive" class="badge bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
          Active
        </span>
        <span v-else-if="isCompleted" class="badge bg-gray-100 text-gray-600 dark:bg-dark-50 dark:text-gray-300 text-xs">
          Completed
        </span>
      </button>

      <!-- Sprint dates -->
      <span v-if="sprint.start_date" class="text-xs text-gray-400">
        {{ formatDate(sprint.start_date) }} → {{ sprint.end_date ? formatDate(sprint.end_date) : '?' }}
      </span>

      <!-- Progress bar -->
      <div class="flex items-center gap-2 flex-1 max-w-40">
        <div class="flex-1 h-1.5 bg-surface-200 dark:bg-dark-50 rounded-full overflow-hidden">
          <div
            class="h-full bg-green-500 rounded-full transition-all duration-500"
            :style="{ width: sprint.completion_rate + '%' }"
          ></div>
        </div>
        <span class="text-xs text-gray-400 flex-shrink-0">{{ sprint.completion_rate }}%</span>
      </div>

      <span class="text-xs text-gray-400">{{ issues.length }} issues</span>
      <span v-if="sprint.total_points" class="text-xs text-gray-400">{{ sprint.total_points }} pts</span>

      <div class="flex-1"></div>

      <!-- Actions -->
      <div class="flex items-center gap-1.5">
        <button v-if="!readOnly" @click="$emit('create-issue')" class="btn-ghost btn-sm text-gray-400 text-xs">
          <PlusIcon class="w-3.5 h-3.5" /> Issue
        </button>
        <button
          v-if="isActive"
          @click="$emit('complete-sprint', sprint.id)"
          class="btn-secondary btn-sm text-xs"
        >
          Hoàn thành Sprint
        </button>
        <button
          v-else-if="sprint.status === 'planning'"
          @click="$emit('start-sprint', sprint)"
          class="btn-primary btn-sm text-xs"
        >
          Bắt đầu Sprint
        </button>
      </div>
    </div>

    <!-- Sprint goal -->
    <div v-if="open && sprint.goal" class="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 bg-surface-50 dark:bg-dark-50/50 border-b border-surface-100 dark:border-dark-50 italic">
      🎯 {{ sprint.goal }}
    </div>

    <!-- Issues list -->
    <div v-if="open">
      <div v-if="loading" class="p-4 space-y-2">
        <div v-for="i in 3" :key="i" class="h-10 bg-surface-100 dark:bg-dark-50 rounded animate-pulse"></div>
      </div>
      <div v-else-if="issues.length === 0" class="p-6 text-center text-sm text-gray-400">
        {{ readOnly ? 'Sprint này không còn issue hiển thị.' : 'Sprint trống. Kéo issue từ backlog vào đây.' }}
      </div>
      <VueDraggable
        v-model="issuesMutable"
        :group="readOnly ? undefined : 'sprint-issues'"
        :disabled="readOnly"
        class="divide-y divide-surface-100 dark:divide-dark-50 min-h-[40px]"
        :class="readOnly ? 'opacity-95' : ''"
        ghost-class="sortable-ghost"
        :animation="150"
        @add="onIssueAdded"
      >
        <BacklogIssueRow
          v-for="element in issuesMutable"
          :key="element.id"
          :data-id="element.id"
          :issue="element"
          @click="$emit('issue-click', element.id)"
        />
      </VueDraggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronRightIcon, PlusIcon } from '@heroicons/vue/24/outline'
import { VueDraggable } from 'vue-draggable-plus'
import { format } from 'date-fns'

const props = defineProps<{
  sprint: any
  issues: any[]
  loading?: boolean
  isActive?: boolean
  isCompleted?: boolean
  readOnly?: boolean
  initiallyOpen?: boolean
}>()

const emit = defineEmits(['create-issue', 'start-sprint', 'complete-sprint', 'issue-click', 'issue-moved'])

const open = ref(props.initiallyOpen ?? true)
const issuesMutable = ref([...props.issues])

watch(() => props.issues, (v) => { issuesMutable.value = [...v] })

function formatDate(d: string) {
  return format(new Date(d), 'dd/MM/yy')
}

function onIssueAdded(event: any) {
  if (props.readOnly) return
  const issueId = event.item?.getAttribute('data-id')
  if (issueId) {
    emit('issue-moved', Number(issueId), props.sprint.id)
  }
}
</script>

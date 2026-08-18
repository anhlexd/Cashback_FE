<template>
  <div class="card p-5 border-l-4" :class="borderClass">
    <div class="flex items-start justify-between mb-3">
      <div>
        <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ label }}</div>
        <div class="text-3xl font-black mt-1" :class="valueClass">{{ count }}</div>
      </div>
      <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="iconBg">
        <component :is="icon" class="w-5 h-5" :class="iconColor" />
      </div>
    </div>

    <!-- Issue list preview -->
    <div v-if="issues.length > 0" class="space-y-1.5 mt-3 pt-3 border-t border-surface-100 dark:border-dark-50">
      <button
        v-for="issue in issues.slice(0, 3)"
        :key="issue.id"
        @click="$emit('click-issue', issue)"
        class="w-full flex items-center gap-2 text-xs text-left hover:bg-surface-50 dark:hover:bg-dark-50 rounded-lg p-1.5 -mx-1.5 transition-colors group"
      >
        <IssueTypeIcon :type="issue.issue_type" class="w-3.5 h-3.5 flex-shrink-0" />
        <span class="flex-1 truncate text-gray-700 dark:text-gray-300 group-hover:text-brand-600 dark:group-hover:text-brand-400">
          {{ issue.title }}
        </span>
        <span class="text-gray-400 font-mono flex-shrink-0">{{ issue.issue_key }}</span>
      </button>
      <NuxtLink v-if="count > 3" to="/deadline" class="block text-xs text-brand-600 dark:text-brand-400 hover:underline pl-1.5">
        Xem tất cả {{ count }} issues →
      </NuxtLink>
    </div>

    <NuxtLink v-if="count === 0" to="/deadline" class="block text-xs text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 mt-2 transition-colors">
      Xem deadlines →
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { ExclamationCircleIcon, ClockIcon, CalendarDaysIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  variant: 'overdue' | 'today' | 'week'
  count: number
  issues: any[]
}>()
defineEmits(['click-issue'])

const config = {
  overdue: {
    label: 'Quá hạn',
    border: 'border-red-500',
    value: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    icon: ExclamationCircleIcon,
  },
  today: {
    label: 'Hết hạn hôm nay',
    border: 'border-orange-500',
    value: 'text-orange-600 dark:text-orange-400',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-500',
    icon: ClockIcon,
  },
  week: {
    label: 'Trong tuần này',
    border: 'border-blue-400',
    value: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-500',
    icon: CalendarDaysIcon,
  },
}

const label = computed(() => config[props.variant].label)
const borderClass = computed(() => config[props.variant].border)
const valueClass = computed(() => config[props.variant].value)
const iconBg = computed(() => config[props.variant].iconBg)
const iconColor = computed(() => config[props.variant].iconColor)
const icon = computed(() => config[props.variant].icon)
</script>

<template>
  <div class="card p-4">
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ label }}</span>
      <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="iconBg">
        <component :is="iconComponent" class="w-4 h-4" :class="iconColor" />
      </div>
    </div>
    <div v-if="loading" class="h-8 w-16 bg-surface-200 dark:bg-dark-50 rounded animate-pulse"></div>
    <div v-else class="text-2xl font-bold text-gray-900 dark:text-white">{{ value }}</div>
  </div>
</template>

<script setup lang="ts">
import {
  ClipboardDocumentListIcon, CheckCircleIcon,
  ClockIcon, ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  label: string
  value: number
  icon: string
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple'
  loading?: boolean
}>()

const icons: Record<string, any> = {
  ClipboardDocumentListIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon
}

const iconComponent = computed(() => icons[props.icon] || ClipboardDocumentListIcon)

const colorMap = {
  blue:   { bg: 'bg-blue-100 dark:bg-blue-900/30',   color: 'text-blue-600 dark:text-blue-400' },
  green:  { bg: 'bg-green-100 dark:bg-green-900/30', color: 'text-green-600 dark:text-green-400' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', color: 'text-orange-600 dark:text-orange-400' },
  red:    { bg: 'bg-red-100 dark:bg-red-900/30',     color: 'text-red-600 dark:text-red-400' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', color: 'text-purple-600 dark:text-purple-400' },
}

const iconBg = computed(() => colorMap[props.color].bg)
const iconColor = computed(() => colorMap[props.color].color)
</script>

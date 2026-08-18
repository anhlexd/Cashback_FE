<template>
  <span :class="iconClass" :title="type">
    <svg viewBox="0 0 16 16" fill="currentColor" v-bind="$attrs">
      <!-- Task: checkmark square -->
      <template v-if="type === 'task'">
        <rect x="1" y="1" width="14" height="14" rx="2" fill="currentColor" opacity="0.15"/>
        <path d="M4 8l3 3 5-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </template>
      <!-- Bug: bug icon -->
      <template v-else-if="type === 'bug'">
        <circle cx="8" cy="8" r="6" fill="currentColor" opacity="0.15"/>
        <path d="M8 5v6M5.5 6.5l5 0M5 8h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/>
      </template>
      <!-- Story: bookmark -->
      <template v-else-if="type === 'story'">
        <path d="M3 2h10a1 1 0 011 1v11l-5-3-5 3V3a1 1 0 011-1z" fill="currentColor" opacity="0.15"/>
        <path d="M3 2h10a1 1 0 011 1v11l-5-3-5 3V3a1 1 0 011-1z" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linejoin="round"/>
      </template>
      <!-- Epic: lightning bolt -->
      <template v-else-if="type === 'epic'">
        <path d="M9 2L4 9h5l-2 5 7-7H9L11 2z" fill="currentColor"/>
      </template>
      <!-- Subtask: small checkmark -->
      <template v-else>
        <rect x="2" y="2" width="12" height="12" rx="2" fill="currentColor" opacity="0.12"/>
        <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.3" fill="none"/>
        <path d="M5 8l2.5 2.5 4-4" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </template>
    </svg>
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{ type: string }>()

const iconClass = computed(() => ({
  'text-blue-500': props.type === 'task',
  'text-red-500': props.type === 'bug',
  'text-green-500': props.type === 'story',
  'text-purple-500': props.type === 'epic',
  'text-gray-400': props.type === 'subtask',
}))
</script>

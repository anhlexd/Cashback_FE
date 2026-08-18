<template>
  <span :class="iconClass" :title="priority">
    <svg viewBox="0 0 16 16" fill="currentColor" v-bind="$attrs">
      <!-- Critical: double up arrow -->
      <template v-if="priority === 'critical'">
        <path d="M8 2l4 5H9v2l3-0 0 5H4v-5H4l-0-2H4L8 2z" opacity="0.2"/>
        <path d="M5 9l3-4 3 4M5 12l3-4 3 4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </template>
      <!-- High: single up arrow -->
      <template v-else-if="priority === 'high'">
        <path d="M5 10l3-5 3 5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="8" y1="5" x2="8" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </template>
      <!-- Medium: horizontal lines -->
      <template v-else-if="priority === 'medium'">
        <line x1="3" y1="6" x2="13" y2="6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="3" y1="10" x2="13" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </template>
      <!-- Low: single down arrow -->
      <template v-else>
        <path d="M5 6l3 5 3-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="8" y1="11" x2="8" y2="3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </template>
    </svg>
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{ priority: string }>()

const iconClass = computed(() => ({
  'text-red-500': props.priority === 'critical',
  'text-orange-500': props.priority === 'high',
  'text-yellow-500': props.priority === 'medium',
  'text-green-500': props.priority === 'low',
}))
</script>

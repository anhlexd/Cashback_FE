<template>
  <span class="w-2 h-2 rounded-full flex-shrink-0" :class="dotClass" :title="status"></span>
</template>

<script setup lang="ts">
const props = defineProps<{ status: string }>()

const dotClass = computed(() => ({
  'bg-yellow-400': props.status === 'planning',
  'bg-green-400':  props.status === 'active',
  'bg-orange-400': props.status === 'on_hold',
  'bg-blue-400':   props.status === 'completed',
  'bg-gray-300':   props.status === 'archived',
}))
</script>

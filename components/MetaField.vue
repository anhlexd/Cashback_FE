<template>
  <div>
    <div class="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1.5">{{ label }}</div>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string }>()
</script>

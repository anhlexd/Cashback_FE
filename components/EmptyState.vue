<template>
  <div
    class="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-surface-200 py-14 text-center dark:border-dark-50"
  >
    <div class="grid h-14 w-14 place-items-center rounded-2xl bg-surface-100 text-gray-300 dark:bg-dark-50 dark:text-gray-600">
      <component :is="icon" class="h-7 w-7" />
    </div>
    <div class="text-sm font-medium text-gray-400">{{ text }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ icon: any; text: string }>();
</script>

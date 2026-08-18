<template>
  <img
    src="/idt-logo.png"
    :alt="alt"
    class="object-contain object-left"
    :class="compact ? compactClass : expandedClass"
    draggable="false"
  />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Sidebar thu gọn */
    compact?: boolean
    compactClass?: string
    expandedClass?: string
    alt?: string
  }>(),
  {
    compact: false,
    compactClass: 'h-9 w-9 object-cover object-top rounded-sm',
    expandedClass: 'h-10 w-auto max-w-[200px]',
    alt: 'Integrated Development Technologies',
  }
)
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold"
    :class="style"
  >
    {{ label }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{ platform: string }>();

const map: Record<string, { label: string; style: string }> = {
  shopee: {
    label: "Shopee",
    style: "bg-orange-50 text-orange-500 dark:bg-orange-950/30 dark:text-orange-400",
  },
  tiktok: {
    label: "TikTok",
    style: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/30 dark:text-cyan-400",
  },
};

const label = computed(() => map[props.platform]?.label ?? props.platform);
const style = computed(
  () => map[props.platform]?.style ?? "bg-surface-100 text-gray-500 dark:bg-dark-50 dark:text-gray-400"
);
</script>

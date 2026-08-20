<template>
  <span
    class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold"
    :class="style"
  >
    {{ label }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  kind: "transaction" | "cashback" | "withdrawal";
  status: string;
}>();

const amber = "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400";
const emerald = "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400";
const rose = "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400";
const blue = "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400";
const gray = "bg-surface-100 text-gray-500 dark:bg-dark-50 dark:text-gray-400";

const maps: Record<string, Record<string, { label: string; style: string }>> = {
  transaction: {
    pending: { label: "Chờ xác nhận", style: amber },
    approved: { label: "Đã duyệt", style: emerald },
    rejected: { label: "Từ chối", style: rose },
  },
  cashback: {
    pending: { label: "Chờ xử lý", style: amber },
    approved: { label: "Đã duyệt", style: emerald },
    rejected: { label: "Từ chối", style: rose },
    paid: { label: "Đã thanh toán", style: blue },
  },
  withdrawal: {
    pending: { label: "Chờ xử lý", style: amber },
    processing: { label: "Đang xử lý", style: blue },
    completed: { label: "Hoàn tất", style: emerald },
    rejected: { label: "Từ chối", style: rose },
    cancelled: { label: "Đã huỷ", style: gray },
  },
};

const entry = computed(() => maps[props.kind]?.[props.status]);
const label = computed(() => entry.value?.label ?? props.status);
const style = computed(() => entry.value?.style ?? gray);
</script>

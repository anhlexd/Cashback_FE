<template>
  <div
    class="group overflow-hidden border-b border-surface-200 bg-gradient-to-r from-orange-50 via-orange-50/70 to-orange-50 py-1.5 dark:border-dark-50 dark:from-orange-950/10 dark:via-orange-950/5 dark:to-orange-950/10"
  >
    <div class="flex w-max animate-marquee gap-8 whitespace-nowrap px-4 group-hover:[animation-play-state:paused]">
      <template v-for="n in 2" :key="n">
        <div
          v-for="(item, idx) in items"
          :key="`${n}-${idx}`"
          class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"
        >
          <span class="h-1.5 w-1.5 shrink-0 rounded-full" :class="item.dot" />
          <span class="font-semibold text-gray-700 dark:text-gray-200">{{ item.name }}</span>
          <span>vừa mua</span>
          <span class="max-w-[180px] truncate font-medium text-gray-700 dark:text-gray-200">{{ item.product }}</span>
          <span>trên</span>
          <span class="font-semibold" :class="item.platformColor">{{ item.platformLabel }}</span>
          <span>được hoàn</span>
          <span class="font-bold text-orange-500">{{ formatNumber(item.cashback) }}đ</span>
          <span class="text-gray-300 dark:text-gray-600">•</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
// Demo data — chưa có API "hoạt động gần đây" công khai, tạm hardcode để lên
// giao diện, nối API thật khi backend có endpoint tương ứng.
const items = [
  { name: "Bích V.", product: "Áo thun basic form rộng unisex", platformLabel: "Shopee", platformColor: "text-orange-500", cashback: 26567, dot: "bg-orange-400" },
  { name: "Minh Q.", product: "Tai nghe Bluetooth chống ồn", platformLabel: "TikTok Shop", platformColor: "text-cyan-500", cashback: 41200, dot: "bg-cyan-400" },
  { name: "Ngọc T.", product: "Sữa rửa mặt Cetaphil 400ml", platformLabel: "Shopee", platformColor: "text-orange-500", cashback: 9690, dot: "bg-orange-400" },
  { name: "Hoàng P.", product: "Bàn phím cơ AKKO hotswap", platformLabel: "Shopee", platformColor: "text-orange-500", cashback: 35600, dot: "bg-orange-400" },
  { name: "Thảo D.", product: "Kem chống nắng Anessa 60ml", platformLabel: "TikTok Shop", platformColor: "text-cyan-500", cashback: 18400, dot: "bg-cyan-400" },
];

function formatNumber(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n);
}
</script>

<style scoped>
@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
.animate-marquee {
  animation: marquee 32s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .animate-marquee {
    animation: none;
  }
}
</style>

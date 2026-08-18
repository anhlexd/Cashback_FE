<template>
  <Transition name="slide-down">
    <div
      v-if="shouldWarn"
      class="relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white shadow-md flex items-center gap-3 px-4 py-2.5 idle-banner"
    >
      <!-- Animated stripe background -->
      <div class="absolute inset-0 opacity-20 idle-stripes pointer-events-none"></div>

      <!-- Pulsing icon -->
      <div class="relative flex-shrink-0 w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
        <ExclamationTriangleIcon class="w-5 h-5 text-white animate-bounce-soft" />
        <span class="absolute inset-0 rounded-full ring-2 ring-white/50 animate-ping-slow"></span>
      </div>

      <!-- Message -->
      <div class="relative flex-1 min-w-0">
        <div class="font-bold text-sm flex items-center gap-2">
          <span class="uppercase tracking-wider text-[11px] bg-white/20 backdrop-blur px-1.5 py-0.5 rounded">Cảnh báo</span>
          Hãy bắt đầu công việc
        </div>
        <div class="text-xs text-white/90 mt-0.5">
          Bạn đang tham gia <strong>{{ projectsCount }}</strong> dự án nhưng <strong>không có task nào đang xử lý</strong>. Chọn một issue và bắt đầu nhé!
        </div>
      </div>

      <!-- Actions -->
      <div class="relative flex items-center gap-2 flex-shrink-0">
        <NuxtLink
          to="/my-issues"
          class="inline-flex items-center gap-1 bg-white text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md text-xs font-bold shadow-sm transition-colors"
        >
          Xem issues của tôi
          <ArrowRightIcon class="w-3 h-3" />
        </NuxtLink>
        <button
          type="button"
          @click="dismiss"
          class="text-white/70 hover:text-white p-1 rounded transition-colors"
          title="Đóng cảnh báo"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ExclamationTriangleIcon, ArrowRightIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const { shouldWarn, projectsCount, check, dismiss, startAutoRefresh, stopAutoRefresh } = useIdleTaskWarning()

onMounted(async () => {
  await check(true)
  startAutoRefresh()
})

onBeforeUnmount(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.idle-stripes {
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 0px,
    rgba(255, 255, 255, 0.15) 8px,
    transparent 8px,
    transparent 20px
  );
  animation: stripe-move 24s linear infinite;
}

@keyframes stripe-move {
  0%   { background-position: 0 0; }
  100% { background-position: 40px 0; }
}

@keyframes bounce-soft {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-3px); }
}
.animate-bounce-soft {
  animation: bounce-soft 1.6s ease-in-out infinite;
}

@keyframes ping-slow {
  0%   { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(1.7); opacity: 0; }
}
.animate-ping-slow {
  animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.idle-banner {
  box-shadow: 0 4px 14px -2px rgba(220, 38, 38, 0.4);
}

.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>

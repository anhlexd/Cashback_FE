<template>
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <TransitionGroup name="toast" tag="div" class="flex flex-col gap-2">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="flex items-start gap-3 px-4 py-3 rounded-xl shadow-modal min-w-[280px] max-w-sm pointer-events-auto"
          :class="toastClass(toast.type)"
        >
          <component :is="toastIcon(toast.type)" class="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
          <button @click="remove(toast.id)" class="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0">
            <XMarkIcon class="w-3.5 h-3.5" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  CheckCircleIcon, ExclamationCircleIcon,
  InformationCircleIcon, ExclamationTriangleIcon, XMarkIcon
} from '@heroicons/vue/24/outline'

const { toasts, remove } = useToast()

function toastClass(type: string) {
  return {
    'bg-green-600 text-white': type === 'success',
    'bg-red-600 text-white': type === 'error',
    'bg-brand-600 text-white': type === 'info',
    'bg-orange-500 text-white': type === 'warning',
  }
}

function toastIcon(type: string) {
  return {
    success: CheckCircleIcon,
    error: ExclamationCircleIcon,
    info: InformationCircleIcon,
    warning: ExclamationTriangleIcon,
  }[type] || InformationCircleIcon
}
</script>

<style scoped>
.toast-enter-active { animation: toast-in 0.3s ease; }
.toast-leave-active { animation: toast-in 0.2s ease reverse; }
@keyframes toast-in {
  from { opacity: 0; transform: translateY(8px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
</style>

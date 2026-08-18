<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        @click.self="closeLightbox"
      >
        <!-- Toolbar -->
        <div class="absolute top-3 right-3 flex items-center gap-2">
          <a
            :href="downloadUrl"
            download
            target="_blank"
            class="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Tải xuống"
            @click.stop
          >
            <ArrowDownTrayIcon class="w-5 h-5" />
          </a>
          <button
            class="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Đóng (Esc)"
            @click="closeLightbox"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <img
          v-if="src"
          :src="src"
          :alt="alt"
          class="max-w-[92vw] max-h-[88vh] object-contain rounded-lg shadow-2xl select-none"
          @click.stop
        />
        <p v-if="alt" class="absolute bottom-4 left-0 right-0 text-center text-xs text-white/70 px-4 truncate">
          {{ alt }}
        </p>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ArrowDownTrayIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const { isOpen, src, alt, downloadUrl, closeLightbox } = useLightbox()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) closeLightbox()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.18s ease;
}
.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
</style>

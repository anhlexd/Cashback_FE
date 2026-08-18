<template>
  <div
    ref="shellRef"
    class="space-y-2"
    :class="isFullscreen && 'fixed inset-0 z-[250] bg-white dark:bg-dark-100 p-4 overflow-auto'"
  >
    <div class="flex flex-wrap items-center gap-2">
      <div class="inline-flex rounded-lg border border-surface-200 dark:border-dark-50 p-0.5 text-[11px]">
        <button
          type="button"
          class="px-3 py-1.5 rounded-md font-medium transition-colors"
          :class="viewMode === '2d' ? 'bg-brand-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-surface-50 dark:hover:bg-dark-50'"
          @click="viewMode = '2d'"
        >
          2D
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded-md font-medium transition-colors"
          :class="viewMode === '3d' ? 'bg-brand-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-surface-50 dark:hover:bg-dark-50'"
          @click="viewMode = '3d'"
        >
          3D
        </button>
      </div>

      <button
        type="button"
        class="btn-secondary btn-sm !py-1 !text-[11px] inline-flex items-center gap-1.5"
        :title="isFullscreen ? 'Thoát toàn màn hình (Esc)' : 'Toàn màn hình (F)'"
        @click="toggleFullscreen"
      >
        <ArrowsPointingOutIcon v-if="!isFullscreen" class="w-3.5 h-3.5" />
        <ArrowsPointingInIcon v-else class="w-3.5 h-3.5" />
        {{ isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình' }}
        <kbd class="hidden sm:inline px-1 py-0.5 rounded bg-surface-100 dark:bg-dark-50 text-[9px] font-mono text-gray-500">F</kbd>
      </button>

      <p class="text-[10px] text-gray-400">
        <template v-if="isFullscreen">
          <kbd class="px-1 rounded bg-surface-100 dark:bg-dark-50 font-mono">Esc</kbd> hoặc <kbd class="px-1 rounded bg-surface-100 dark:bg-dark-50 font-mono">F</kbd> để thoát
        </template>
        <template v-else-if="viewMode === '2d'">SVG force · <kbd class="px-1 rounded bg-surface-100 dark:bg-dark-50 font-mono">F</kbd> toàn màn hình</template>
        <template v-else>Canvas 3D · <kbd class="px-1 rounded bg-surface-100 dark:bg-dark-50 font-mono">F</kbd> toàn màn hình</template>
      </p>
    </div>

    <KnowledgeGraph2DZoom
      v-if="viewMode === '2d' && graphData"
      :graph-data="graphData"
      :height="graphHeight"
      :force-layout="true"
      @ask-about="emit('ask-about', $event)"
    />
    <KnowledgeGraph3DLight
      v-else-if="viewMode === '3d' && graphData"
      :graph-data="graphData"
      :height="graphHeight"
      @ask-about="emit('ask-about', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/vue/24/outline'

const props = withDefaults(defineProps<{
  graphData: { nodes: any[]; edges: any[] } | null
  height?: number
  defaultMode?: '2d' | '3d'
}>(), {
  height: 520,
  defaultMode: '2d',
})

const emit = defineEmits<{ 'ask-about': [issueKey: string] }>()

const viewMode = ref<'2d' | '3d'>(props.defaultMode)
const shellRef = ref<HTMLElement>()
const isFullscreen = ref(false)
const viewportH = ref(520)

const graphHeight = computed(() =>
  isFullscreen.value ? viewportH.value : props.height,
)

function measureHeight() {
  if (!isFullscreen.value) {
    viewportH.value = props.height
    return
  }
  viewportH.value = Math.max(320, window.innerHeight - 72)
}

function isTypingTarget(el: EventTarget | null) {
  const t = el as HTMLElement | null
  if (!t) return false
  const tag = t.tagName?.toLowerCase()
  return tag === 'input' || tag === 'textarea' || tag === 'select' || t.isContentEditable
}

async function toggleFullscreen() {
  if (!shellRef.value) return
  if (isFullscreen.value) {
    isFullscreen.value = false
    if (document.fullscreenElement) {
      try { await document.exitFullscreen() } catch { /* ignore */ }
    }
  } else {
    isFullscreen.value = true
    try {
      await shellRef.value.requestFullscreen()
    } catch {
      /* CSS fixed overlay vẫn bật */
    }
  }
  measureHeight()
}

function onFullscreenChange() {
  const on = document.fullscreenElement === shellRef.value
  if (isFullscreen.value !== on) {
    isFullscreen.value = on
    measureHeight()
  }
}

function onKeydown(e: KeyboardEvent) {
  if ((e.key === 'f' || e.key === 'F') && !isTypingTarget(e.target)) {
    e.preventDefault()
    toggleFullscreen()
    return
  }
  if (e.key === 'Escape' && isFullscreen.value && !document.fullscreenElement) {
    isFullscreen.value = false
    measureHeight()
  }
}

watch(isFullscreen, measureHeight)
watch(() => props.height, measureHeight)

onMounted(() => {
  measureHeight()
  document.addEventListener('fullscreenchange', onFullscreenChange)
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', measureHeight)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', measureHeight)
  if (document.fullscreenElement === shellRef.value) {
    document.exitFullscreen?.()
  }
})
</script>

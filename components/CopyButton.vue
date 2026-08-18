<template>
  <button
    type="button"
    class="inline-flex items-center justify-center text-gray-400 hover:text-brand-500 transition-colors flex-shrink-0"
    :class="size === 'xs' ? 'p-0.5' : 'p-1 rounded hover:bg-surface-100 dark:hover:bg-dark-50'"
    :title="copied ? 'Đã copy!' : `Copy ${label || text}`"
    @click.stop="copy"
  >
    <CheckIcon v-if="copied" class="text-green-500" :class="iconClass" />
    <ClipboardDocumentIcon v-else :class="iconClass" />
  </button>
</template>

<script setup lang="ts">
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/vue/24/outline'

const props = withDefaults(
  defineProps<{ text: string; label?: string; size?: 'xs' | 'sm' }>(),
  { size: 'sm' },
)

const copied = ref(false)
const iconClass = computed(() => (props.size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5'))
let timer: any = null

async function copy() {
  const t = (props.text || '').toString()
  if (!t) return
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(t)
    } else {
      const ta = document.createElement('textarea')
      ta.value = t
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    copied.value = true
    try { useToast().success(`Đã copy ${props.label || t}`) } catch {}
    clearTimeout(timer)
    timer = setTimeout(() => { copied.value = false }, 1200)
  } catch {
    try { useToast().error('Không copy được') } catch {}
  }
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

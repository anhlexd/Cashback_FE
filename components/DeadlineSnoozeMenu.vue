<template>
  <div class="relative" ref="menuRef">
    <button
      @click="open = !open"
      class="btn-ghost btn-sm text-xs gap-1.5"
      :title="`Snooze nhắc nhở cho ${issue.issue_key}`"
    >
      <BellSlashIcon class="w-3.5 h-3.5" />
      <span class="hidden sm:inline">Snooze</span>
    </button>

    <Transition name="scale-in">
      <div v-if="open" class="absolute right-0 top-full mt-1 z-30 bg-white dark:bg-dark-100 rounded-xl border border-surface-200 dark:border-dark-50 shadow-modal py-1 w-44">
        <div class="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Tạm hoãn nhắc
        </div>
        <button
          v-for="option in snoozeOptions"
          :key="option.minutes"
          @click="snooze(option.minutes)"
          class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-surface-50 dark:hover:bg-dark-50 transition-colors"
          :disabled="loading"
        >
          <ClockIcon class="w-3.5 h-3.5 text-gray-400" />
          {{ option.label }}
        </button>
        <div v-if="snoozedUntil" class="px-3 py-2 text-xs text-orange-500 border-t border-surface-100 dark:border-dark-50">
          Đang hoãn đến {{ formatTime(snoozedUntil) }}
          <button @click="cancelSnooze" class="ml-1 underline hover:no-underline">Hủy</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { BellSlashIcon, ClockIcon } from '@heroicons/vue/24/outline'
import { onClickOutside } from '@vueuse/core'
import { format } from 'date-fns'

const props = defineProps<{ issue: any }>()
const emit = defineEmits(['snoozed'])

const api = useApi()
const toast = useToast()
const open = ref(false)
const loading = ref(false)
const snoozedUntil = ref<string | null>(null)
const menuRef = ref(null)

onClickOutside(menuRef, () => open.value = false)

const snoozeOptions = [
  { minutes: 15, label: '15 phút' },
  { minutes: 30, label: '30 phút' },
  { minutes: 60, label: '1 giờ' },
  { minutes: 120, label: '2 giờ' },
  { minutes: 240, label: '4 giờ' },
]

async function snooze(minutes: number) {
  loading.value = true
  try {
    const result = await api.post('/api/deadlines/snooze/', {
      issue_id: props.issue.id,
      minutes,
    })
    snoozedUntil.value = result.snoozed_until
    toast.success(result.message)
    emit('snoozed', { issueId: props.issue.id, until: result.snoozed_until })
    open.value = false
  } catch {
    toast.error('Không thể hoãn nhắc nhở')
  } finally {
    loading.value = false
  }
}

async function cancelSnooze() {
  // Snooze with 0 minutes = immediate re-enable (backend handles)
  snoozedUntil.value = null
}

function formatTime(dt: string) {
  return format(new Date(dt), 'HH:mm dd/MM')
}
</script>

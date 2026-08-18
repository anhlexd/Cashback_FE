<template>
  <div class="card p-6 space-y-6">
    <h3 class="font-semibold text-gray-900 dark:text-white">Giao diện</h3>

    <!-- Theme -->
    <div>
      <label class="label mb-3">Chế độ hiển thị</label>
      <div class="grid grid-cols-3 gap-3">
        <button
          v-for="t in themes" :key="t.key"
          @click="setTheme(t.key)"
          class="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all"
          :class="currentTheme === t.key
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/20'
            : 'border-surface-200 dark:border-dark-50 hover:border-gray-300'"
        >
          <!-- Theme preview -->
          <div class="w-full h-12 rounded-lg overflow-hidden border border-surface-200 dark:border-dark-50">
            <div class="h-3 flex gap-1 p-0.5" :class="t.headerBg">
              <div class="w-5 rounded" :class="t.dot1"></div>
              <div class="flex-1 rounded" :class="t.dot2"></div>
            </div>
            <div class="flex h-9">
              <div class="w-6 h-full" :class="t.sidebarBg"></div>
              <div class="flex-1 p-1 space-y-0.5" :class="t.contentBg">
                <div class="h-1.5 rounded w-3/4" :class="t.line1"></div>
                <div class="h-1.5 rounded w-1/2" :class="t.line2"></div>
              </div>
            </div>
          </div>
          <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ t.label }}</span>
          <CheckCircleIcon v-if="currentTheme === t.key" class="w-4 h-4 text-brand-500 -mt-1" />
        </button>
      </div>
    </div>

    <!-- Compact mode -->
    <div class="flex items-center justify-between py-3 border-t border-surface-200 dark:border-dark-50">
      <div>
        <div class="text-sm font-medium text-gray-900 dark:text-white">Chế độ compact</div>
        <div class="text-xs text-gray-400 mt-0.5">Giảm khoảng cách giữa các phần tử</div>
      </div>
      <button
        @click="compact = !compact"
        class="relative w-10 h-6 rounded-full transition-colors"
        :class="compact ? 'bg-brand-600' : 'bg-gray-200 dark:bg-dark-50'"
      >
        <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
              :class="compact ? 'translate-x-4' : 'translate-x-0'"></span>
      </button>
    </div>

    <!-- Language -->
    <div class="py-3 border-t border-surface-200 dark:border-dark-50">
      <label class="label mb-2">Ngôn ngữ</label>
      <select v-model="language" class="input max-w-xs">
        <option value="vi">🇻🇳 Tiếng Việt</option>
        <option value="en">🇺🇸 English</option>
      </select>
    </div>

    <div class="pt-2 border-t border-surface-200 dark:border-dark-50 flex justify-end">
      <button @click="save" class="btn-primary">Lưu cài đặt</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircleIcon } from '@heroicons/vue/24/outline'
import { useDark } from '@vueuse/core'

definePageMeta({ middleware: 'auth' })

const isDark = useDark()
const compact = ref(false)
const language = ref('vi')

const currentTheme = ref(isDark.value ? 'dark' : 'light')

const themes = [
  {
    key: 'light', label: 'Sáng',
    headerBg: 'bg-white', sidebarBg: 'bg-gray-100', contentBg: 'bg-gray-50',
    dot1: 'bg-brand-400', dot2: 'bg-gray-200', line1: 'bg-gray-300', line2: 'bg-gray-200'
  },
  {
    key: 'dark', label: 'Tối',
    headerBg: 'bg-gray-900', sidebarBg: 'bg-gray-800', contentBg: 'bg-gray-700',
    dot1: 'bg-brand-500', dot2: 'bg-gray-600', line1: 'bg-gray-500', line2: 'bg-gray-600'
  },
  {
    key: 'system', label: 'Hệ thống',
    headerBg: 'bg-gradient-to-r from-white to-gray-900',
    sidebarBg: 'bg-gradient-to-b from-gray-100 to-gray-800',
    contentBg: 'bg-gradient-to-r from-gray-50 to-gray-700',
    dot1: 'bg-brand-400', dot2: 'bg-gray-400', line1: 'bg-gray-300', line2: 'bg-gray-500'
  },
]

function setTheme(key: string) {
  currentTheme.value = key
  if (key === 'dark') isDark.value = true
  else if (key === 'light') isDark.value = false
  // 'system' follows OS preference
}

const toast = useToast()
function save() {
  if (process.client) {
    localStorage.setItem('devflow_compact', String(compact.value))
    localStorage.setItem('devflow_language', language.value)
  }
  toast.success('Đã lưu cài đặt giao diện')
}

onMounted(() => {
  if (process.client) {
    compact.value = localStorage.getItem('devflow_compact') === 'true'
    language.value = localStorage.getItem('devflow_language') || 'vi'
  }
})
</script>

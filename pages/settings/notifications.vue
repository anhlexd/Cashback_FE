<template>
  <div class="card p-6 space-y-5">
    <h3 class="font-semibold text-gray-900 dark:text-white">Cài đặt thông báo</h3>

    <div class="space-y-1">
      <div v-for="item in notifSettings" :key="item.key"
           class="flex items-center justify-between py-3 border-b border-surface-100 dark:border-dark-50 last:border-0">
        <div class="flex-1">
          <div class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ item.label }}</div>
          <div class="text-xs text-gray-400 mt-0.5">{{ item.desc }}</div>
        </div>
        <div class="flex items-center gap-3 ml-4">
          <!-- In-app -->
          <label class="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
            <input type="checkbox" v-model="settings[item.key + '_inapp']"
                   class="rounded text-brand-600 border-gray-300 focus:ring-brand-500" />
            Trong app
          </label>
          <!-- Browser -->
          <label class="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
            <input type="checkbox" v-model="settings[item.key + '_browser']"
                   class="rounded text-brand-600 border-gray-300 focus:ring-brand-500" />
            Trình duyệt
          </label>
        </div>
      </div>
    </div>

    <!-- Browser permission -->
    <div class="p-4 bg-surface-50 dark:bg-dark-50 rounded-xl">
      <div class="flex items-start gap-3">
        <BellIcon class="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
        <div class="flex-1">
          <div class="text-sm font-medium text-gray-800 dark:text-gray-200">Quyền thông báo trình duyệt</div>
          <div class="text-xs text-gray-400 mt-0.5">
            {{ permissionStatus === 'granted' ? '✅ Đã cấp quyền' : permissionStatus === 'denied' ? '❌ Đã từ chối' : '⚠️ Chưa cấp quyền' }}
          </div>
        </div>
        <button v-if="permissionStatus !== 'granted' && permissionStatus !== 'denied'"
                @click="requestPermission" class="btn-primary btn-sm">
          Cho phép
        </button>
      </div>
    </div>

    <div class="flex justify-end pt-2">
      <button @click="save" class="btn-primary">Lưu cài đặt</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BellIcon } from '@heroicons/vue/24/outline'

definePageMeta({ middleware: 'auth' })

const toast = useToast()
const permissionStatus = ref('default')

const notifSettings = [
  { key: 'issue_assigned', label: 'Được giao issue', desc: 'Khi có người giao issue cho bạn' },
  { key: 'issue_updated', label: 'Issue được cập nhật', desc: 'Khi issue bạn đang theo dõi có thay đổi' },
  { key: 'issue_commented', label: 'Bình luận mới', desc: 'Khi có người bình luận vào issue của bạn' },
  { key: 'sprint_started', label: 'Sprint bắt đầu', desc: 'Khi sprint mới được khởi động' },
  { key: 'mention', label: 'Được nhắc tới', desc: 'Khi ai đó @mention bạn' },
]

const defaultSettings: Record<string, boolean> = {}
for (const item of notifSettings) {
  defaultSettings[item.key + '_inapp'] = true
  defaultSettings[item.key + '_browser'] = false
}

const settings = reactive({ ...defaultSettings })

async function requestPermission() {
  if (!('Notification' in window)) return
  const result = await Notification.requestPermission()
  permissionStatus.value = result
}

function save() {
  if (process.client) {
    localStorage.setItem('devflow_notif_settings', JSON.stringify(settings))
  }
  toast.success('Đã lưu cài đặt thông báo')
}

onMounted(() => {
  if (process.client) {
    if ('Notification' in window) permissionStatus.value = Notification.permission
    const saved = localStorage.getItem('devflow_notif_settings')
    if (saved) Object.assign(settings, JSON.parse(saved))
  }
})
</script>

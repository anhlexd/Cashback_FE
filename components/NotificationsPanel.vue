<template>
  <div class="absolute top-full right-0 mt-2 w-80 card shadow-modal z-50 overflow-hidden animate-slide-in">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-surface-200 dark:border-dark-50">
      <span class="font-semibold text-sm text-gray-900 dark:text-white">Thông báo</span>
      <button v-if="unreadCount > 0" @click="markAllRead" class="text-xs text-brand-600 dark:text-brand-400 hover:underline">
        Đánh dấu đã đọc
      </button>
    </div>

    <!-- List -->
    <div class="max-h-80 overflow-y-auto divide-y divide-surface-100 dark:divide-dark-50">
      <div v-if="loading" class="p-4 space-y-3">
        <div v-for="i in 3" :key="i" class="flex gap-3">
          <div class="w-8 h-8 rounded-full bg-surface-200 dark:bg-dark-50 animate-pulse flex-shrink-0"></div>
          <div class="flex-1 space-y-1.5">
            <div class="h-3 bg-surface-100 dark:bg-dark-50 rounded animate-pulse w-3/4"></div>
            <div class="h-3 bg-surface-100 dark:bg-dark-50 rounded animate-pulse w-1/2"></div>
          </div>
        </div>
      </div>
      <div v-else-if="notifications.length === 0" class="p-8 text-center text-sm text-gray-400">
        <BellIcon class="w-8 h-8 mx-auto mb-2 text-gray-300" />
        Không có thông báo nào
      </div>
      <div
        v-else
        v-for="notif in notifications"
        :key="notif.id"
        @click="handleClick(notif)"
        class="flex gap-3 px-4 py-3 cursor-pointer hover:bg-surface-50 dark:hover:bg-dark-50 transition-colors"
        :class="!notif.is_read ? 'bg-brand-50/50 dark:bg-brand-950/10' : ''"
      >
        <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
             :class="notifIconBg(notif.notification_type)">
          <component :is="notifIcon(notif.notification_type)" class="w-4 h-4" :class="notifIconColor(notif.notification_type)" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-medium text-gray-900 dark:text-white leading-snug">{{ notif.title }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{{ notif.message }}</div>
          <div class="text-xs text-gray-400 mt-1">{{ timeAgo(notif.created_at) }}</div>
        </div>
        <div v-if="!notif.is_read" class="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-2"></div>
      </div>
    </div>

    <!-- Footer -->
    <div class="px-4 py-2 border-t border-surface-200 dark:border-dark-50 bg-surface-50 dark:bg-dark-50/50">
      <NuxtLink to="/notifications" @click="$emit('close')" class="text-xs text-brand-600 dark:text-brand-400 hover:underline">
        Xem tất cả thông báo
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BellIcon, ClipboardDocumentCheckIcon, ChatBubbleLeftIcon, BoltIcon, AtSymbolIcon } from '@heroicons/vue/24/outline'
import { format } from 'date-fns'

const emit = defineEmits(['close'])
const store = useNotificationsStore()
const router = useRouter()

const loading = ref(true)
const notifications = computed(() => store.notifications.slice(0, 15))
const unreadCount = computed(() => store.unreadCount)

async function markAllRead() {
  await store.markAllRead()
}

async function handleClick(notif: any) {
  if (!notif.is_read) store.markRead(notif.id)
  const issueId = notif.data?.issue_id
  if (issueId) router.push(`/issues/${issueId}`)
  emit('close')
}

function notifIcon(type: string) {
  if (type === 'issue_assigned') return ClipboardDocumentCheckIcon
  if (type === 'issue_commented') return ChatBubbleLeftIcon
  if (type === 'mention') return AtSymbolIcon
  return BoltIcon
}
function notifIconBg(type: string) {
  if (type === 'issue_assigned') return 'bg-brand-100 dark:bg-brand-900/30'
  if (type === 'issue_commented') return 'bg-green-100 dark:bg-green-900/30'
  if (type === 'mention') return 'bg-purple-100 dark:bg-purple-900/30'
  return 'bg-orange-100 dark:bg-orange-900/30'
}
function notifIconColor(type: string) {
  if (type === 'issue_assigned') return 'text-brand-600 dark:text-brand-400'
  if (type === 'issue_commented') return 'text-green-600 dark:text-green-400'
  if (type === 'mention') return 'text-purple-600 dark:text-purple-400'
  return 'text-orange-600 dark:text-orange-400'
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const h = Math.floor(mins / 60)
  if (h < 24) return `${h} giờ trước`
  return format(new Date(dateStr), 'dd/MM/yyyy')
}

onMounted(async () => {
  loading.value = true
  try { await store.fetchNotifications() } finally { loading.value = false }
})
</script>

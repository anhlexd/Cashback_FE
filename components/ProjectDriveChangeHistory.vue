<template>
  <div class="card overflow-hidden">
    <div class="px-4 py-3 border-b border-surface-100 dark:border-dark-50 flex flex-wrap items-center justify-between gap-2">
      <div>
        <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Lịch sử thay đổi Drive</h4>
        <p class="text-[11px] text-gray-500 mt-0.5">
          Ai sửa file, lúc nào — cần bật <strong>Theo dõi Drive</strong> và email Google trùng DevFlow.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <input
          v-model="fileSearch"
          type="search"
          class="input py-1 text-xs w-36"
          placeholder="Lọc tên file…"
          @input="onFileSearchInput"
        />
        <select v-model="historyDays" class="input py-1 text-xs w-24" @change="loadHistory">
          <option :value="7">7 ngày</option>
          <option :value="30">30 ngày</option>
          <option :value="90">90 ngày</option>
        </select>
        <button type="button" class="btn-ghost btn-sm text-xs" :disabled="historyLoading" @click="loadHistory">
          <ArrowPathIcon class="w-3.5 h-3.5" :class="historyLoading && 'animate-spin'" />
        </button>
      </div>
    </div>

    <div v-if="historyLoading" class="p-8 text-center text-xs text-gray-400">Đang tải lịch sử…</div>
    <div v-else-if="!historyItems.length" class="p-8 text-center text-xs text-gray-500">
      Chưa có sự kiện nào. Bật theo dõi Drive và chỉnh file trong folder dự án (hoặc upload qua DevFlow).
    </div>
    <div v-else class="overflow-x-auto">
      <table class="w-full text-xs">
        <thead class="bg-surface-50 dark:bg-dark-50 text-gray-500 uppercase tracking-wider">
          <tr>
            <th class="text-left px-3 py-2 font-medium">Thời gian</th>
            <th class="text-left px-3 py-2 font-medium">Sự kiện</th>
            <th class="text-left px-3 py-2 font-medium">File</th>
            <th class="text-left px-3 py-2 font-medium">Người cập nhật</th>
            <th class="text-left px-3 py-2 font-medium">Issue</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-100 dark:divide-dark-50">
          <tr
            v-for="row in displayedItems"
            :key="row.id"
            class="hover:bg-surface-50 dark:hover:bg-dark-50 cursor-pointer"
            @click="openFile(row)"
          >
            <td class="px-3 py-2 whitespace-nowrap text-gray-600 dark:text-gray-400">
              {{ formatDate(row.event_at) }}
            </td>
            <td class="px-3 py-2">
              <span class="badge text-[10px]">{{ row.event_type_display || row.event_type }}</span>
            </td>
            <td class="px-3 py-2 max-w-[200px]">
              <button
                type="button"
                class="truncate block font-medium text-left text-brand-600 dark:text-brand-400 hover:underline max-w-full"
                :title="row.file_name"
                @click.stop="openFile(row)"
              >
                {{ row.file_name || row.drive_file_id }}
              </button>
              <span v-if="row.revision_id" class="text-[10px] text-gray-400 font-mono">rev {{ row.revision_id }}</span>
            </td>
            <td class="px-3 py-2">
              <span v-if="row.actor_name" class="text-gray-800 dark:text-gray-200">{{ row.actor_name }}</span>
              <span v-else-if="row.actor_email" class="text-amber-700 dark:text-amber-400" :title="row.actor_email">
                {{ row.actor_email }} <span class="text-gray-400">(chưa khớp DevFlow)</span>
              </span>
              <span v-else class="text-gray-400">—</span>
            </td>
            <td class="px-3 py-2">
              <span v-if="row.issue_key" class="font-mono text-brand-600 dark:text-brand-400">{{ row.issue_key }}</span>
              <span v-else class="text-gray-400 italic">Chưa gắn</span>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="historyTotal > displayedItems.length || fileSearch" class="px-3 py-2 text-[10px] text-gray-400 border-t border-surface-100 dark:border-dark-50">
        <template v-if="fileSearch">
          {{ displayedItems.length }} / {{ historyItems.length }} sự kiện (đã lọc)
        </template>
        <template v-else>
          Hiển thị {{ displayedItems.length }} / {{ historyTotal }} sự kiện.
        </template>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowPathIcon } from '@heroicons/vue/24/outline'
import { format } from 'date-fns'

const props = defineProps<{ projectId: number }>()

const emit = defineEmits<{
  'open-file': [payload: { driveFileId: string; fileName: string; url?: string }]
}>()

const api = useApi()

const historyDays = ref(30)
const historyLoading = ref(false)
const historyItems = ref<any[]>([])
const historyTotal = ref(0)
const fileSearch = ref('')

const displayedItems = computed(() => {
  const q = fileSearch.value.trim().toLowerCase()
  if (!q) return historyItems.value
  return historyItems.value.filter((row) =>
    (row.file_name || '').toLowerCase().includes(q)
    || (row.drive_file_id || '').toLowerCase().includes(q)
    || (row.actor_name || '').toLowerCase().includes(q)
    || (row.actor_email || '').toLowerCase().includes(q),
  )
})

function onFileSearchInput() {
  /* client-side filter only */
}

function openFile(row: any) {
  if (!row.drive_file_id) return
  emit('open-file', {
    driveFileId: row.drive_file_id,
    fileName: row.file_name || row.drive_file_id,
    url: row.file?.web_view_link || `https://drive.google.com/file/d/${row.drive_file_id}/view`,
  })
}

function formatDate(iso: string) {
  if (!iso) return '—'
  try {
    return format(new Date(iso), 'dd/MM/yyyy HH:mm')
  } catch {
    return '—'
  }
}

async function loadHistory() {
  historyLoading.value = true
  try {
    const res = await api.get<{ items: any[]; count: number }>(
      `/api/projects/${props.projectId}/integrations/drive/history/`,
      { days: historyDays.value },
    )
    historyItems.value = res.items || []
    historyTotal.value = res.count ?? historyItems.value.length
  } catch {
    historyItems.value = []
    historyTotal.value = 0
  } finally {
    historyLoading.value = false
  }
}

watch(() => props.projectId, loadHistory, { immediate: true })

defineExpose({ loadHistory })
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 class="font-semibold text-gray-900 dark:text-white">Tài liệu dự án</h3>
        <p class="text-xs text-gray-500 mt-0.5 max-w-2xl">
          File trên Google Drive (folder chính thức) và thay đổi Figma đã đồng bộ.
          Upload / tạo file mới trực tiếp vào folder Drive của dự án.
        </p>
      </div>
      <button type="button" class="btn-secondary btn-sm text-xs" :disabled="loading" @click="load">
        <ArrowPathIcon class="w-3.5 h-3.5" :class="loading && 'animate-spin'" />
        Làm mới
      </button>
    </div>

    <div
      v-if="!meta.drive_linked && !meta.figma_linked"
      class="card p-4 text-sm text-gray-500 border-dashed"
    >
      <p>Chưa liên kết folder Drive / file Figma (tuỳ chọn). Tài liệu tổng hợp dự án: nút <strong>Tài liệu dự án</strong> trên header.</p>
      <button type="button" class="btn-secondary btn-sm mt-2" @click="emit('open-settings')">Cài đặt tích hợp</button>
    </div>

    <!-- Quy ước đặt tên + theo dõi Drive -->
    <div
      v-if="meta.drive_linked"
      class="card p-4 space-y-3 border-surface-200 dark:border-dark-50 bg-surface-50/80 dark:bg-dark-50/50"
    >
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Theo dõi thay đổi folder Drive</h4>
          <p class="text-[11px] text-gray-500 mt-1 leading-relaxed">
            Đặt tên file <code class="text-[10px] bg-white dark:bg-dark-100 px-1 rounded">[{{ projectKey || 'MÃ' }}-số] Tên file</code>
            để gắn issue. Upload qua DevFlow hoặc sửa trên Google — hệ thống ghi <strong>người cập nhật</strong>
            (email Google trùng tài khoản DevFlow).
          </p>
        </div>
        <div class="flex flex-wrap gap-2 shrink-0">
          <span
            v-if="driveMe.watch_active"
            class="text-[10px] font-medium text-green-700 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded"
          >
            Đang theo dõi
            <span v-if="driveMe.watch_expiration"> · đến {{ formatDate(driveMe.watch_expiration) }}</span>
          </span>
          <button
            v-else-if="driveMe.connected && driveMe.webhook_configured"
            type="button"
            class="btn-primary btn-sm text-xs"
            :disabled="registeringWatch"
            @click="enableDriveWatch"
          >
            {{ registeringWatch ? 'Đang bật…' : 'Bật theo dõi Drive' }}
          </button>
          <button
            v-else-if="driveMe.connected && !driveMe.webhook_configured"
            type="button"
            class="btn-secondary btn-sm text-xs"
            disabled
            title="Admin cần cấu hình DRIVE_WEBHOOK_PUBLIC_URL trên server"
          >
            Chưa cấu hình webhook server
          </button>
        </div>
      </div>
      <p v-if="watchMessage" class="text-xs" :class="watchMessageOk ? 'text-green-600' : 'text-amber-700 dark:text-amber-400'">
        {{ watchMessage }}
      </p>
    </div>

    <!-- Upload / tạo mới Drive -->
    <div v-if="meta.drive_linked" class="card p-4 space-y-3 border-brand-100 dark:border-brand-900/30 bg-brand-50/30 dark:bg-brand-950/10">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Thêm tài liệu vào Drive</h4>
          <a
            v-if="meta.drive_folder_url"
            :href="meta.drive_folder_url"
            target="_blank"
            rel="noopener"
            class="text-xs text-brand-600 hover:underline"
          >Mở folder dự án</a>
          <span v-else class="text-xs text-amber-600">Chưa có URL folder — Admin gắn lại trong Cài đặt</span>
        </div>

        <div v-if="!meta.drive_account_connected" class="text-xs text-amber-800 dark:text-amber-300 flex flex-wrap items-center gap-2">
          <span>Bước 1: Kết nối tài khoản Google của bạn (khác với folder dự án).</span>
          <button type="button" class="btn-primary btn-sm text-xs" :disabled="connectingOAuth" @click="connectGoogle">Kết nối Google</button>
        </div>
        <div v-else-if="!meta.drive_can_write" class="text-xs text-amber-800 dark:text-amber-300 space-y-2">
          <p>
            Tài khoản Google đã kết nối nhưng <strong>chưa có quyền ghi Drive</strong> (scope cũ).
            Bấm <strong>Kết nối lại</strong> và chấp nhận quyền Google Drive trên màn hình Google.
          </p>
          <button type="button" class="btn-primary btn-sm text-xs" :disabled="connectingOAuth" @click="connectGoogle">Kết nối lại Google</button>
        </div>

        <template v-else-if="meta.can_upload_drive">
          <div class="flex flex-wrap gap-2 items-end">
            <div class="flex-1 min-w-[140px]">
              <label class="label text-[10px]">Mã issue (khuyến nghị)</label>
              <input v-model="issueKey" class="input py-1.5 text-sm font-mono uppercase" :placeholder="projectKeyHint" />
            </div>
            <div v-if="uploadNamePreview" class="flex-1 min-w-[200px]">
              <label class="label text-[10px]">Tên trên Drive (xem trước)</label>
              <p class="text-xs font-mono text-brand-700 dark:text-brand-300 bg-white/80 dark:bg-dark-100 rounded px-2 py-1.5 truncate">
                {{ uploadNamePreview }}
              </p>
            </div>
          </div>

          <div
            class="border-2 border-dashed rounded-lg p-6 text-center transition-colors"
            :class="dragOver ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30' : 'border-surface-200 dark:border-dark-50'"
            @dragover.prevent="dragOver = true"
            @dragleave.prevent="dragOver = false"
            @drop.prevent="onDrop"
          >
            <input ref="fileInputRef" type="file" class="hidden" multiple @change="onFileSelect" />
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">Kéo thả file vào đây hoặc</p>
            <button type="button" class="btn-primary btn-sm" :disabled="uploading" @click="fileInputRef?.click()">
              <ArrowUpTrayIcon class="w-4 h-4" />
              {{ uploading ? 'Đang upload…' : 'Chọn file upload' }}
            </button>
            <p class="text-[10px] text-gray-400 mt-2">
              File lưu trong folder dự án. Nên có <strong>[MÃ-ISSUE]</strong> ở đầu tên để gắn task và nhận diện người sửa.
            </p>
          </div>

          <div class="flex flex-wrap gap-2 items-end pt-1">
            <div class="flex-1 min-w-[160px]">
              <label class="label text-[10px]">Tên file Google mới</label>
              <input v-model="newDocName" class="input py-1.5 text-sm" placeholder="VD: BRD Sprint 12" />
            </div>
            <select v-model="newDocKind" class="input py-1.5 text-sm w-36">
              <option value="document">Google Doc</option>
              <option value="spreadsheet">Google Sheet</option>
              <option value="presentation">Google Slides</option>
              <option value="folder">Thư mục con</option>
            </select>
            <button type="button" class="btn-secondary btn-sm" :disabled="creating || !newDocName.trim()" @click="createGoogleFile">
              <PlusIcon class="w-3.5 h-3.5" />
              Tạo mới
            </button>
          </div>

          <p v-if="oauthError" class="text-xs text-red-600">{{ oauthError }}</p>
          <p v-if="uploadError" class="text-xs text-red-600">{{ uploadError }}</p>
          <p v-if="uploadSuccess" class="text-xs text-green-600">{{ uploadSuccess }}</p>
        </template>
        <p v-else class="text-xs text-gray-400">Vai trò Viewer không được upload.</p>
    </div>

    <ProjectDriveChangeHistory
      v-if="meta.drive_linked"
      ref="historyRef"
      :project-id="projectId"
      @open-file="openDrivePreview"
    />

    <DriveFilePreviewModal
      :open="previewOpen"
      :project-id="projectId"
      :drive-file-id="previewFileId"
      :file-name="previewFileName"
      :external-url="previewExternalUrl"
      @close="closeDrivePreview"
    />

    <template v-if="meta.drive_linked || meta.figma_linked">
      <div class="flex flex-wrap gap-2 items-center">
        <input v-model="search" type="search" class="input py-1.5 text-sm w-full sm:w-56" placeholder="Tìm tên, mã issue..." @keyup.enter="load" />
        <select v-model="sourceFilter" class="input py-1.5 text-sm w-32" @change="load">
          <option value="">Tất cả nguồn</option>
          <option value="drive">Google Drive</option>
          <option value="figma">Figma</option>
        </select>
        <select v-model="days" class="input py-1.5 text-sm w-28" @change="load">
          <option :value="7">7 ngày</option>
          <option :value="30">30 ngày</option>
          <option :value="90">90 ngày</option>
          <option :value="180">180 ngày</option>
        </select>
      </div>

      <div v-if="loading" class="card p-10 text-center text-sm text-gray-400">Đang tải…</div>
      <div v-else-if="!filteredItems.length" class="card p-10 text-center text-sm text-gray-400">
        Chưa có tài liệu trong khoảng thời gian đã chọn. Hãy upload file lên folder Drive.
      </div>
      <div v-else class="card overflow-hidden">
        <div class="px-4 py-2 border-b border-surface-100 dark:border-dark-50 text-xs text-gray-400">
          {{ filteredItems.length }} mục
        </div>
        <ul class="divide-y divide-surface-100 dark:divide-dark-50">
          <li
            v-for="doc in filteredItems"
            :key="doc.id"
            class="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-surface-50 dark:hover:bg-dark-50"
          >
            <span class="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0" :class="doc.source === 'drive' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30'">
              {{ doc.source === 'drive' ? '📁' : '🎨' }}
            </span>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-sm truncate">{{ doc.title }}</div>
              <div class="text-xs text-gray-500">
                {{ sourceLabel(doc) }}
                <span v-if="doc.updated_by_name"> · {{ doc.updated_by_name }}</span>
                <span> · {{ formatDate(doc.updated_at) }}</span>
              </div>
            </div>
            <span v-if="doc.issue_key" class="badge text-[10px] font-mono">{{ doc.issue_key }}</span>
            <NuxtLink
              v-if="doc.kind === 'implementor_note' || doc.source === 'implementor_note'"
              :to="`/projects/${projectId}/implementor-note`"
              class="btn-primary btn-sm text-xs"
            >
              Mở trang tài liệu
            </NuxtLink>
            <template v-else-if="doc.source === 'drive' && doc.drive_file_id && doc.view_in_app">
              <button
                type="button"
                class="btn-primary btn-sm text-xs"
                @click="openDrivePreview({ driveFileId: doc.drive_file_id, fileName: doc.title, url: doc.url })"
              >
                Xem trong DevFlow
              </button>
              <a
                v-if="doc.url"
                :href="doc.url"
                target="_blank"
                rel="noopener"
                class="btn-ghost btn-sm text-xs"
                title="Mở trên Google Drive"
              >Drive</a>
            </template>
            <a
              v-else-if="doc.url"
              :href="doc.url"
              target="_blank"
              rel="noopener"
              class="btn-secondary btn-sm text-xs"
            >Mở</a>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ArrowPathIcon, ArrowUpTrayIcon, PlusIcon } from '@heroicons/vue/24/outline'
import { format } from 'date-fns'

const props = defineProps<{ projectId: number; projectKey?: string }>()
const emit = defineEmits<{ 'open-settings': [] }>()

const api = useApi()
const { startOAuth } = useIntegrationOAuth()
const { me: driveMe, registeringWatch, fetchMe: fetchDriveMe, registerWatch } = useDriveAccount()

const loading = ref(true)
const search = ref('')
const sourceFilter = ref('')
const days = ref(90)
const items = ref<any[]>([])
const meta = ref({
  drive_linked: false,
  figma_linked: false,
  drive_folder_url: '',
  figma_file_url: '',
  can_upload_drive: false,
  drive_account_connected: false,
  drive_can_write: false,
})

const fileInputRef = ref<HTMLInputElement>()
const issueKey = ref('')
const newDocName = ref('')
const newDocKind = ref<'document' | 'spreadsheet' | 'presentation' | 'folder'>('document')
const uploading = ref(false)
const creating = ref(false)
const dragOver = ref(false)
const uploadError = ref('')
const uploadSuccess = ref('')
const connectingOAuth = ref(false)
const oauthError = ref('')
const watchMessage = ref('')
const watchMessageOk = ref(false)
const historyRef = ref<{ loadHistory: () => void } | null>(null)

const previewOpen = ref(false)
const previewFileId = ref('')
const previewFileName = ref('')
const previewExternalUrl = ref('')

function openDrivePreview(payload: { driveFileId: string; fileName: string; url?: string }) {
  previewFileId.value = payload.driveFileId
  previewFileName.value = payload.fileName
  previewExternalUrl.value = payload.url || ''
  previewOpen.value = true
}

function closeDrivePreview() {
  previewOpen.value = false
  previewFileId.value = ''
}

const projectKeyHint = computed(() => props.projectKey ? `${props.projectKey}-42` : 'DEV-42')

const uploadNamePreview = computed(() => {
  const key = issueKey.value.trim().toUpperCase()
  const name = newDocName.value.trim()
  if (key && name) return `[${key}] ${name}`
  if (key) return `[${key}] …`
  return ''
})

function buildFileName(base: string) {
  const key = issueKey.value.trim().toUpperCase()
  const n = (base || '').trim()
  if (!n) return n
  if (key && !n.toUpperCase().startsWith(`[${key}]`)) return `[${key}] ${n}`
  return n
}

const filteredItems = computed(() => {
  const q = search.value.trim().toLowerCase()
  const list = items.value
  if (!q) return list
  return list.filter((d) =>
    (d.title || '').toLowerCase().includes(q)
    || (d.issue_key || '').toLowerCase().includes(q),
  )
})

function sourceLabel(doc: any) {
  if (doc.source === 'implementor_note') return 'Ghim · DevFlow'
  if (doc.source === 'figma') return 'Figma'
  if (doc.kind === 'folder') return 'Drive · Folder'
  return 'Google Drive'
}

function formatUploadError(e: any) {
  const detail = e?.data?.detail
  if (typeof detail === 'string' && detail) return detail
  if (e?.data?.code === 'scope_required' || e?.data?.code === 'drive_permission') {
    return `${detail || 'Thiếu quyền Drive.'} Hãy kết nối lại Google.`
  }
  return detail || 'Thao tác thất bại'
}

function formatDate(iso: string) {
  if (!iso) return '—'
  try { return format(new Date(iso), 'dd/MM/yyyy HH:mm') } catch { return '—' }
}

async function enableDriveWatch() {
  watchMessage.value = ''
  try {
    await registerWatch()
    watchMessageOk.value = true
    watchMessage.value = 'Đã bật theo dõi. Thay đổi file trong folder sẽ hiện ở bảng lịch sử bên dưới.'
    historyRef.value?.loadHistory()
  } catch (e: any) {
    watchMessageOk.value = false
    watchMessage.value = e?.data?.error || 'Không bật được theo dõi'
  }
}

async function load() {
  loading.value = true
  uploadError.value = ''
  await fetchDriveMe()
  try {
    const res = await api.get(`/api/projects/${props.projectId}/documents/`, {
      source: sourceFilter.value || undefined,
      days: days.value,
      q: search.value.trim() || undefined,
    })
    items.value = res.items || []
    meta.value = {
      drive_linked: res.drive_linked,
      figma_linked: res.figma_linked,
      drive_folder_url: res.drive_folder_url || '',
      figma_file_url: res.figma_file_url || '',
      can_upload_drive: res.can_upload_drive ?? false,
      drive_account_connected: res.drive_account_connected ?? false,
      drive_can_write: res.drive_can_write ?? false,
    }
  } finally {
    loading.value = false
  }
}

async function uploadFiles(fileList: FileList | File[]) {
  const files = Array.from(fileList)
  if (!files.length) return
  uploading.value = true
  uploadError.value = ''
  uploadSuccess.value = ''
  let ok = 0
  try {
    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      if (issueKey.value.trim()) fd.append('issue_key', issueKey.value.trim().toUpperCase())
      const customName = buildFileName(file.name)
      if (customName && customName !== file.name) fd.append('name', customName)
      await api.post(`/api/projects/${props.projectId}/documents/upload/`, fd)
      ok++
    }
    uploadSuccess.value = `Đã upload ${ok} file vào folder dự án.`
    await load()
    historyRef.value?.loadHistory()
  } catch (e: any) {
    uploadError.value = formatUploadError(e)
  } finally {
    uploading.value = false
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}

function onFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) uploadFiles(input.files)
}

function onDrop(e: DragEvent) {
  dragOver.value = false
  if (e.dataTransfer?.files?.length) uploadFiles(e.dataTransfer.files)
}

async function createGoogleFile() {
  creating.value = true
  uploadError.value = ''
  uploadSuccess.value = ''
  try {
    await api.post(`/api/projects/${props.projectId}/documents/create/`, {
      kind: newDocKind.value,
      name: buildFileName(newDocName.value),
      issue_key: issueKey.value.trim() || undefined,
    })
    uploadSuccess.value = 'Đã tạo file trên Drive.'
    newDocName.value = ''
    await load()
    historyRef.value?.loadHistory()
  } catch (e: any) {
    uploadError.value = formatUploadError(e)
  } finally {
    creating.value = false
  }
}

async function connectGoogle() {
  connectingOAuth.value = true
  oauthError.value = ''
  try {
    sessionStorage.setItem('drive_oauth_return', `/projects/${props.projectId}?tab=documents`)
    await startOAuth('drive')
  } catch (e: any) {
    oauthError.value = e?.data?.error || e?.data?.detail || 'Không thể kết nối Google'
    connectingOAuth.value = false
  }
}

watch(() => props.projectId, load, { immediate: true })
</script>

<template>
  <div class="space-y-3">
    <!-- Upload area -->
    <div
      class="border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer"
      :class="dragging
        ? 'border-brand-400 bg-brand-50 dark:bg-brand-950/20'
        : 'border-surface-300 dark:border-dark-50 hover:border-brand-300 dark:hover:border-brand-700'"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="handleDrop"
      @click="triggerUpload"
    >
      <input ref="fileInput" type="file" multiple class="hidden" @change="handleFileSelect" />
      <CloudArrowUpIcon class="w-6 h-6 mx-auto text-gray-300 mb-1.5" />
      <p class="text-xs text-gray-400">
        Kéo thả file vào đây hoặc <span class="text-brand-600 dark:text-brand-400 font-medium">chọn file</span>
      </p>
      <p class="text-xs text-gray-300 mt-0.5">Tối đa 10MB mỗi file</p>
    </div>

    <!-- Upload progress -->
    <div v-if="uploading" class="space-y-1.5">
      <div v-for="(f, i) in uploadingFiles" :key="i" class="flex items-center gap-2 text-xs">
        <DocumentIcon class="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span class="flex-1 truncate text-gray-600 dark:text-gray-300">{{ f.name }}</span>
        <div class="w-20 h-1.5 bg-surface-200 dark:bg-dark-50 rounded-full overflow-hidden">
          <div class="h-full bg-brand-500 rounded-full transition-all" :style="{ width: f.progress + '%' }"></div>
        </div>
        <span class="text-gray-400 w-8 text-right">{{ f.progress }}%</span>
      </div>
    </div>

    <!-- Attachments list -->
    <div v-if="attachments.length > 0" class="space-y-1.5">
      <div
        v-for="att in attachments"
        :key="att.id"
        class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-50 dark:hover:bg-dark-50 group transition-colors"
      >
        <!-- File icon -->
        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :class="fileIconBg(att.content_type)">
          <component :is="fileIcon(att.content_type)" class="w-4 h-4" :class="fileIconColor(att.content_type)" />
        </div>

        <!-- File info -->
        <div class="flex-1 min-w-0">
          <a
            :href="att.file_url"
            target="_blank"
            class="text-xs font-medium text-gray-800 dark:text-gray-200 hover:text-brand-600 dark:hover:text-brand-400 truncate block transition-colors"
            @click="onFileClick(att, $event)"
          >
            {{ att.filename }}
          </a>
          <div class="text-xs text-gray-400">
            {{ formatSize(att.file_size) }} · {{ timeAgo(att.created_at) }} · {{ att.uploaded_by?.full_name }}
          </div>
        </div>

        <!-- Preview for images — bấm để xem to -->
        <img
          v-if="isImage(att.content_type)"
          :src="att.file_url"
          :alt="att.filename"
          class="w-10 h-10 rounded object-cover flex-shrink-0 border border-surface-200 dark:border-dark-50 cursor-zoom-in hover:opacity-80 transition-opacity"
          title="Bấm để xem to"
          @click="openImg(att)"
        />

        <!-- Actions -->
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <a :href="att.file_url" download class="btn-ghost btn-icon p-1.5" title="Tải xuống">
            <ArrowDownTrayIcon class="w-3.5 h-3.5" />
          </a>
          <button
            v-if="att.uploaded_by?.id === currentUserId"
            @click="deleteAttachment(att.id)"
            class="btn-ghost btn-icon p-1.5 text-red-400 hover:text-red-600"
            title="Xóa"
          >
            <TrashIcon class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="!uploading" class="text-xs text-gray-400 text-center py-2">
      Chưa có file đính kèm
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  CloudArrowUpIcon, DocumentIcon, PhotoIcon,
  ArrowDownTrayIcon, TrashIcon, DocumentTextIcon,
  ArchiveBoxIcon
} from '@heroicons/vue/24/outline'
import { format } from 'date-fns'

const props = defineProps<{ issueId: number }>()
const authStore = useAuthStore()
const api = useApi()
const { openLightbox } = useLightbox()

function openImg(att: any) {
  openLightbox(att.file_url, { alt: att.filename, download: att.file_url })
}
function onFileClick(att: any, e: MouseEvent) {
  // Ảnh → mở popup xem to (không mở tab mới); file khác → để <a> tải/mở như cũ
  if (isImage(att.content_type)) {
    e.preventDefault()
    openImg(att)
  }
}

const attachments = ref<any[]>([])
const uploading = ref(false)
const dragging = ref(false)
const fileInput = ref<HTMLInputElement>()
const uploadingFiles = ref<{ name: string; progress: number }[]>([])

const currentUserId = computed(() => authStore.user?.id)

async function loadAttachments() {
  const data = await api.get('/api/attachments/', { issue: props.issueId })
  attachments.value = data.results || data
}

function triggerUpload() { fileInput.value?.click() }

function handleDrop(e: DragEvent) {
  dragging.value = false
  const files = Array.from(e.dataTransfer?.files || [])
  uploadFiles(files)
}

function handleFileSelect(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files || [])
  uploadFiles(files)
}

async function uploadFiles(files: File[]) {
  if (files.length === 0) return
  uploading.value = true
  uploadingFiles.value = files.map(f => ({ name: f.name, progress: 0 }))

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const formData = new FormData()
    formData.append('file', file)
    formData.append('issue', String(props.issueId))

    // Simulate progress
    const progressInterval = setInterval(() => {
      if (uploadingFiles.value[i].progress < 90)
        uploadingFiles.value[i].progress += 10
    }, 100)

    try {
      const att = await api.post('/api/attachments/', formData)
      clearInterval(progressInterval)
      uploadingFiles.value[i].progress = 100
      attachments.value.unshift(att)
    } catch (e) {
      clearInterval(progressInterval)
      console.error('Upload failed', e)
    }
  }

  setTimeout(() => {
    uploading.value = false
    uploadingFiles.value = []
  }, 500)
}

async function deleteAttachment(id: number) {
  if (!confirm('Xóa file này?')) return
  await api.delete(`/api/attachments/${id}/`)
  attachments.value = attachments.value.filter(a => a.id !== id)
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function isImage(ct: string) { return ct?.startsWith('image/') }

function fileIcon(ct: string) {
  if (ct?.startsWith('image/')) return PhotoIcon
  if (ct?.includes('pdf') || ct?.includes('text')) return DocumentTextIcon
  if (ct?.includes('zip') || ct?.includes('archive')) return ArchiveBoxIcon
  return DocumentIcon
}

function fileIconBg(ct: string) {
  if (ct?.startsWith('image/')) return 'bg-pink-50 dark:bg-pink-900/20'
  if (ct?.includes('pdf')) return 'bg-red-50 dark:bg-red-900/20'
  return 'bg-surface-100 dark:bg-dark-100'
}

function fileIconColor(ct: string) {
  if (ct?.startsWith('image/')) return 'text-pink-500'
  if (ct?.includes('pdf')) return 'text-red-500'
  return 'text-gray-400'
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}p trước`
  const h = Math.floor(mins / 60)
  if (h < 24) return `${h}h trước`
  return format(new Date(dateStr), 'dd/MM/yyyy')
}

onMounted(loadAttachments)
</script>

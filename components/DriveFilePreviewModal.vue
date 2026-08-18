<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[60] flex flex-col bg-black/40 backdrop-blur-sm">
      <div class="flex flex-col h-full max-h-screen m-0 sm:m-4 sm:rounded-2xl bg-white dark:bg-dark-100 shadow-modal overflow-hidden animate-scale-in">
        <header class="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-surface-100 dark:border-dark-50 shrink-0">
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-gray-900 dark:text-white truncate">
              {{ preview?.name || fileName || 'Tài liệu Drive' }}
            </h3>
            <p v-if="previewError" class="text-xs text-red-600 mt-0.5">{{ previewError }}</p>
            <p v-else-if="!preview?.can_preview_in_app" class="text-xs text-amber-600 mt-0.5">
              Không xem trực tiếp được — mở trên Google Drive.
            </p>
          </div>
          <a
            v-if="externalUrl"
            :href="externalUrl"
            target="_blank"
            rel="noopener"
            class="btn-secondary btn-sm text-xs"
          >Mở trên Drive</a>
          <button type="button" class="btn-ghost btn-icon" @click="close">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </header>

        <div class="flex flex-1 min-h-0 flex-col lg:flex-row">
          <div class="flex-1 min-h-0 flex flex-col bg-surface-50 dark:bg-dark-50 relative">
            <div v-if="loadingPreview" class="flex-1 flex items-center justify-center text-sm text-gray-400">
              Đang tải xem trước…
            </div>
            <iframe
              v-else-if="preview?.preview_mode === 'iframe' && preview.embed_url"
              :src="preview.embed_url"
              class="flex-1 w-full min-h-[320px] border-0 bg-white"
              title="Xem trước Google"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
            <img
              v-else-if="blobUrl && preview?.mime_type?.startsWith('image/')"
              :src="blobUrl"
              class="max-w-full max-h-full object-contain mx-auto p-4"
              :alt="preview?.name"
            />
            <iframe
              v-else-if="blobUrl && preview?.mime_type === 'application/pdf'"
              :src="blobUrl"
              class="flex-1 w-full min-h-[320px] border-0"
              title="PDF"
            />
            <div
              v-else-if="!loadingPreview"
              class="flex-1 flex flex-col items-center justify-center p-8 text-center text-sm text-gray-500"
            >
              <p>Không hiển thị được trong DevFlow.</p>
              <a v-if="externalUrl" :href="externalUrl" target="_blank" rel="noopener" class="btn-primary btn-sm mt-3">
                Mở trên Google Drive
              </a>
            </div>
          </div>

          <aside class="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-surface-100 dark:border-dark-50 flex flex-col min-h-[200px] lg:min-h-0 max-h-[40vh] lg:max-h-none">
            <div class="px-3 py-2 border-b border-surface-100 dark:border-dark-50">
              <h4 class="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Lịch sử chỉnh sửa
              </h4>
            </div>
            <div v-if="loadingHistory" class="flex-1 p-6 text-center text-xs text-gray-400">Đang tải…</div>
            <div v-else class="flex-1 overflow-y-auto text-xs">
              <section v-if="googleRevisions.length" class="p-3 border-b border-surface-100 dark:border-dark-50">
                <p class="text-[10px] font-semibold text-gray-500 uppercase mb-2">Phiên bản Google Drive</p>
                <ul class="space-y-2">
                  <li
                    v-for="(rev, idx) in googleRevisions"
                    :key="rev.revision_id || idx"
                    class="rounded-lg bg-surface-50 dark:bg-dark-50 px-2 py-1.5"
                  >
                    <div class="text-gray-800 dark:text-gray-200 font-medium">
                      {{ rev.modified_by_name || rev.modified_by_email || 'Không rõ' }}
                    </div>
                    <div class="text-gray-500">{{ formatDate(rev.modified_time) }}</div>
                    <div v-if="rev.revision_id" class="text-[10px] text-gray-400 font-mono truncate">
                      rev {{ rev.revision_id }}
                    </div>
                  </li>
                </ul>
              </section>
              <section class="p-3">
                <p class="text-[10px] font-semibold text-gray-500 uppercase mb-2">Sự kiện DevFlow</p>
                <ul v-if="devflowEvents.length" class="space-y-2">
                  <li
                    v-for="ev in devflowEvents"
                    :key="ev.id"
                    class="rounded-lg bg-surface-50 dark:bg-dark-50 px-2 py-1.5"
                  >
                    <span class="badge text-[10px]">{{ ev.event_type_display || ev.event_type }}</span>
                    <div class="text-gray-500 mt-0.5">{{ formatDate(ev.event_at) }}</div>
                    <div class="text-gray-800 dark:text-gray-200">
                      {{ ev.actor_name || ev.actor_email || '—' }}
                    </div>
                    <div v-if="ev.issue_key" class="font-mono text-brand-600 text-[10px]">{{ ev.issue_key }}</div>
                  </li>
                </ul>
                <p v-else class="text-gray-400 italic">Chưa có sự kiện đồng bộ cho file này.</p>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { format } from 'date-fns'

const props = defineProps<{
  projectId: number
  open: boolean
  driveFileId: string
  fileName?: string
  externalUrl?: string
}>()

const emit = defineEmits<{ close: [] }>()

const api = useApi()
const config = useRuntimeConfig()
const authStore = useAuthStore()

const loadingPreview = ref(false)
const loadingHistory = ref(false)
const previewError = ref('')
const preview = ref<any>(null)
const blobUrl = ref('')
const googleRevisions = ref<any[]>([])
const devflowEvents = ref<any[]>([])

function formatDate(iso: string) {
  if (!iso) return '—'
  try {
    return format(new Date(iso), 'dd/MM/yyyy HH:mm')
  } catch {
    return '—'
  }
}

function revokeBlob() {
  if (blobUrl.value) {
    URL.revokeObjectURL(blobUrl.value)
    blobUrl.value = ''
  }
}

async function fetchPreviewContent(fileId: string) {
  const url = `${config.public.apiBase}/api/projects/${props.projectId}/documents/${fileId}/preview/content/`
  const headers: Record<string, string> = {}
  if (authStore.accessToken) {
    headers.Authorization = `Bearer ${authStore.accessToken}`
  }
  let response = await fetch(url, { headers })
  if (response.status === 401 && authStore.refreshToken) {
    const refreshed = await authStore.refreshAccessToken()
    if (refreshed) {
      headers.Authorization = `Bearer ${authStore.accessToken}`
      response = await fetch(url, { headers })
    }
  }
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Không tải được nội dung' }))
    throw { data: err }
  }
  const blob = await response.blob()
  revokeBlob()
  blobUrl.value = URL.createObjectURL(blob)
}

async function loadAll() {
  const fileId = props.driveFileId
  if (!fileId || !props.open) return

  previewError.value = ''
  loadingPreview.value = true
  loadingHistory.value = true
  preview.value = null
  revokeBlob()

  try {
    const [meta, history] = await Promise.all([
      api.get(`/api/projects/${props.projectId}/documents/${fileId}/preview/`),
      api.get(`/api/projects/${props.projectId}/documents/${fileId}/edit-history/`, { days: 90 }),
    ])
    preview.value = meta
    googleRevisions.value = history.google_revisions || []
    devflowEvents.value = history.devflow_events || []

    if (meta.preview_mode === 'proxy' && meta.content_url) {
      await fetchPreviewContent(fileId)
    }
  } catch (e: any) {
    previewError.value = e?.data?.detail || 'Không mở được file'
  } finally {
    loadingPreview.value = false
    loadingHistory.value = false
  }
}

function close() {
  emit('close')
}

watch(
  () => [props.open, props.driveFileId] as const,
  ([isOpen, id]) => {
    if (isOpen && id) loadAll()
    if (!isOpen) {
      revokeBlob()
      preview.value = null
    }
  },
  { immediate: true },
)

onBeforeUnmount(revokeBlob)
</script>

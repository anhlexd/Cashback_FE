<template>
  <div class="card p-6 space-y-6">
    <div>
      <h3 class="font-semibold text-gray-900 dark:text-white">Tích hợp dự án</h3>
      <p class="text-xs text-gray-500 mt-1">
        Bước 1: Kết nối tài khoản Google/Figma của bạn.
        Bước 2: Admin/Manager gắn folder Drive & file Figma cho dự án.
      </p>
    </div>

    <p v-if="loadError" class="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">{{ loadError }}</p>
    <p v-if="oauthError" class="text-sm text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-2">{{ oauthError }}</p>

    <!-- Bước 1: OAuth cá nhân — luôn hiện với mọi thành viên dự án -->
    <div class="rounded-lg border border-surface-200 dark:border-dark-50 p-4 space-y-3 bg-surface-50/50 dark:bg-dark-50/30">
      <h4 class="text-sm font-semibold text-gray-900 dark:text-white">1. Tài khoản của bạn</h4>
      <div class="grid sm:grid-cols-2 gap-3">
        <div class="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-white dark:bg-dark-100 border border-surface-100 dark:border-dark-50">
          <span class="text-lg">📁</span>
          <div class="flex-1 min-w-0">
            <div class="text-xs font-medium">Google Drive</div>
            <div v-if="driveAccount?.connected" class="text-[10px] truncate" :class="driveAccount.can_write ? 'text-green-600' : 'text-amber-600'">
              ✓ {{ driveAccount.google_email || driveAccount.display_name }}
              <span v-if="!driveAccount.can_write"> — cần kết nối lại (quyền ghi)</span>
              <span v-else-if="driveAccount.watch_active" class="text-green-600"> · đang theo dõi Drive</span>
            </div>
            <div v-else class="text-[10px] text-gray-400">Chưa kết nối</div>
          </div>
          <button
            type="button"
            class="btn-secondary btn-sm text-xs shrink-0"
            :disabled="connectingDrive"
            @click="connectDrive"
          >
            {{ driveAccount?.connected ? 'Kết nối lại' : 'Kết nối' }}
          </button>
          <button
            v-if="driveAccount?.connected && !driveAccount?.watch_active && driveAccount?.webhook_configured"
            type="button"
            class="btn-primary btn-sm text-xs shrink-0"
            :disabled="registeringWatch"
            @click="enableWatch"
          >
            {{ registeringWatch ? '…' : 'Theo dõi' }}
          </button>
        </div>
        <div class="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-white dark:bg-dark-100 border border-surface-100 dark:border-dark-50">
          <span class="text-lg">🎨</span>
          <div class="flex-1 min-w-0">
            <div class="text-xs font-medium">Figma</div>
            <div v-if="figmaAccount?.connected" class="text-[10px] text-green-600 truncate">
              ✓ {{ figmaAccount.figma_handle || figmaAccount.figma_email }}
            </div>
            <div v-else class="text-[10px] text-gray-400">Chưa kết nối</div>
          </div>
          <button
            type="button"
            class="btn-secondary btn-sm text-xs shrink-0"
            :disabled="connectingFigma"
            @click="connectFigma"
          >
            {{ figmaAccount?.connected ? 'Kết nối lại' : 'Kết nối' }}
          </button>
        </div>
      </div>
      <p class="text-[10px] text-gray-400">
        Nếu bấm không chuyển trang: kiểm tra BE đã cấu hình <code class="text-xs">GOOGLE_CLIENT_ID</code> / <code class="text-xs">FIGMA_CLIENT_ID</code> trong file env.
      </p>
    </div>

    <!-- Google Drive project folder -->
    <div class="space-y-4 pb-6 border-b border-surface-100 dark:border-dark-50">
      <h4 class="text-sm font-semibold text-gray-900 dark:text-white">2. Folder Google Drive (dự án)</h4>
      <p class="text-xs text-gray-500">{{ data?.drive?.policy }}</p>

      <div v-if="data?.drive?.linked" class="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40">
        <div class="font-medium text-sm">{{ data.drive.folder_name }}</div>
        <a :href="data.drive.folder_url" target="_blank" rel="noopener" class="text-xs text-brand-600 hover:underline break-all">{{ data.drive.folder_url }}</a>
        <div class="flex gap-2 mt-2">
          <a :href="data.drive.folder_url" target="_blank" rel="noopener" class="btn-primary btn-sm text-xs">Mở folder</a>
          <button
            v-if="data?.can_link_drive"
            type="button"
            class="btn-ghost btn-sm text-xs text-red-600"
            :disabled="savingDrive"
            @click="unlinkDrive"
          >
            {{ savingDrive ? 'Đang gỡ…' : 'Gỡ liên kết' }}
          </button>
        </div>
      </div>

      <form v-else-if="data?.can_link_drive" class="space-y-3 max-w-lg" @submit.prevent="linkDrive">
        <input v-model="driveForm.folder" class="input text-sm" placeholder="URL hoặc ID folder Drive" required />
        <input v-model="driveForm.name" class="input text-sm" placeholder="Tên hiển thị (tuỳ chọn)" />
        <button type="submit" class="btn-primary btn-sm" :disabled="savingDrive">Liên kết folder dự án</button>
      </form>
      <p v-else-if="data" class="text-xs text-gray-400">Chỉ Admin hệ thống hoặc Owner/Manager dự án được gắn folder.</p>
    </div>

    <!-- Figma project file -->
    <div class="space-y-4">
      <h4 class="text-sm font-semibold text-gray-900 dark:text-white">3. File Figma (dự án)</h4>
      <p class="text-xs text-gray-500">{{ data?.figma?.policy }}</p>

      <div v-if="data?.figma?.linked" class="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40">
        <div class="font-medium text-sm">{{ data.figma.file_name }}</div>
        <a :href="data.figma.file_url" target="_blank" rel="noopener" class="text-xs text-brand-600 hover:underline">Mở file Figma</a>
        <button
          v-if="data?.can_link_figma"
          type="button"
          class="btn-ghost btn-sm text-xs text-red-600 mt-2"
          :disabled="savingFigma"
          @click="unlinkFigma"
        >
          {{ savingFigma ? 'Đang gỡ…' : 'Gỡ liên kết' }}
        </button>
      </div>

      <form v-else-if="data?.can_link_figma" class="space-y-3 max-w-lg" @submit.prevent="linkFigma">
        <input v-model="figmaForm.file" class="input text-sm" placeholder="URL file Figma" required />
        <input v-model="figmaForm.name" class="input text-sm" placeholder="Tên file (tuỳ chọn)" />
        <input v-model="figmaForm.team_id" class="input text-sm font-mono" placeholder="Team ID (tuỳ chọn)" />
        <button type="submit" class="btn-primary btn-sm" :disabled="savingFigma">Liên kết file Figma</button>
      </form>
      <p v-else-if="data" class="text-xs text-gray-400">Chỉ Admin hoặc Owner/Manager được gắn file Figma.</p>
    </div>

    <button type="button" class="text-xs text-brand-600 hover:underline" @click="emit('open-documents')">
      → Xem tab Tài liệu dự án
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ projectId: number }>()
const emit = defineEmits<{ 'open-documents': [] }>()

const api = useApi()
const authStore = useAuthStore()
const { startOAuth } = useIntegrationOAuth()
const { registerWatch, registeringWatch } = useDriveAccount()

const data = ref<any>(null)
const driveAccount = ref<any>({ connected: false })
const figmaAccount = ref<any>({ connected: false })
const loadError = ref('')
const oauthError = ref('')
const driveForm = reactive({ folder: '', name: '' })
const figmaForm = reactive({ file: '', name: '', team_id: '' })
const savingDrive = ref(false)
const savingFigma = ref(false)
const connectingDrive = ref(false)
const connectingFigma = ref(false)

function oauthErrMessage(e: any, provider: string) {
  const msg = e?.data?.error || e?.data?.detail || e?.message
  if (msg) return String(msg)
  return `Không thể kết nối ${provider}. Kiểm tra cấu hình OAuth trên server.`
}

async function load() {
  loadError.value = ''
  try {
    const [integ, drive, figma] = await Promise.all([
      api.get(`/api/projects/${props.projectId}/integrations/`),
      api.get('/api/drive/account/me/'),
      api.get('/api/figma/account/me/'),
    ])
    data.value = integ
    driveAccount.value = drive?.connected ? { connected: true, ...drive } : { connected: false }
    figmaAccount.value = figma?.connected ? { connected: true, ...figma } : { connected: false }
  } catch (e: any) {
    loadError.value = e?.data?.detail || e?.data?.error || 'Không tải được cấu hình tích hợp'
    if (!data.value && authStore.user?.role === 'admin') {
      data.value = {
        can_link_drive: true,
        can_link_figma: true,
        drive: { linked: false, policy: '' },
        figma: { linked: false, policy: '' },
      }
    }
  }
}

async function enableWatch() {
  try {
    await registerWatch()
    await load()
  } catch {
    /* toast in composable */
  }
}

async function connectDrive() {
  oauthError.value = ''
  connectingDrive.value = true
  try {
    sessionStorage.setItem('drive_oauth_return', window.location.pathname + window.location.search)
    await startOAuth('drive')
  } catch (e: any) {
    oauthError.value = oauthErrMessage(e, 'Google Drive')
    connectingDrive.value = false
  }
}

async function connectFigma() {
  oauthError.value = ''
  connectingFigma.value = true
  try {
    sessionStorage.setItem('figma_oauth_return', window.location.pathname + window.location.search)
    await startOAuth('figma')
  } catch (e: any) {
    oauthError.value = oauthErrMessage(e, 'Figma')
    connectingFigma.value = false
  }
}

async function linkDrive() {
  savingDrive.value = true
  try {
    data.value = await api.post(`/api/projects/${props.projectId}/integrations/drive/`, {
      folder_url: driveForm.folder,
      folder_name: driveForm.name || undefined,
    })
    driveForm.folder = ''
    driveForm.name = ''
  } catch (e: any) {
    alert(e?.data?.detail || e?.data?.error || 'Lỗi liên kết Drive')
  } finally {
    savingDrive.value = false
  }
}

async function unlinkDrive() {
  if (!confirm('Gỡ folder Drive khỏi dự án? (Không xóa folder trên Google.)')) return
  savingDrive.value = true
  oauthError.value = ''
  try {
    data.value = await api.post(`/api/projects/${props.projectId}/integrations/drive/unlink/`, {})
  } catch (e: any) {
    alert(e?.data?.detail || e?.data?.error || 'Gỡ liên kết Drive thất bại')
  } finally {
    savingDrive.value = false
    await load()
  }
}

async function linkFigma() {
  savingFigma.value = true
  try {
    data.value = await api.post(`/api/projects/${props.projectId}/integrations/figma/`, {
      file_url: figmaForm.file,
      file_name: figmaForm.name || undefined,
      team_id: figmaForm.team_id || undefined,
    })
    figmaForm.file = ''
    figmaForm.name = ''
  } catch (e: any) {
    alert(e?.data?.detail || e?.data?.error || 'Lỗi liên kết Figma')
  } finally {
    savingFigma.value = false
  }
}

async function unlinkFigma() {
  if (!confirm('Gỡ file Figma khỏi dự án?')) return
  savingFigma.value = true
  oauthError.value = ''
  try {
    data.value = await api.post(`/api/projects/${props.projectId}/integrations/figma/unlink/`, {})
  } catch (e: any) {
    alert(e?.data?.detail || e?.data?.error || 'Gỡ liên kết Figma thất bại')
  } finally {
    savingFigma.value = false
    await load()
  }
}

watch(() => props.projectId, load, { immediate: true })
</script>

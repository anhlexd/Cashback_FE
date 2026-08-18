<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex justify-end" @keydown.esc="$emit('close')">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" @click="$emit('close')"></div>

      <!-- Side panel -->
      <div
        class="relative w-full max-w-[720px] h-full bg-white dark:bg-dark-100 shadow-2xl flex flex-col animate-slide-in-right"
        @dragenter.prevent="dragCounter++"
        @dragleave.prevent="dragCounter = Math.max(0, dragCounter - 1)"
        @dragover.prevent
        @drop.prevent="handlePanelDrop"
      >
        <!-- Drag overlay -->
        <div
          v-if="dragCounter > 0"
          class="absolute inset-0 z-10 bg-brand-50/90 dark:bg-brand-950/80 border-4 border-dashed border-brand-400 flex flex-col items-center justify-center pointer-events-none"
        >
          <CloudArrowUpIcon class="w-16 h-16 text-brand-500 mb-3" />
          <p class="text-lg font-bold text-brand-700 dark:text-brand-300">Thả ảnh vào đây</p>
          <p class="text-sm text-brand-600 dark:text-brand-400 mt-1">Hỗ trợ JPG, PNG, GIF, WEBP — tối đa 10MB</p>
        </div>

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-dark-50 flex-shrink-0">
          <div class="flex items-center gap-2">
            <PlusCircleIcon class="w-5 h-5 text-brand-500" />
            <h3 class="font-bold text-lg text-gray-900 dark:text-white">Tạo Issue mới</h3>
          </div>
          <button @click="$emit('close')" class="btn-ghost btn-icon">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto">
          <div class="p-6 space-y-5">
            <!-- Type -->
            <div>
              <label class="label">Loại</label>
              <div class="flex gap-2">
                <button
                  v-for="t in types" :key="t.value" type="button"
                  @click="form.issue_type = t.value"
                  class="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all"
                  :class="form.issue_type === t.value
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300'
                    : 'border-surface-200 dark:border-dark-50 text-gray-500 hover:border-gray-300'"
                >
                  <IssueTypeIcon :type="t.value" class="w-3.5 h-3.5" />
                  {{ t.label }}
                </button>
              </div>
            </div>

            <!-- Title -->
            <div>
              <label class="label">Tiêu đề <span class="text-red-500">*</span></label>
              <input v-model="form.title" class="input" placeholder="Tiêu đề ngắn gọn, rõ ràng..." required autofocus />
            </div>
            
            <!-- estimated_minutes -->
            <!-- <div>
              <label class="text-xs text-gray-500 mb-1 block">Thời gian hoàn thành</label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="form.estimated_minutes"
                  type="number" min="1" max="120"
                  class="input text-sm w-24"
                  placeholder="Phút"
                />
                <span class="text-xs text-gray-400">
                  phút {{ form.estimated_minutes ? `(${formatEstimated(form.estimated_minutes)})` : '' }}
                </span>
              </div>
            </div> -->

            <!-- Description (rich text) -->
            <div>
              <label class="label">Mô tả</label>
              <RichTextEditor
                v-model="form.description"
                placeholder="Chi tiết về issue... (có thể kéo thả hoặc dán ảnh vào đây)"
                min-height="220px"
                @paste-images="handleDescriptionPasteImages"
              />
            </div>

            <!-- Image attachments -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="label !mb-0">Ảnh đính kèm</label>
                <button type="button" @click="imageInput?.click()" class="btn-ghost btn-sm text-brand-600 dark:text-brand-400">
                  <PaperClipIcon class="w-3.5 h-3.5" />
                  Chọn ảnh
                </button>
                <input ref="imageInput" type="file" multiple accept="image/*" class="hidden" @change="handleImageSelect" />
              </div>

              <!-- Dropzone -->
              <div
                v-if="pendingImages.length === 0"
                @click="imageInput?.click()"
                @dragover.prevent="zoneDragging = true"
                @dragleave.prevent="zoneDragging = false"
                @drop.prevent="handleZoneDrop"
                class="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors"
                :class="zoneDragging
                  ? 'border-brand-400 bg-brand-50 dark:bg-brand-950/20'
                  : 'border-surface-300 dark:border-dark-50 hover:border-brand-300'"
              >
                <PhotoIcon class="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Kéo thả ảnh vào panel, hoặc <span class="text-brand-600 dark:text-brand-400 font-medium">click để chọn</span>
                </p>
                <p class="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WEBP — tối đa 10MB</p>
              </div>

              <!-- Thumbnails -->
              <div v-else class="grid grid-cols-3 gap-2">
                <div
                  v-for="(img, i) in pendingImages"
                  :key="img.id"
                  class="relative group aspect-square rounded-lg overflow-hidden border border-surface-200 dark:border-dark-50 bg-surface-50 dark:bg-dark-50"
                >
                  <img :src="img.preview" :alt="img.file.name" class="w-full h-full object-cover" />
                  <!-- Upload progress overlay -->
                  <div v-if="img.uploading" class="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div class="text-white text-xs font-medium">{{ img.progress }}%</div>
                  </div>
                  <!-- Status badge -->
                  <div v-if="img.status === 'success'" class="absolute top-1 right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckIcon class="w-3 h-3 text-white" />
                  </div>
                  <div v-else-if="img.status === 'error'" class="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center" :title="img.error">
                    <ExclamationTriangleIcon class="w-3 h-3 text-white" />
                  </div>
                  <!-- Remove -->
                  <button
                    type="button"
                    v-if="!img.uploading"
                    @click="removePendingImage(i)"
                    class="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Xóa"
                  >
                    <XMarkIcon class="w-3 h-3" />
                  </button>
                  <!-- File name -->
                  <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                    <p class="text-[10px] text-white truncate">{{ img.file.name }}</p>
                  </div>
                </div>
                <!-- Add more -->
                <button
                  type="button"
                  @click="imageInput?.click()"
                  class="aspect-square rounded-lg border-2 border-dashed border-surface-300 dark:border-dark-50 hover:border-brand-400 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-brand-500 transition-colors"
                >
                  <PlusIcon class="w-5 h-5" />
                  <span class="text-xs">Thêm</span>
                </button>
              </div>
            </div>

            <!-- Gắn cha: Story→Epic; Task→Epic/Story; Bug→Story/Task -->
            <div v-if="form.issue_type !== 'epic'">
              <label class="label">{{ parentLabel }}</label>
              <select v-model="form.parent" class="input text-sm">
                <option :value="null">— Không gắn —</option>
                <optgroup v-if="showEpicGroup && epicOptions.length" label="Epic">
                  <option v-for="ep in epicOptions" :key="'e' + ep.id" :value="ep.id">
                    {{ ep.issue_key }} — {{ ep.title }}
                  </option>
                </optgroup>
                <optgroup v-if="showStoryGroup && storyOptions.length" label="Story">
                  <option v-for="st in storyOptions" :key="'s' + st.id" :value="st.id">
                    {{ st.issue_key }} — {{ st.title }}
                  </option>
                </optgroup>
                <optgroup v-if="showTaskGroup && taskOptions.length" label="Task">
                  <option v-for="tk in taskOptions" :key="'t' + tk.id" :value="tk.id">
                    {{ tk.issue_key }} — {{ tk.title }}
                  </option>
                </optgroup>
              </select>
            </div>

            <!-- Meta fields in 2-column grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <!-- Priority -->
              <div>
                <label class="label">Độ ưu tiên</label>
                <select v-model="form.priority" class="input text-sm">
                  <option value="critical">🔴 Critical</option>
                  <option value="high">🟠 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
              </div>

              <!-- Due Date -->
              <div>
                <label class="label">Hạn chót</label>
                <input v-model="form.due_date" type="date" class="input" />
              </div>

              <!-- Estimated minutes -->
              <div>
                <label class="label">Thời gian hoàn thành</label>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="form.estimated_minutes"
                    type="number" min="1" max="120"
                    class="input text-sm w-24"
                    placeholder="Phút"
                  />
                  <span class="text-xs text-gray-400">
                    phút {{ form.estimated_minutes ? `(${formatEstimated(form.estimated_minutes)})` : '' }}
                  </span>
                </div>
              </div>

              <!-- Assignee -->
              <div>
                <label class="label">Người phụ trách</label>
                <UserSelect v-model="form.assignee" :project-id="projectId" />
              </div>

              <!-- Story Points -->
              <div>
                <label class="label">Story Points</label>
                <input v-model.number="form.story_points" type="number" min="0" max="100" class="input" placeholder="0" />
              </div>
            </div>

            <!-- Error -->
            <div v-if="error" class="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {{ error }}
            </div>
          </div>
        </form>

        <!-- Footer actions -->
        <div class="flex items-center justify-between gap-2 px-6 py-4 border-t border-surface-200 dark:border-dark-50 flex-shrink-0 bg-surface-50/50 dark:bg-dark-50/30">
          <div class="text-xs text-gray-400 flex items-center gap-3">
            <span v-if="pendingImages.length">{{ pendingImages.length }} ảnh sẽ đính kèm</span>
            <span class="hidden sm:inline-flex items-center gap-1.5">
              <kbd class="kbd">{{ modKey }}</kbd>
              <span>+</span>
              <kbd class="kbd">Enter</kbd>
              <span>tạo</span>
              <span class="mx-1">·</span>
              <kbd class="kbd">Esc</kbd>
              <span>đóng</span>
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" @click="$emit('close')" class="btn-secondary">Hủy</button>
            <button type="button" @click="handleSubmit" :disabled="loading" class="btn-primary">
              <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ loading ? loadingText : 'Tạo Issue' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  XMarkIcon, PlusCircleIcon, PaperClipIcon, PhotoIcon,
  PlusIcon, CloudArrowUpIcon, CheckIcon, ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  projectId: number
  sprintId?: number
  defaultStatus?: string
  /** Mặc định loại issue khi mở modal (vd. 'epic') */
  defaultIssueType?: string
  // Pre-fill the form (used by the Duplicate flow). Any keys provided here
  // override the defaults below. Status/sprint are still controlled by the
  // sprintId / defaultStatus props.
  prefill?: {
    issue_type?: string
    title?: string
    description?: string
    priority?: string
    story_points?: number | null
    estimated_minutes?: number | null
    assignee?: number | null
    due_date?: string
    parent?: number | null
  } | null
}>()
const emit = defineEmits(['close', 'created'])

const issuesStore = useIssuesStore()
const api = useApi()

function todayDateStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const form = reactive({
  issue_type: props.prefill?.issue_type ?? props.defaultIssueType ?? 'task',
  title: props.prefill?.title ?? '',
  description: props.prefill?.description ?? '',
  priority: props.prefill?.priority ?? 'medium',
  story_points: (props.prefill?.story_points ?? null) as number | null,
  estimated_minutes: (props.prefill?.estimated_minutes ?? null) as number | null,
  assignee: (props.prefill?.assignee ?? null) as number | null,
  due_date: props.prefill?.due_date ?? todayDateStr(),
  parent: (props.prefill?.parent ?? null) as number | null,
})

type ParentOpt = { id: number; issue_key: string; title: string }
const epicOptions = ref<ParentOpt[]>([])
const storyOptions = ref<ParentOpt[]>([])
const taskOptions = ref<ParentOpt[]>([])

// Story → Epic; Task → Epic/Story; Bug/Subtask → Story/Task
const showEpicGroup = computed(() => ['story', 'task'].includes(form.issue_type))
const showStoryGroup = computed(() => ['task', 'bug', 'subtask'].includes(form.issue_type))
const showTaskGroup = computed(() => ['bug', 'subtask'].includes(form.issue_type))
const parentLabel = computed(() => {
  if (form.issue_type === 'story') return 'Thuộc Epic'
  if (form.issue_type === 'task') return 'Thuộc Epic / Story'
  return 'Thuộc Story / Task'
})

// Đổi loại → reset cha (epic không có cha; cha cũ có thể không hợp lệ cho loại mới)
watch(() => form.issue_type, () => {
  form.parent = null
})

function formatEstimated(minutes: number) {
  if (minutes < 60) return `${minutes} phút`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h} giờ ${m} phút` : `${h} giờ`
}

const loading = ref(false)
const loadingText = ref('Đang tạo...')
const error = ref('')

const types = [
  { value: 'epic', label: 'Epic' },
  { value: 'story', label: 'Story' },
  { value: 'task', label: 'Task' },
  { value: 'bug', label: 'Bug' },
]

// ===== Image upload state =====
type PendingImage = {
  id: string
  file: File
  preview: string
  uploading: boolean
  progress: number
  status: 'idle' | 'success' | 'error'
  error?: string
}

const imageInput = ref<HTMLInputElement>()
const pendingImages = ref<PendingImage[]>([])
const dragCounter = ref(0)
const zoneDragging = ref(false)
const MAX_SIZE = 10 * 1024 * 1024

function addImages(files: File[]) {
  const images = files.filter(f => f.type.startsWith('image/'))
  for (const file of images) {
    if (file.size > MAX_SIZE) {
      error.value = `${file.name} vượt quá 10MB`
      continue
    }
    pendingImages.value.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      progress: 0,
      status: 'idle',
    })
  }
}

function handleDescriptionPasteImages(files: File[]) {
  addImages(files)
}

function handleImageSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  target.value = ''
  addImages(files)
}

function handleZoneDrop(e: DragEvent) {
  zoneDragging.value = false
  const files = Array.from(e.dataTransfer?.files || [])
  addImages(files)
}

function handlePanelDrop(e: DragEvent) {
  dragCounter.value = 0
  const files = Array.from(e.dataTransfer?.files || [])
  addImages(files)
}

function removePendingImage(idx: number) {
  const img = pendingImages.value[idx]
  if (img) URL.revokeObjectURL(img.preview)
  pendingImages.value.splice(idx, 1)
}

async function uploadOneImage(img: PendingImage, issueId: number) {
  img.uploading = true
  img.progress = 0
  img.status = 'idle'

  const fd = new FormData()
  fd.append('file', img.file)
  fd.append('issue', String(issueId))

  const timer = setInterval(() => {
    if (img.progress < 90) img.progress += 10
  }, 100)

  try {
    await api.post('/api/attachments/', fd)
    img.progress = 100
    img.status = 'success'
  } catch (e: any) {
    img.status = 'error'
    img.error = e?.data?.detail || 'Upload thất bại'
  } finally {
    clearInterval(timer)
    img.uploading = false
  }
}

async function handleSubmit() {
  if (!form.title.trim()) {
    error.value = 'Vui lòng nhập tiêu đề'
    return
  }
  loading.value = true
  loadingText.value = 'Đang tạo...'
  error.value = ''

  try {
    const payload: any = {
      ...form,
      project: props.projectId,
      status: props.defaultStatus || 'todo',
    }
    if (props.sprintId && form.issue_type !== 'epic') payload.sprint = props.sprintId
    if (form.issue_type === 'epic') {
      delete payload.sprint
      delete payload.parent
    }
    if (!form.parent) delete payload.parent
    else payload.parent = form.parent
    if (!payload.due_date) delete payload.due_date
    if (!payload.story_points) delete payload.story_points
    if (!payload.estimated_minutes) delete payload.estimated_minutes
    if (!payload.assignee) delete payload.assignee
    if (!payload.estimated_minutes) delete payload.estimated_minutes

    const issue: any = await issuesStore.createIssue(payload)

    // Upload images sequentially after issue created
    if (pendingImages.value.length > 0) {
      loadingText.value = `Đang tải ảnh (0/${pendingImages.value.length})...`
      for (let i = 0; i < pendingImages.value.length; i++) {
        loadingText.value = `Đang tải ảnh (${i + 1}/${pendingImages.value.length})...`
        await uploadOneImage(pendingImages.value[i], issue.id)
      }
      const failed = pendingImages.value.filter((p: PendingImage) => p.status === 'error')
      if (failed.length) {
        error.value = `${failed.length} ảnh upload thất bại — issue đã được tạo`
        loading.value = false
        return
      }
    }

    emit('created', issue)
  } catch (err: any) {
    error.value = err?.data?.title?.[0] || err?.data?.detail || 'Tạo issue thất bại'
  } finally {
    loading.value = false
  }
}

// ===== Keyboard shortcuts =====
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent)
const modKey = isMac ? '⌘' : 'Ctrl'

function handleKeydown(e: KeyboardEvent) {
  // Ctrl/Cmd + Enter → submit
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    if (!loading.value) handleSubmit()
    return
  }
  // Esc → close (only when no other handler claimed it via input)
  if (e.key === 'Escape') {
    e.preventDefault()
    emit('close')
  }
}


async function loadParentOptions() {
  try {
    const data = await api.get('/api/issues/', {
      project: props.projectId,
      page_size: 300,
    })
    const list = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : [])
    const pick = (t: string): ParentOpt[] =>
      list
        .filter((e: any) => e.issue_type === t)
        .map((e: any) => ({ id: e.id, issue_key: e.issue_key, title: e.title }))
    epicOptions.value = pick('epic')
    storyOptions.value = pick('story')
    taskOptions.value = pick('task')
  } catch {
    epicOptions.value = []
    storyOptions.value = []
    taskOptions.value = []
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  loadParentOptions()
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  pendingImages.value.forEach((p: PendingImage) => URL.revokeObjectURL(p.preview))
})
</script>

<style scoped>
@keyframes slide-in-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-slide-in-right { animation: slide-in-right 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
.animate-fade-in { animation: fade-in 0.2s ease-out; }
</style>

<template>
  <div class="space-y-4">
    <!-- Comment list -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 2" :key="i" class="flex gap-3">
        <div class="w-7 h-7 rounded-full bg-surface-200 dark:bg-dark-50 animate-pulse flex-shrink-0"></div>
        <div class="flex-1 space-y-1.5">
          <div class="h-3 w-24 bg-surface-100 dark:bg-dark-50 rounded animate-pulse"></div>
          <div class="h-10 bg-surface-100 dark:bg-dark-50 rounded animate-pulse"></div>
        </div>
      </div>
    </div>

    <div v-else-if="comments.length === 0" class="text-sm text-gray-400 italic">
      Chưa có bình luận nào.
    </div>

    <div v-else class="space-y-4">
      <div v-for="comment in comments" :key="comment.id" class="flex gap-3 group">
        <UserAvatar :user="comment.author" size="sm" class="flex-shrink-0 mt-0.5" />
        <div class="flex-1 min-w-0">
          <div class="flex items-baseline gap-2 mb-1">
            <span class="text-xs font-semibold text-gray-900 dark:text-white">{{ comment.author?.full_name }}</span>
            <span class="text-xs text-gray-400">{{ timeAgo(comment.created_at) }}</span>
            <button
              v-if="comment.author?.id === authStore.user?.id"
              @click="deleteComment(comment.id)"
              class="ml-auto opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
            >
              <TrashIcon class="w-3.5 h-3.5" />
            </button>
          </div>
          <div
            v-if="comment.content"
            class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-surface-50 dark:bg-dark-50 rounded-lg px-3 py-2"
            v-html="renderContent(comment.content)"
          ></div>
          <!-- Ảnh trong comment -->
          <img
            v-if="comment.image_url"
            :src="comment.image_url"
            class="mt-1.5 max-h-56 rounded-lg border border-surface-200 dark:border-dark-50 cursor-zoom-in hover:opacity-90 transition-opacity"
            title="Bấm để xem to"
            @click="openLightbox(comment.image_url, { alt: 'Ảnh bình luận' })"
          />
          <!-- Replies -->
          <div v-if="comment.replies?.length" class="mt-2 ml-4 space-y-2 border-l-2 border-surface-200 dark:border-dark-50 pl-3">
            <div v-for="reply in comment.replies" :key="reply.id" class="flex gap-2">
              <UserAvatar :user="reply.author" size="xs" class="flex-shrink-0 mt-0.5" />
              <div>
                <div class="flex items-baseline gap-2 mb-0.5">
                  <span class="text-xs font-semibold text-gray-900 dark:text-white">{{ reply.author?.full_name }}</span>
                  <span class="text-xs text-gray-400">{{ timeAgo(reply.created_at) }}</span>
                </div>
                <div v-if="reply.content" class="text-xs text-gray-700 dark:text-gray-300" v-html="renderContent(reply.content)"></div>
                <img
                  v-if="reply.image_url"
                  :src="reply.image_url"
                  class="mt-1 max-h-40 rounded-lg border border-surface-200 dark:border-dark-50 cursor-zoom-in hover:opacity-90 transition-opacity"
                  title="Bấm để xem to"
                  @click="openLightbox(reply.image_url, { alt: 'Ảnh bình luận' })"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New comment input -->
    <div class="flex gap-3 pt-2">
      <UserAvatar :user="authStore.user" size="sm" class="flex-shrink-0 mt-1" />
      <div class="flex-1">
        <div class="relative">
          <textarea
            ref="textareaRef"
            v-model="newComment"
            @input="onInput"
            @keydown="onKeydown"
            @paste="onPaste"
            class="input text-sm resize-none min-h-[72px] w-full"
            placeholder="Thêm bình luận... Gõ @ để nhắc thành viên, dán/đính kèm ảnh (Ctrl+Enter để gửi)"
          ></textarea>

          <!-- Mention picker -->
          <div
            v-if="mentionOpen && mentionMatches.length"
            class="absolute z-30 left-0 top-full mt-1 w-72 bg-white dark:bg-dark-100 rounded-xl border border-surface-200 dark:border-dark-50 shadow-modal overflow-hidden"
          >
            <div class="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-surface-50 dark:bg-dark-50/40 border-b border-surface-100 dark:border-dark-50">
              Thành viên dự án
            </div>
            <div class="max-h-56 overflow-y-auto">
              <button
                v-for="(user, idx) in mentionMatches"
                :key="user.id"
                type="button"
                @mousedown.prevent="applyMention(user)"
                @mouseenter="mentionIndex = idx"
                class="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-50 dark:hover:bg-dark-50 transition-colors"
                :class="idx === mentionIndex ? 'bg-brand-50 dark:bg-brand-950/20' : ''"
              >
                <UserAvatar :user="user" size="xs" />
                <span class="text-gray-800 dark:text-gray-200 truncate flex-1 text-left">{{ user.full_name }}</span>
                <span class="text-xs text-gray-400 truncate">@{{ user.username }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Ảnh đính kèm (preview trước khi gửi) -->
        <div v-if="imagePreview" class="relative inline-block mt-2">
          <img :src="imagePreview" class="max-h-32 rounded-lg border border-surface-200 dark:border-dark-50" />
          <button
            type="button"
            @click="clearImage"
            class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-800 text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
            title="Bỏ ảnh"
          >×</button>
        </div>

        <div class="flex items-center justify-between mt-1.5">
          <button
            type="button"
            @click="imageInput?.click()"
            class="btn-ghost btn-sm text-gray-400"
            title="Đính kèm ảnh"
          >
            <PhotoIcon class="w-4 h-4" /> Ảnh
          </button>
          <input ref="imageInput" type="file" accept="image/*" class="hidden" @change="onImageSelect" />
          <button
            @click="submitComment"
            :disabled="(!newComment.trim() && !selectedImage) || submitting"
            class="btn-primary btn-sm"
          >
            <span v-if="submitting" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Gửi
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrashIcon, PhotoIcon } from '@heroicons/vue/24/outline'
import { format } from 'date-fns'

const props = defineProps<{ issueId: number; projectId?: number }>()
const authStore = useAuthStore()
const api = useApi()
const { openLightbox } = useLightbox()

const comments = ref<any[]>([])
const loading = ref(true)
const submitting = ref(false)
const newComment = ref('')

// Ảnh đính kèm
const imageInput = ref<HTMLInputElement | null>(null)
const selectedImage = ref<File | null>(null)
const imagePreview = ref('')

function setImage(f: File) {
  if (!f || !f.type.startsWith('image/')) return
  if (f.size > 10 * 1024 * 1024) {
    try { useToast().error('Ảnh tối đa 10MB') } catch {}
    return
  }
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
  selectedImage.value = f
  imagePreview.value = URL.createObjectURL(f)
}
function onImageSelect(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) setImage(f)
}
function clearImage() {
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
  selectedImage.value = null
  imagePreview.value = ''
  if (imageInput.value) imageInput.value.value = ''
}
function onPaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items
  if (!items) return
  for (const it of items) {
    if (it.type.startsWith('image/')) {
      const f = it.getAsFile()
      if (f) { e.preventDefault(); setImage(f); break }
    }
  }
}

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const members = ref<any[]>([])
const mentionOpen = ref(false)
const mentionQuery = ref('')
const mentionIndex = ref(0)
const mentionStart = ref(-1)

const mentionMatches = computed(() => {
  const q = mentionQuery.value.toLowerCase()
  const base = members.value.filter(u => u.id !== authStore.user?.id)
  if (!q) return base.slice(0, 6)
  return base.filter(u =>
    (u.username || '').toLowerCase().includes(q) ||
    (u.full_name || '').toLowerCase().includes(q)
  ).slice(0, 6)
})

async function loadComments() {
  loading.value = true
  try {
    const data = await api.get('/api/comments/', { issue: props.issueId })
    comments.value = data.results || data
  } finally { loading.value = false }
}

async function loadMembers() {
  let projectId = props.projectId
  if (!projectId) {
    try {
      const issue = await api.get(`/api/issues/${props.issueId}/`)
      projectId = issue?.project
    } catch { return }
  }
  if (!projectId) return
  try {
    const data = await api.get(`/api/projects/${projectId}/members/`)
    members.value = (data || []).map((m: any) => m.user)
  } catch {}
}

function onInput(e: Event) {
  const ta = e.target as HTMLTextAreaElement
  const value = ta.value
  const caret = ta.selectionStart ?? value.length
  const upto = value.slice(0, caret)
  const m = upto.match(/(^|\s)@([\w.\-]*)$/)
  if (m) {
    mentionStart.value = caret - m[2].length - 1
    mentionQuery.value = m[2]
    mentionIndex.value = 0
    mentionOpen.value = true
  } else {
    mentionOpen.value = false
  }
}

function onKeydown(e: KeyboardEvent) {
  if (mentionOpen.value && mentionMatches.value.length) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      mentionIndex.value = (mentionIndex.value + 1) % mentionMatches.value.length
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      mentionIndex.value = (mentionIndex.value - 1 + mentionMatches.value.length) % mentionMatches.value.length
      return
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      applyMention(mentionMatches.value[mentionIndex.value])
      return
    }
    if (e.key === 'Escape') {
      mentionOpen.value = false
      return
    }
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault()
    submitComment()
  }
}

function applyMention(user: any) {
  const ta = textareaRef.value
  if (!ta) return
  const value = newComment.value
  const caret = ta.selectionStart ?? value.length
  const before = value.slice(0, mentionStart.value)
  const after = value.slice(caret)
  const insert = `@${user.username} `
  newComment.value = before + insert + after
  mentionOpen.value = false
  nextTick(() => {
    const pos = (before + insert).length
    ta.focus()
    ta.setSelectionRange(pos, pos)
  })
}

async function submitComment() {
  const text = newComment.value.trim()
  if (!text && !selectedImage.value) return
  submitting.value = true
  try {
    let comment: any
    if (selectedImage.value) {
      const fd = new FormData()
      fd.append('issue', String(props.issueId))
      if (text) fd.append('content', text)
      fd.append('image', selectedImage.value)
      comment = await api.post('/api/comments/', fd)
    } else {
      comment = await api.post('/api/comments/', { issue: props.issueId, content: text })
    }
    comments.value.push(comment)
    newComment.value = ''
    clearImage()
    // Nudge the notification store to refresh — if the user just mentioned
    // someone, this also surfaces the unread count for them quickly on the
    // recipient side via WS, and on the sender side any "you were mentioned"
    // notification (if backend echoes it).
    try { useNotificationsStore().refreshSoon() } catch {}
  } finally { submitting.value = false }
}

async function deleteComment(id: number) {
  if (!confirm('Xóa bình luận này?')) return
  await api.delete(`/api/comments/${id}/`)
  comments.value = comments.value.filter(c => c.id !== id)
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderContent(text: string) {
  if (!text) return ''
  return escapeHtml(text).replace(
    /(^|\s)@([A-Za-z0-9_.\-]+)/g,
    (_m, lead, name) =>
      `${lead}<span class="text-brand-600 dark:text-brand-400 font-semibold">@${name}</span>`
  )
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'vừa xong'
  if (mins < 60) return `${mins}p trước`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h trước`
  return format(new Date(dateStr), 'dd/MM/yyyy')
}

onMounted(() => {
  loadComments()
  loadMembers()
})
</script>

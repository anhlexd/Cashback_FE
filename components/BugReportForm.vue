<template>
  <div class="card border-red-200 dark:border-red-900/50 overflow-hidden">
    <div class="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-900/30">
      <BugAntIcon class="w-4 h-4 text-red-600 dark:text-red-400" />
      <span class="font-bold text-sm text-red-700 dark:text-red-300">Báo cáo lỗi trong {{ issue.issue_key }}</span>
      <button @click="$emit('cancel')" class="ml-auto btn-ghost btn-icon p-1">
        <XMarkIcon class="w-4 h-4" />
      </button>
    </div>

    <div class="p-4 space-y-4">
      <!-- Bug list -->
      <div class="space-y-3">
        <div
          v-for="(bug, i) in bugs"
          :key="i"
          class="border border-surface-200 dark:border-dark-50 rounded-xl overflow-hidden"
        >
          <div class="flex items-center gap-2 px-3 py-2 bg-surface-50 dark:bg-dark-50">
            <span class="text-xs font-bold text-red-500">Bug #{{ i + 1 }}</span>
            <button
              v-if="bugs.length > 1"
              @click="removeBug(i)"
              class="ml-auto text-gray-300 hover:text-red-500 transition-colors"
            >
              <XMarkIcon class="w-3.5 h-3.5" />
            </button>
          </div>
          <div class="p-3 space-y-3">
            <!-- Title -->
            <div>
              <label class="label">Tiêu đề lỗi <span class="text-red-500">*</span></label>
              <input
                v-model="bug.title"
                class="input text-sm"
                :placeholder="`Ví dụ: Button submit không hoạt động trên mobile`"
                required
              />
            </div>

            <!-- Priority + Estimate (dev) + Environment -->
            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="label">Mức độ (priority)</label>
                <select v-model="bug.priority" class="input text-sm py-1.5">
                  <option value="critical">🔴 Critical</option>
                  <option value="high">🟠 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
              </div>
              <div>
                <label class="label">Estimate (phút)</label>
                <input
                  v-model.number="bug.estimated_minutes"
                  type="number" min="1" max="600"
                  class="input text-sm py-1.5"
                  placeholder="vd 30"
                />
              </div>
              <div>
                <label class="label">Môi trường</label>
                <input v-model="bug.environment" class="input text-sm py-1.5" placeholder="Chrome/iOS" />
              </div>
            </div>

            <!-- Rich description with image drag-drop -->
            <div>
              <label class="label">
                Chi tiết lỗi
                <span class="text-gray-400 font-normal">— kéo thả / dán ảnh trực tiếp, các bước tái hiện, kết quả mong đợi vs thực tế</span>
              </label>
              <RichTextEditor
                v-model="bug.description"
                placeholder="Mô tả chi tiết lỗi, các bước tái hiện, ảnh chụp màn hình (kéo thả vào đây)…"
                min-height="150px"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Add more bug -->
      <button @click="addBug" class="btn-ghost btn-sm text-gray-400 text-xs w-full border border-dashed border-gray-200 dark:border-dark-50 py-2 rounded-xl hover:border-brand-300 hover:text-brand-600 transition-all">
        <PlusIcon class="w-3.5 h-3.5" />
        Thêm lỗi nữa
      </button>

      <!-- Overall notes -->
      <div>
        <label class="label">Ghi chú tổng hợp</label>
        <textarea
          v-model="overallNotes"
          class="input text-sm resize-none"
          rows="2"
          placeholder="Tổng quan về kết quả kiểm tra..."
        ></textarea>
      </div>

      <!-- Error -->
      <div v-if="error" class="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{{ error }}</div>

      <!-- Submit -->
      <div class="flex gap-2 pt-1">
        <button @click="$emit('cancel')" class="btn-secondary flex-1">Hủy</button>
        <button
          @click="submit"
          :disabled="loading || !isValid"
          class="flex-1 btn bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
        >
          <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          🐛 Gửi {{ bugs.length }} bug → Dev sửa
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BugAntIcon, XMarkIcon, PlusIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  issue: any
  sessionId?: number
  testNotes?: string
}>()
const emit = defineEmits(['submitted', 'cancel'])

const api = useApi()
const loading = ref(false)
const error = ref('')
const overallNotes = ref(props.testNotes || '')

const defaultBug = () => ({
  title: '',
  priority: 'high',
  estimated_minutes: null as number | null,
  description: '',
  environment: '',
})

const bugs = ref([defaultBug()])

function addBug() { bugs.value.push(defaultBug()) }
function removeBug(i: number) { bugs.value.splice(i, 1) }

const isValid = computed(() => bugs.value.every(b => b.title.trim()))

async function submit() {
  if (!isValid.value) { error.value = 'Mỗi bug phải có tiêu đề'; return }
  loading.value = true; error.value = ''
  try {
    const res = await api.post(`/api/issues/${props.issue.id}/report_bugs/`, {
      session_id: props.sessionId,
      notes: overallNotes.value,
      bugs: bugs.value.filter(b => b.title.trim()),
    })
    emit('submitted', res)
  } catch (e: any) {
    error.value = e?.data?.detail || 'Gửi báo cáo thất bại'
  } finally { loading.value = false }
}
</script>

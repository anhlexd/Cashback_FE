<template>
  <div class="space-y-2">
    <div v-if="!showForm">
      <button
        v-if="canSubmit"
        @click="showForm = true"
        class="btn bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold rounded-xl px-4 py-2 gap-2 w-full justify-center"
      >
        <ArrowUpTrayIcon class="w-4 h-4" />
        🚀 Nộp để kiểm tra (in_review)
      </button>
      <div v-else-if="issue.status === 'in_review'" class="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl text-xs text-yellow-700 dark:text-yellow-300">
        <ClockIcon class="w-4 h-4 flex-shrink-0" />
        Đang chờ tester kiểm tra...
      </div>
    </div>

    <div v-else class="card p-4 space-y-3">
      <div class="text-sm font-semibold text-gray-800 dark:text-gray-200">📤 Nộp để kiểm tra</div>
      <div>
        <label class="label">Commit SHA (tùy chọn)</label>
        <input v-model="commitSha" class="input font-mono text-xs" placeholder="abc123de (để hệ thống tự nhận diện)" />
        <p class="text-xs text-gray-400 mt-1">
          Nếu commit message chứa <code class="bg-surface-100 dark:bg-dark-50 px-1 rounded">{{ issue.issue_key }}</code>, hệ thống sẽ tự động chuyển trạng thái.
        </p>
      </div>
      <div class="flex gap-2">
        <button @click="showForm = false" class="btn-secondary flex-1 text-sm">Hủy</button>
        <button @click="submit" :disabled="loading" class="flex-1 btn bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold rounded-xl">
          <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          Nộp review
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowUpTrayIcon, ClockIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{ issue: any }>()
const emit = defineEmits(['updated'])
const api = useApi()
const toast = useToast()
const showForm = ref(false)
const commitSha = ref('')
const loading = ref(false)

const canSubmit = computed(() =>
  props.issue.status === 'in_progress' || props.issue.status === 'bug_fixing'
)

async function submit() {
  loading.value = true
  try {
    const res = await api.post(`/api/issues/${props.issue.id}/submit_review/`, {
      commit_sha: commitSha.value.trim(),
    })
    emit('updated', res)
    showForm.value = false
    toast.success('🚀 Đã nộp review — thông báo cho tester!')
  } catch (e: any) {
    toast.error(e?.data?.detail || 'Không thể nộp review')
  } finally { loading.value = false }
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>
      <div class="relative w-full max-w-lg bg-white dark:bg-dark-100 rounded-2xl shadow-modal animate-scale-in p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="font-bold text-gray-900 dark:text-white">Cài đặt Webhook</h3>
          <button @click="$emit('close')" class="btn-ghost btn-icon"><XMarkIcon class="w-4 h-4" /></button>
        </div>

        <div class="space-y-5">
          <!-- Steps -->
          <div class="space-y-3">
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Cài đặt tự động qua API</h4>

            <div>
              <label class="label">Webhook URL (URL công khai của server)</label>
              <div class="flex gap-2">
                <input v-model="webhookUrl" class="input flex-1 font-mono text-xs" placeholder="https://your-domain.com/api/github/webhook/" />
                <button @click="copyUrl" class="btn-secondary btn-sm flex-shrink-0">
                  <ClipboardIcon class="w-3.5 h-3.5" />
                </button>
              </div>
              <p class="text-xs text-gray-400 mt-1">Dùng ngrok hoặc domain thật cho môi trường dev</p>
            </div>

            <button @click="autoSetup" :disabled="!webhookUrl || loading" class="btn-primary w-full">
              <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              🤖 Tự động đăng ký Webhook
            </button>
          </div>

          <div class="flex items-center gap-3">
            <div class="flex-1 h-px bg-surface-200 dark:bg-dark-50"></div>
            <span class="text-xs text-gray-400">hoặc cài thủ công</span>
            <div class="flex-1 h-px bg-surface-200 dark:bg-dark-50"></div>
          </div>

          <!-- Manual setup guide -->
          <div class="space-y-3">
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Hướng dẫn thủ công</h4>
            <ol class="space-y-2.5">
              <li v-for="(step, i) in manualSteps" :key="i" class="flex items-start gap-2.5 text-xs">
                <span class="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{{ i+1 }}</span>
                <div>
                  <div class="text-gray-700 dark:text-gray-300">{{ step.text }}</div>
                  <code v-if="step.code" class="block mt-1 bg-surface-100 dark:bg-dark-50 px-2 py-1 rounded text-gray-600 dark:text-gray-400 font-mono select-all">{{ step.code }}</code>
                </div>
              </li>
            </ol>
          </div>

          <!-- Secret key -->
          <div class="p-3 bg-surface-50 dark:bg-dark-50 rounded-xl">
            <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">🔑 Webhook Secret</div>
            <code class="text-xs font-mono text-gray-700 dark:text-gray-300 select-all">devflow-webhook-secret-change-me</code>
            <div class="text-xs text-gray-400 mt-1">Thay bằng giá trị trong <code>GITHUB_WEBHOOK_SECRET</code> env</div>
          </div>

          <div v-if="error" class="text-sm text-red-500 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">{{ error }}</div>

          <div class="flex justify-end gap-2">
            <button @click="$emit('close')" class="btn-secondary">Đóng</button>
            <button @click="$emit('setup')" class="btn-primary">Đã cài xong</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { XMarkIcon, ClipboardIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{ repo: any }>()
const emit = defineEmits(['close', 'setup'])

const api = useApi()
const toast = useToast()
const webhookUrl = ref('')
const loading = ref(false)
const error = ref('')

const manualSteps = computed(() => [
  { text: `Mở GitHub repo: github.com/${props.repo?.full_name}` },
  { text: 'Vào Settings → Webhooks → Add webhook' },
  { text: 'Điền Payload URL:', code: webhookUrl.value || 'https://your-domain.com/api/github/webhook/' },
  { text: 'Content type: application/json' },
  { text: 'Điền Secret (từ env GITHUB_WEBHOOK_SECRET)' },
  { text: 'Events: chọn "push" và "pull_request"' },
  { text: 'Nhấn Add webhook' },
])

async function autoSetup() {
  if (!webhookUrl.value) return
  loading.value = true; error.value = ''
  try {
    await api.post(`/api/github/repos/${props.repo.id}/setup_webhook/`, {
      webhook_url: webhookUrl.value,
    })
    toast.success('Webhook đã được đăng ký!')
    emit('setup')
  } catch (err: any) {
    error.value = err?.data?.error || 'Không thể đăng ký webhook. Kiểm tra access token.'
  } finally { loading.value = false }
}

function copyUrl() {
  navigator.clipboard.writeText(webhookUrl.value || window.location.origin + '/api/github/webhook/')
  toast.success('Đã copy URL')
}
</script>

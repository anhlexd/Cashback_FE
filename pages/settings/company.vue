<template>
  <div class="card p-6 space-y-6 max-w-2xl">
    <div>
      <h2 class="font-semibold text-gray-900 dark:text-white">Cài đặt công ty</h2>
      <p class="text-sm text-gray-500 mt-1">
        Cấu hình dùng chung: AI, GitHub, OAuth Google Drive và Figma cho toàn bộ dự án.
      </p>
    </div>

    <div v-if="!isAdmin" class="p-4 rounded-lg bg-surface-50 dark:bg-dark-50 text-sm text-gray-500">
      Chỉ tài khoản <strong>Admin</strong> hệ thống mới được chỉnh sửa mục này.
    </div>

    <template v-else>
      <div v-if="loading" class="text-sm text-gray-400 py-4">Đang tải…</div>
      <form v-else class="space-y-8" @submit.prevent="save">
        <!-- OpenAI & Cursor -->
        <section class="space-y-4">
          <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-200">OpenAI & GitHub</h3>
          <div>
            <label class="label">OPENAI_API_KEY</label>
            <input
              v-model="form.openai_api_key"
              type="password"
              class="input font-mono text-xs"
              placeholder="sk-… (để trống nếu không đổi)"
              autocomplete="off"
            />
            <p v-if="settings?.openai_api_key_set" class="text-xs text-green-600 mt-1">
              Đang dùng: {{ settings.openai_api_key_masked }}
            </p>
          </div>
          <div>
            <label class="label">OpenAI Model</label>
            <input v-model="form.openai_model" class="input text-sm" placeholder="gpt-4o-mini" />
          </div>
          <div class="p-3 rounded-lg bg-surface-50 dark:bg-dark-50 text-xs text-gray-600 dark:text-gray-400">
            Cấu hình <strong>Cursor</strong> (phân tích logic repo) tại
            <NuxtLink to="/settings/cursor" class="text-brand-600 underline">Cài đặt → Cursor</NuxtLink>.
          </div>
          <div>
            <label class="label">GitHub Organization (tuỳ chọn)</label>
            <input v-model="form.github_org" class="input text-sm font-mono" placeholder="idtinc" />
            <p class="text-xs text-gray-400 mt-1">
              Cần <code>GITHUB_ACCESS_TOKEN</code> trên server để lấy danh sách repo.
            </p>
          </div>
        </section>

        <!-- Google -->
        <section class="space-y-4 border-t border-gray-200 dark:border-dark-100 pt-6">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-200">Google Drive OAuth</h3>
              <p class="text-xs text-gray-500 mt-1">
                Tạo OAuth 2.0 Client trên
                <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener" class="text-primary-600 underline">Google Cloud Console</a>.
              </p>
            </div>
            <span
              class="text-xs px-2 py-0.5 rounded-full shrink-0"
              :class="settings?.google_oauth_ready ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'"
            >
              {{ settings?.google_oauth_ready ? 'Sẵn sàng' : 'Chưa đủ' }}
            </span>
          </div>
          <div>
            <label class="label">GOOGLE_CLIENT_ID</label>
            <input
              v-model="form.google_client_id"
              class="input text-sm font-mono"
              placeholder="xxxx.apps.googleusercontent.com"
              autocomplete="off"
            />
          </div>
          <div>
            <label class="label">GOOGLE_CLIENT_SECRET</label>
            <input
              v-model="form.google_client_secret"
              type="password"
              class="input text-sm font-mono"
              placeholder="Để trống nếu không đổi"
              autocomplete="off"
            />
            <p v-if="settings?.google_client_secret_set" class="text-xs text-green-600 mt-1">
              Đã lưu: {{ settings.google_client_secret_masked || '••••' }}
            </p>
          </div>
          <div>
            <label class="label">GOOGLE_OAUTH_REDIRECT_URI</label>
            <input
              v-model="form.google_oauth_redirect_uri"
              class="input text-sm font-mono"
              placeholder="https://api.your-domain.com/api/drive/oauth/callback/"
            />
            <p class="text-xs text-gray-400 mt-1">
              Thêm đúng URI này vào <strong>Authorized redirect URIs</strong> của OAuth client.
            </p>
          </div>
        </section>

        <!-- Figma -->
        <section class="space-y-4 border-t border-gray-200 dark:border-dark-100 pt-6">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-200">Figma OAuth</h3>
              <p class="text-xs text-gray-500 mt-1">
                Tạo app tại
                <a href="https://www.figma.com/developers/apps" target="_blank" rel="noopener" class="text-primary-600 underline">Figma Developers</a>.
                Trong <strong>OAuth scopes</strong> của app, bật đúng các scope sau (và Publish app):
              </p>
              <p
                v-if="settings?.figma_oauth_scopes"
                class="text-[11px] font-mono text-gray-600 dark:text-gray-400 mt-1 break-words"
              >
                {{ settings.figma_oauth_scopes }}
              </p>
              <p class="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                Không dùng <code>file_read</code> (đã deprecated) — lỗi «Invalid scopes for app» thường do scope URL không khớp app.
              </p>
            </div>
            <span
              class="text-xs px-2 py-0.5 rounded-full shrink-0"
              :class="settings?.figma_oauth_ready ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'"
            >
              {{ settings?.figma_oauth_ready ? 'Sẵn sàng' : 'Chưa đủ' }}
            </span>
          </div>
          <div>
            <label class="label">FIGMA_CLIENT_ID</label>
            <input
              v-model="form.figma_client_id"
              class="input text-sm font-mono"
              placeholder="Client ID từ Figma app"
              autocomplete="off"
            />
          </div>
          <div>
            <label class="label">FIGMA_CLIENT_SECRET</label>
            <input
              v-model="form.figma_client_secret"
              type="password"
              class="input text-sm font-mono"
              placeholder="Để trống nếu không đổi"
              autocomplete="off"
            />
            <p v-if="settings?.figma_client_secret_set" class="text-xs text-green-600 mt-1">
              Đã lưu: {{ settings.figma_client_secret_masked || '••••' }}
            </p>
          </div>
          <div>
            <label class="label">FIGMA_OAUTH_REDIRECT_URI</label>
            <input
              v-model="form.figma_oauth_redirect_uri"
              class="input text-sm font-mono"
              placeholder="https://api.your-domain.com/api/figma/oauth/callback/"
            />
          </div>
          <div>
            <label class="label">FIGMA_WEBHOOK_PASSCODE (tuỳ chọn)</label>
            <input
              v-model="form.figma_webhook_passcode"
              type="password"
              class="input text-sm font-mono"
              placeholder="Chuỗi bí mật khi đăng ký webhook Figma"
              autocomplete="off"
            />
            <p v-if="settings?.figma_webhook_passcode_set" class="text-xs text-green-600 mt-1">
              Đã cấu hình passcode webhook.
            </p>
          </div>
        </section>

        <!-- Frontend URL -->
        <section class="space-y-4 border-t border-gray-200 dark:border-dark-100 pt-6">
          <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-200">URL sau OAuth</h3>
          <div>
            <label class="label">FRONTEND_URL</label>
            <input
              v-model="form.integration_frontend_url"
              class="input text-sm font-mono"
              placeholder="https://app.your-domain.com"
            />
            <p class="text-xs text-gray-400 mt-1">
              Sau khi user đồng ý OAuth, backend redirect về <code>{URL}/integrations/drive</code> hoặc <code>/integrations/figma</code>.
            </p>
          </div>
        </section>

        <div v-if="error" class="text-sm text-red-600">{{ error }}</div>
        <div v-if="success" class="text-sm text-green-600">Đã lưu cài đặt công ty.</div>
        <button type="submit" class="btn-primary" :disabled="saving">
          <span v-if="saving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          Lưu cài đặt
        </button>
      </form>
    </template>

    <div v-if="settings && !settings.openai_api_key_set" class="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
      Chưa có OpenAI key — Knowledge Graph vẫn chạy ở chế độ rule-based.
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const api = useApi()

const isAdmin = computed(() => authStore.user?.role === 'admin')
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref(false)
const settings = ref<any>(null)

const form = reactive({
  openai_api_key: '',
  openai_model: 'gpt-4o-mini',
  github_org: '',
  google_client_id: '',
  google_client_secret: '',
  google_oauth_redirect_uri: '',
  figma_client_id: '',
  figma_client_secret: '',
  figma_oauth_redirect_uri: '',
  figma_webhook_passcode: '',
  integration_frontend_url: '',
})

function applySettingsFromResponse(data: any) {
  settings.value = data
  form.openai_model = data.openai_model || 'gpt-4o-mini'
  form.github_org = data.github_org || ''
  form.google_client_id = data.google_client_id || ''
  form.google_oauth_redirect_uri = data.google_oauth_redirect_uri || data.google_redirect_uri || ''
  form.figma_client_id = data.figma_client_id || ''
  form.figma_oauth_redirect_uri = data.figma_oauth_redirect_uri || data.figma_redirect_uri || ''
  form.integration_frontend_url = data.integration_frontend_url || ''
  form.openai_api_key = ''
  form.google_client_secret = ''
  form.figma_client_secret = ''
  form.figma_webhook_passcode = ''
}

async function load() {
  loading.value = true
  try {
    applySettingsFromResponse(await api.get('/api/auth/company-settings/'))
  } catch (e: any) {
    error.value = e?.data?.detail || 'Không tải được cài đặt'
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  error.value = ''
  success.value = false
  try {
    const body: Record<string, string> = {
      openai_model: form.openai_model,
      github_org: form.github_org,
      google_client_id: form.google_client_id.trim(),
      google_oauth_redirect_uri: form.google_oauth_redirect_uri.trim(),
      figma_client_id: form.figma_client_id.trim(),
      figma_oauth_redirect_uri: form.figma_oauth_redirect_uri.trim(),
      integration_frontend_url: form.integration_frontend_url.trim(),
    }
    if (form.openai_api_key.trim()) body.openai_api_key = form.openai_api_key.trim()
    if (form.google_client_secret.trim()) body.google_client_secret = form.google_client_secret.trim()
    if (form.figma_client_secret.trim()) body.figma_client_secret = form.figma_client_secret.trim()
    if (form.figma_webhook_passcode.trim()) body.figma_webhook_passcode = form.figma_webhook_passcode.trim()

    applySettingsFromResponse(await api.patch('/api/auth/company-settings/', body))
    success.value = true
    setTimeout(() => { success.value = false }, 3000)
  } catch (e: any) {
    error.value = e?.data?.detail || 'Lưu thất bại'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="card p-6 space-y-6 max-w-2xl">
    <div>
      <h2 class="font-semibold text-gray-900 dark:text-white">Cursor — Phân tích logic dự án</h2>
      <p class="text-sm text-gray-500 mt-1">
        Cấu hình Cloud Agents API để Admin đọc repo GitHub và sinh tài liệu cấu trúc + chức năng.
        Key lưu trên server DevFlow, không cần biến môi trường.
      </p>
    </div>

    <div v-if="!isAdmin" class="p-4 rounded-lg bg-surface-50 dark:bg-dark-50 text-sm text-gray-500">
      Chỉ tài khoản <strong>Admin</strong> hệ thống mới được chỉnh sửa.
    </div>

    <template v-else>
      <div v-if="loading" class="text-sm text-gray-400 py-4">Đang tải…</div>
      <form v-else class="space-y-5" @submit.prevent="save">
        <div>
          <label class="label">Cursor API key</label>
          <input
            v-model="form.cursor_api_key"
            type="password"
            class="input font-mono text-xs w-full"
            placeholder="cursor_… (để trống nếu không đổi)"
            autocomplete="off"
          />
          <p v-if="settings?.cursor_api_key_set" class="text-xs text-green-600 mt-1">
            Đã lưu: {{ settings.cursor_api_key_masked }}
          </p>
          <p class="text-xs text-gray-400 mt-2">
            Lấy key tại
            <a
              href="https://cursor.com/dashboard/integrations"
              target="_blank"
              rel="noopener"
              class="text-brand-600 underline"
            >Cursor Dashboard → Integrations</a>
            (hoặc Service account của team).
          </p>
        </div>

        <div>
          <label class="label">Model phân tích</label>
          <input
            v-model="form.cursor_logic_model"
            class="input text-sm font-mono w-full"
            placeholder="composer-2"
          />
          <p class="text-xs text-gray-400 mt-1">
            ID model từ Cursor (mặc định <code class="text-[10px]">composer-2</code>).
          </p>
        </div>

        <div
          class="p-3 rounded-lg text-xs"
          :class="settings?.cursor_api_key_set
            ? 'bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300'
            : 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300'"
        >
          <template v-if="settings?.cursor_api_key_set">
            Sẵn sàng dùng
            Mở dự án → tab <strong>Knowledge Graph</strong> (Admin).
          </template>
          <template v-else>
            Chưa có API key — lưu key ở trên để bật phân tích logic.
          </template>
        </div>

        <div v-if="error" class="text-sm text-red-600">{{ error }}</div>
        <div v-if="success" class="text-sm text-green-600">Đã lưu cấu hình Cursor.</div>

        <button type="submit" class="btn-primary" :disabled="saving">
          <span v-if="saving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Lưu cấu hình
        </button>
      </form>
    </template>
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
  cursor_api_key: '',
  cursor_logic_model: 'composer-2',
})

function applyFromResponse(data: any) {
  settings.value = data
  form.cursor_logic_model = data.cursor_logic_model || 'composer-2'
  form.cursor_api_key = ''
}

async function load() {
  if (!isAdmin.value) {
    loading.value = false
    return
  }
  loading.value = true
  try {
    applyFromResponse(await api.get('/api/auth/company-settings/'))
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
      cursor_logic_model: form.cursor_logic_model.trim() || 'composer-2',
    }
    if (form.cursor_api_key.trim()) {
      body.cursor_api_key = form.cursor_api_key.trim()
    }
    applyFromResponse(await api.patch('/api/auth/company-settings/', body))
    success.value = true
  } catch (e: any) {
    error.value = e?.data?.detail || 'Lưu thất bại'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

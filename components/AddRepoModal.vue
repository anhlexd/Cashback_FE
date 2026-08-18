<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>
      <div class="relative w-full max-w-md bg-white dark:bg-dark-100 rounded-2xl shadow-modal animate-scale-in p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="font-bold text-gray-900 dark:text-white">Kết nối GitHub Repository</h3>
          <button @click="$emit('close')" class="btn-ghost btn-icon"><XMarkIcon class="w-4 h-4" /></button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Project selector -->
          <div>
            <label class="label">Project <span class="text-red-500">*</span></label>
            <select v-model="form.project" class="input" required>
              <option value="">Chọn project...</option>
              <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }} ({{ p.key }})</option>
            </select>
          </div>

          <!-- Repo full name -->
          <div>
            <label class="label">Repository <span class="text-red-500">*</span></label>
            <div class="flex gap-2">
              <input v-model="form.repo_owner" class="input w-36" placeholder="owner" required />
              <span class="flex items-center text-gray-400">/</span>
              <input v-model="form.repo_name" class="input flex-1" placeholder="repo-name" required />
            </div>
            <p class="text-xs text-gray-400 mt-1">Ví dụ: my-company / backend-api</p>
          </div>

          <!-- Branch -->
          <div>
            <label class="label">Default branch</label>
            <input v-model="form.default_branch" class="input" placeholder="main" />
          </div>

          <!-- Token -->
          <div>
            <label class="label">GitHub Personal Access Token</label>
            <input v-model="form.access_token" type="password" class="input font-mono text-xs"
                   placeholder="ghp_xxxxxxxxxxxx" />
            <p class="text-xs text-gray-400 mt-1">
              Cần quyền <code class="bg-surface-100 dark:bg-dark-50 px-1 rounded">repo</code>.
              <a href="https://github.com/settings/tokens/new" target="_blank" class="text-brand-600 dark:text-brand-400 hover:underline ml-1">Tạo token tại đây →</a>
            </p>
          </div>

          <div v-if="error" class="text-sm text-red-500 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">{{ error }}</div>

          <div class="flex justify-end gap-2 pt-1">
            <button type="button" @click="$emit('close')" class="btn-secondary">Hủy</button>
            <button type="submit" :disabled="loading" class="btn-primary">
              <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Kết nối
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'

const emit = defineEmits(['close', 'added'])
const api = useApi()
const projectsStore = useProjectsStore()
const toast = useToast()

const projects = computed(() => projectsStore.projects)
const form = reactive({
  project: '',
  repo_owner: '',
  repo_name: '',
  default_branch: 'main',
  access_token: '',
})
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  loading.value = true; error.value = ''
  try {
    await api.post('/api/github/repos/', {
      project: Number(form.project),
      repo_owner: form.repo_owner,
      repo_name: form.repo_name,
      full_name: `${form.repo_owner}/${form.repo_name}`,
      default_branch: form.default_branch || 'main',
      access_token: form.access_token,
    })
    toast.success(`Đã kết nối ${form.repo_owner}/${form.repo_name}`)
    emit('added')
  } catch (err: any) {
    error.value = err?.data?.detail || err?.data?.full_name?.[0] || 'Kết nối thất bại'
  } finally { loading.value = false }
}

onMounted(() => projectsStore.fetchProjects())
</script>

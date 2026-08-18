<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')"></div>
      <div class="relative w-full max-w-md bg-white dark:bg-dark-100 rounded-2xl shadow-modal animate-scale-in p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="font-bold text-gray-900 dark:text-white">Tạo Project mới</h3>
          <button @click="$emit('close')" class="btn-ghost btn-icon"><XMarkIcon class="w-4 h-4" /></button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="label">Tên Project <span class="text-red-500">*</span></label>
            <input v-model="form.name" @input="autoKey" class="input" placeholder="Ví dụ: E-Commerce Platform" required autofocus />
          </div>
          <div>
            <label class="label">Project Key <span class="text-red-500">*</span></label>
            <input
              v-model="form.key"
              class="input font-mono uppercase"
              placeholder="ECP"
              maxlength="10"
              required
              @input="form.key = form.key.toUpperCase().replace(/[^A-Z0-9]/g, '')"
            />
            <p class="text-xs text-gray-400 mt-1">Dùng để đặt mã issue (VD: ECP-1, ECP-2)</p>
          </div>
          <div>
            <label class="label">Mô tả</label>
            <textarea v-model="form.description" class="input resize-none" rows="2" placeholder="Mô tả ngắn về project..."></textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Ngày bắt đầu</label>
              <input v-model="form.start_date" type="date" class="input" />
            </div>
            <div>
              <label class="label">Ngày kết thúc</label>
              <input v-model="form.end_date" type="date" class="input" />
            </div>
          </div>
          <div v-if="error" class="text-sm text-red-500 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">{{ error }}</div>
          <div class="flex justify-end gap-2 pt-1">
            <button type="button" @click="$emit('close')" class="btn-secondary">Hủy</button>
            <button type="submit" :disabled="loading" class="btn-primary">
              <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Tạo Project
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'

const emit = defineEmits(['close', 'created'])
const authStore = useAuthStore()
const projectsStore = useProjectsStore()

const form = reactive({ name: '', key: '', description: '', start_date: '', end_date: '' })
const loading = ref(false)
const error = ref('')

function autoKey() {
  if (!form.name) return
  form.key = form.name
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .slice(0, 6)
}

async function handleSubmit() {
  if (authStore.user?.role !== 'admin') {
    error.value = 'Chỉ Admin hệ thống được tạo project mới.'
    return
  }
  loading.value = true; error.value = ''
  try {
    const payload: any = { name: form.name, key: form.key }
    if (form.description) payload.description = form.description
    if (form.start_date) payload.start_date = form.start_date
    if (form.end_date) payload.end_date = form.end_date
    const project = await projectsStore.createProject(payload)
    emit('created', project)
  } catch (err: any) {
    const d = err?.data || {}
    error.value = d.key?.[0] || d.name?.[0] || d.detail || 'Tạo project thất bại'
  } finally { loading.value = false }
}
</script>

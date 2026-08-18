<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')"></div>
      <div class="relative w-full max-w-md bg-white dark:bg-dark-100 rounded-2xl shadow-modal animate-scale-in p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="font-bold text-gray-900 dark:text-white">Thêm thành viên</h3>
          <button @click="$emit('close')" class="btn-ghost btn-icon"><XMarkIcon class="w-4 h-4" /></button>
        </div>

        <!-- Search users -->
        <div class="mb-4">
          <input v-model="search" class="input" placeholder="Tìm theo tên hoặc email..." autofocus />
        </div>

        <!-- User results -->
        <div class="max-h-52 overflow-y-auto border border-surface-200 dark:border-dark-50 rounded-xl mb-4 divide-y divide-surface-100 dark:divide-dark-50">
          <div v-if="loading" class="p-4 text-center">
            <div class="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <div v-else-if="users.length === 0 && search" class="p-4 text-sm text-gray-400 text-center">
            Không tìm thấy người dùng
          </div>
          <div v-else-if="!search" class="p-4 text-sm text-gray-400 text-center">
            Nhập tên hoặc email để tìm kiếm
          </div>
          <button
            v-for="user in users"
            :key="user.id"
            type="button"
            @click="toggleUser(user)"
            class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-50 dark:hover:bg-dark-50 transition-colors"
            :class="selectedUsers.find(u => u.id === user.id) ? 'bg-brand-50 dark:bg-brand-950/20' : ''"
          >
            <UserAvatar :user="user" size="sm" />
            <div class="flex-1 text-left">
              <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user.full_name }}</div>
              <div class="text-xs text-gray-400">{{ user.email }}</div>
            </div>
            <CheckIcon v-if="selectedUsers.find(u => u.id === user.id)" class="w-4 h-4 text-brand-500" />
          </button>
        </div>

        <!-- Selected users -->
        <div v-if="selectedUsers.length > 0" class="mb-4">
          <div class="text-xs font-medium text-gray-500 mb-2">Đã chọn ({{ selectedUsers.length }})</div>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="user in selectedUsers" :key="user.id"
              class="flex items-center gap-1.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-2.5 py-1 rounded-lg text-xs font-medium"
            >
              {{ user.full_name }}
              <button @click="toggleUser(user)" class="hover:text-brand-900 dark:hover:text-brand-100">
                <XMarkIcon class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        <!-- Role selection -->
        <div class="mb-5">
          <label class="label">Vai trò</label>
          <select v-model="selectedRole" class="input">
            <option value="developer">Developer</option>
            <option value="tester">Tester</option>
            <option value="manager">Manager</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>

        <div v-if="error" class="text-sm text-red-500 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-3">{{ error }}</div>

        <div class="flex justify-end gap-2">
          <button @click="$emit('close')" class="btn-secondary">Hủy</button>
          <button @click="handleAdd" :disabled="selectedUsers.length === 0 || adding" class="btn-primary">
            <span v-if="adding" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Thêm {{ selectedUsers.length > 0 ? `(${selectedUsers.length})` : '' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { XMarkIcon, CheckIcon } from '@heroicons/vue/24/outline'
import { useDebounceFn } from '@vueuse/core'
import { ref, watch } from 'vue'

const props = defineProps<{ projectId: number }>()
const emit = defineEmits(['close', 'added'])

const api = useApi()
const search = ref('')
const users = ref<any[]>([])
const selectedUsers = ref<any[]>([])
const selectedRole = ref('developer')
const loading = ref(false)
const adding = ref(false)
const error = ref('')

const searchUsers = useDebounceFn(async () => {
  if (!search.value.trim()) { users.value = []; return }
  loading.value = true
  try {
    const data = await api.get('/api/auth/users/', { search: search.value })
    users.value = data.results || data
  } finally { loading.value = false }
}, 300)

watch(search, searchUsers)

function toggleUser(user: any) {
  const idx = selectedUsers.value.findIndex(u => u.id === user.id)
  if (idx === -1) selectedUsers.value.push(user)
  else selectedUsers.value.splice(idx, 1)
}

async function handleAdd() {
  if (selectedUsers.value.length === 0) return
  adding.value = true; error.value = ''
  try {
    await Promise.all(selectedUsers.value.map(user =>
      api.post(`/api/projects/${props.projectId}/members/`, {
        user_id: user.id, role: selectedRole.value
      })
    ))
    emit('added')
  } catch (err: any) {
    error.value = err?.data?.detail || 'Thêm thành viên thất bại'
  } finally { adding.value = false }
}
</script>

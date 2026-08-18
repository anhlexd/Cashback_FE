<template>
  <div class="relative" ref="containerRef">
    <button
      type="button"
      @click="open = !open"
      class="input text-sm py-1.5 flex items-center gap-2 cursor-pointer w-full"
    >
      <UserAvatar v-if="selectedUser" :user="selectedUser" size="xs" />
      <span :class="selectedUser ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400'">
        {{ selectedUser?.full_name || 'Chưa phân công' }}
      </span>
      <ChevronDownIcon class="w-3.5 h-3.5 ml-auto text-gray-400 flex-shrink-0" />
    </button>

    <Transition name="slide-in">
      <div v-if="open" class="absolute z-30 top-full left-0 mt-1 w-full bg-white dark:bg-dark-100 rounded-xl border border-surface-200 dark:border-dark-50 shadow-modal overflow-hidden">
        <div class="p-2 border-b border-surface-100 dark:border-dark-50">
          <input v-model="search" class="input py-1.5 text-xs" placeholder="Tìm thành viên..." autofocus />
        </div>
        <div class="max-h-44 overflow-y-auto">
          <button
            type="button"
            @click="select(null)"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:bg-surface-50 dark:hover:bg-dark-50 transition-colors"
          >
            <div class="w-5 h-5 rounded-full border border-dashed border-gray-300 dark:border-gray-600 flex-shrink-0"></div>
            Không phân công
          </button>
          <button
            v-for="user in filteredUsers"
            :key="user.id"
            type="button"
            @click="select(user)"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-50 dark:hover:bg-dark-50 transition-colors"
            :class="modelValue === user.id ? 'bg-brand-50 dark:bg-brand-950/20' : ''"
          >
            <UserAvatar :user="user" size="xs" />
            <span class="text-gray-800 dark:text-gray-200">{{ user.full_name }}</span>
            <CheckIcon v-if="modelValue === user.id" class="w-3.5 h-3.5 text-brand-500 ml-auto" />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ChevronDownIcon, CheckIcon } from '@heroicons/vue/24/outline'
import { onClickOutside } from '@vueuse/core'

const props = defineProps<{
  modelValue: number | null
  projectId?: number
}>()
const emit = defineEmits(['update:modelValue'])

const api = useApi()
const open = ref(false)
const search = ref('')
const users = ref<any[]>([])
const containerRef = ref(null)

onClickOutside(containerRef, () => open.value = false)

const filteredUsers = computed(() => {
  if (!search.value) return users.value
  const q = search.value.toLowerCase()
  return users.value.filter(u => u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
})

const selectedUser = computed(() => users.value.find(u => u.id === props.modelValue))

async function loadUsers() {
  if (props.projectId) {
    const data = await api.get(`/api/projects/${props.projectId}/members/`)
    users.value = (data || []).map((m: any) => m.user)
  } else {
    const data = await api.get('/api/auth/users/')
    users.value = data.results || data
  }
}

function select(user: any) {
  emit('update:modelValue', user?.id || null)
  open.value = false
  search.value = ''
}

onMounted(loadUsers)
</script>

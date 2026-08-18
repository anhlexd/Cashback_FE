<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')"></div>
      <div class="relative w-full max-w-md bg-white dark:bg-dark-100 rounded-2xl shadow-modal animate-scale-in p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="font-bold text-gray-900 dark:text-white">Tạo Sprint mới</h3>
          <button @click="$emit('close')" class="btn-ghost btn-icon"><XMarkIcon class="w-4 h-4" /></button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="label">Tên Sprint <span class="text-red-500">*</span></label>
            <input v-model="form.name" class="input" :placeholder="`Sprint ${nextNumber}`" autofocus />
          </div>
          <div>
            <label class="label">Mục tiêu Sprint</label>
            <textarea v-model="form.goal" class="input resize-none" rows="2" placeholder="Mục tiêu cần đạt được trong sprint này..."></textarea>
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
              Tạo Sprint
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{ projectId: number }>()
const emit = defineEmits(['close', 'created'])

const projectsStore = useProjectsStore()
const nextNumber = computed(() => projectsStore.currentSprints.length + 1)

const form = reactive({ name: `Sprint ${nextNumber.value}`, goal: '', start_date: '', end_date: '' })
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  loading.value = true; error.value = ''
  try {
    const payload: any = { project: props.projectId, name: form.name || `Sprint ${nextNumber.value}` }
    if (form.goal) payload.goal = form.goal
    if (form.start_date) payload.start_date = form.start_date
    if (form.end_date) payload.end_date = form.end_date
    const sprint = await projectsStore.createSprint(payload)
    emit('created', sprint)
  } catch (err: any) {
    error.value = err?.data?.detail || 'Tạo sprint thất bại'
  } finally { loading.value = false }
}
</script>

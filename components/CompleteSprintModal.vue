<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')"></div>
      <div class="relative w-full max-w-md bg-white dark:bg-dark-100 rounded-2xl shadow-modal animate-scale-in p-6">
        <h3 class="font-bold text-gray-900 dark:text-white mb-1">Hoàn thành Sprint</h3>
        <p class="text-sm text-gray-500 mb-4">Các issue chưa hoàn thành sẽ được chuyển đến:</p>

        <div class="space-y-3 mb-5">
          <label class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
                 :class="destination === 'backlog' ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/20' : 'border-surface-200 dark:border-dark-50 hover:border-gray-300'">
            <input type="radio" v-model="destination" value="backlog" class="text-brand-600" />
            <div>
              <div class="text-sm font-medium text-gray-900 dark:text-white">Backlog</div>
              <div class="text-xs text-gray-400">Chuyển về backlog chưa lên kế hoạch</div>
            </div>
          </label>
          <label
            v-for="sprint in planningSprints" :key="sprint.id"
            class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
            :class="destination === String(sprint.id) ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/20' : 'border-surface-200 dark:border-dark-50 hover:border-gray-300'"
          >
            <input type="radio" v-model="destination" :value="String(sprint.id)" class="text-brand-600" />
            <div>
              <div class="text-sm font-medium text-gray-900 dark:text-white">{{ sprint.name }}</div>
              <div class="text-xs text-gray-400">Sprint đang lên kế hoạch</div>
            </div>
          </label>
        </div>

        <div v-if="error" class="text-sm text-red-500 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-3">{{ error }}</div>

        <div class="flex justify-end gap-2">
          <button @click="$emit('close')" class="btn-secondary">Hủy</button>
          <button @click="handleComplete" :disabled="loading" class="btn-primary">
            <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Xác nhận hoàn thành
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ sprintId: number; planningSprints: any[] }>()
const emit = defineEmits(['close', 'completed'])
const projectsStore = useProjectsStore()
const destination = ref('backlog')
const loading = ref(false)
const error = ref('')

async function handleComplete() {
  loading.value = true; error.value = ''
  try {
    const payload: any = {}
    if (destination.value !== 'backlog') payload.move_incomplete_to = Number(destination.value)
    await projectsStore.completeSprint(props.sprintId, payload)
    emit('completed')
  } catch (err: any) {
    error.value = err?.data?.detail || 'Có lỗi xảy ra'
  } finally { loading.value = false }
}
</script>

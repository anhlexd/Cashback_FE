<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[60] flex items-start justify-center pt-20 px-4">
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>
      <div class="relative w-full max-w-xl bg-white dark:bg-dark-100 rounded-2xl shadow-modal overflow-hidden animate-scale-in">

        <!-- Search input -->
        <div class="flex items-center gap-3 px-4 py-3 border-b border-surface-200 dark:border-dark-50">
          <MagnifyingGlassIcon class="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            v-model="query"
            ref="inputRef"
            class="flex-1 text-sm bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
            placeholder="Tìm kiếm issues, projects..."
            autofocus
          />
          <button @click="$emit('close')" class="text-xs text-gray-400 hover:text-gray-600 bg-surface-100 dark:bg-dark-50 px-2 py-1 rounded border border-surface-200 dark:border-dark-50">
            ESC
          </button>
        </div>

        <!-- Results -->
        <div class="max-h-80 overflow-y-auto">
          <div v-if="loading" class="p-4 text-center text-sm text-gray-400">
            <div class="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <div v-else-if="query && results.length === 0" class="p-8 text-center text-sm text-gray-400">
            Không tìm thấy kết quả cho "{{ query }}"
          </div>
          <div v-else-if="!query" class="p-4 text-xs text-gray-400 text-center">
            Nhập để tìm kiếm issues và projects
          </div>
          <div v-else class="py-1">
            <div
              v-for="result in results"
              :key="`${result.type}-${result.id}`"
              @click="selectResult(result)"
              class="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-surface-50 dark:hover:bg-dark-50 transition-colors"
            >
              <IssueTypeIcon v-if="result.type === 'issue'" :type="result.issue_type" class="w-4 h-4 flex-shrink-0" />
              <RectangleGroupIcon v-else class="w-4 h-4 text-brand-500 flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="text-sm text-gray-900 dark:text-white truncate">{{ result.title || result.name }}</div>
                <div class="text-xs text-gray-400">{{ result.type === 'issue' ? result.issue_key : 'Project' }}</div>
              </div>
              <span v-if="result.type === 'issue'" :class="`status-${result.status}`" class="text-xs">
                {{ result.status?.replace('_', ' ') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { MagnifyingGlassIcon, RectangleGroupIcon } from '@heroicons/vue/24/outline'
import { useDebounceFn } from '@vueuse/core'

const emit = defineEmits(['close'])
const router = useRouter()
const api = useApi()
const projectsStore = useProjectsStore()

const query = ref('')
const results = ref<any[]>([])
const loading = ref(false)
const inputRef = ref<HTMLInputElement>()

const search = useDebounceFn(async () => {
  if (!query.value.trim()) { results.value = []; return }
  loading.value = true
  try {
    const [issues, projects] = await Promise.all([
      api.get('/api/issues/', { search: query.value }),
      api.get('/api/projects/', { search: query.value }),
    ])
    const issueList = (issues.results || issues).slice(0, 5).map((i: any) => ({ ...i, type: 'issue' }))
    const projectList = (projects.results || projects).slice(0, 3).map((p: any) => ({ ...p, type: 'project' }))
    results.value = [...projectList, ...issueList]
  } finally { loading.value = false }
}, 300)

watch(query, search)

function selectResult(result: any) {
  if (result.type === 'project') router.push(`/projects/${result.id}`)
  else router.push(`/issues/${result.id}`)
  emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') emit('close')
  })
})
</script>

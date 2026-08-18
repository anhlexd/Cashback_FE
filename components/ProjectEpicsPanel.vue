<template>
  <div class="space-y-6">
    <!-- Tiến độ dự án (từ epic) -->
    <div class="card p-5">
      <div class="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h3 class="font-semibold text-sm text-gray-900 dark:text-white">Tiến độ dự án (từ Epic)</h3>
          <p class="text-xs text-gray-500 mt-0.5">
            {{ progressSource === 'epics'
              ? 'Trung bình có trọng số theo số story/task trong từng epic'
              : 'Chưa có epic — tính từ story/task chưa gắn epic' }}
          </p>
        </div>
        <span class="text-2xl font-bold text-brand-600 dark:text-brand-400">{{ projectCompletionPct }}%</span>
      </div>
      <div class="w-full h-3 bg-surface-200 dark:bg-dark-50 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-700"
          :style="{ width: projectCompletionPct + '%' }"
        />
      </div>
      <div class="flex gap-4 mt-3 text-xs text-gray-500">
        <span>{{ epicCount }} epic</span>
        <button type="button" class="text-brand-600 hover:underline" @click="loadEpics">Làm mới</button>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <input
        v-model="search"
        type="search"
        class="input max-w-xs"
        placeholder="Tìm epic..."
        @keyup.enter="loadEpics"
      />
      <button v-if="canCreateIssue" type="button" class="btn-primary btn-sm ml-auto" @click="$emit('create-epic')">
        <PlusIcon class="w-3.5 h-3.5" /> Tạo Epic
      </button>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-24 card animate-pulse" />
    </div>

    <div v-else-if="filteredEpics.length === 0" class="card p-10 text-center text-sm text-gray-400">
      Chưa có epic nào. Tạo epic để nhóm story/task và theo dõi tiến độ theo mảng công việc.
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="bundle in filteredEpics"
        :key="bundle.epic.id"
        class="card overflow-hidden"
      >
        <button
          type="button"
          class="w-full text-left p-4 hover:bg-surface-50 dark:hover:bg-dark-50/50 transition-colors"
          @click="toggleExpand(bundle.epic.id)"
        >
          <div class="flex items-start gap-3">
            <IssueTypeIcon type="epic" class="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-mono text-brand-600 dark:text-brand-400">{{ bundle.epic.issue_key }}</span>
                <span
                  class="badge text-xs"
                  :class="statusClass(bundle.epic.status)"
                >{{ bundle.epic.status }}</span>
              </div>
              <div class="font-semibold text-gray-900 dark:text-white mt-0.5 truncate">{{ bundle.epic.title }}</div>
              <div class="text-xs text-gray-500 mt-1">
                {{ bundle.progress.child_done_count }}/{{ bundle.progress.child_count }} issue done
                · {{ bundle.progress.done_story_points }}/{{ bundle.progress.total_story_points }} SP
              </div>
            </div>
            <div class="text-right flex-shrink-0">
              <div class="text-lg font-bold text-brand-600 dark:text-brand-400">{{ bundle.progress.completion_pct }}%</div>
              <ChevronDownIcon
                class="w-4 h-4 text-gray-400 mx-auto mt-1 transition-transform"
                :class="expandedId === bundle.epic.id && 'rotate-180'"
              />
            </div>
          </div>
          <div class="w-full h-1.5 bg-surface-200 dark:bg-dark-50 rounded-full overflow-hidden mt-3">
            <div
              class="h-full bg-purple-500 rounded-full transition-all"
              :style="{ width: bundle.progress.completion_pct + '%' }"
            />
          </div>
        </button>

        <div
          v-if="expandedId === bundle.epic.id"
          class="border-t border-surface-200 dark:border-dark-50 bg-surface-50/50 dark:bg-dark-50/30"
        >
          <div class="px-4 py-2 flex gap-3 text-xs text-gray-500 border-b border-surface-100 dark:border-dark-50">
            <span>To Do: {{ bundle.progress.child_todo_count }}</span>
            <span>Đang làm: {{ bundle.progress.child_in_progress_count }}</span>
            <span class="text-green-600">Done: {{ bundle.progress.child_done_count }}</span>
          </div>
          <div v-if="bundle.children.length === 0" class="p-4 text-xs text-gray-400">
            Chưa có story/task trong epic.
            <button
              v-if="canCreateIssue"
              type="button"
              class="text-brand-600 hover:underline ml-1"
              @click="$emit('create-child', { parentId: bundle.epic.id, parentType: 'epic', suggestType: 'story' })"
            >Tạo Story / Task ngay</button>
          </div>
          <div v-else class="divide-y divide-surface-100 dark:divide-dark-50">
            <div v-for="child in bundle.children" :key="child.id">
              <!-- Dòng story/task trực thuộc epic -->
              <div class="px-4 py-2.5 hover:bg-white dark:hover:bg-dark-100 flex items-center gap-2">
                <button
                  v-if="child.issue_type === 'story'"
                  type="button"
                  class="p-0.5 text-gray-400 hover:text-brand-500 flex-shrink-0"
                  :title="(child.child_count || 0) + ' task'"
                  @click.stop="toggleStory(child)"
                >
                  <ChevronRightIcon class="w-3.5 h-3.5 transition-transform" :class="{ 'rotate-90': storyExpanded.has(child.id) }" />
                </button>
                <span v-else class="w-4 flex-shrink-0"></span>
                <IssueTypeIcon :type="child.issue_type" class="w-3.5 h-3.5 flex-shrink-0" />
                <button type="button" class="text-left flex-1 min-w-0 flex items-center gap-2" @click="$emit('open-issue', child.id)">
                  <span class="text-xs font-mono text-gray-400 flex-shrink-0">{{ child.issue_key }}</span>
                  <span class="text-sm text-gray-800 dark:text-gray-200 truncate">{{ child.title }}</span>
                </button>
                <span
                  v-if="child.issue_type === 'story'"
                  class="badge text-[10px] bg-surface-100 dark:bg-dark-100 text-gray-500 flex-shrink-0"
                >{{ child.child_count || 0 }} task</span>
                <span class="badge text-xs capitalize flex-shrink-0">{{ child.status }}</span>
              </div>

              <!-- Task con của story (lazy-load khi mở rộng) -->
              <div
                v-if="child.issue_type === 'story' && storyExpanded.has(child.id)"
                class="pl-9 pr-4 pb-2 bg-white/40 dark:bg-dark-100/20"
              >
                <div v-if="storyLoading.has(child.id)" class="py-2 text-xs text-gray-400">Đang tải task…</div>
                <template v-else>
                  <button
                    v-for="t in (storyTasks[child.id] || [])"
                    :key="t.id"
                    type="button"
                    class="w-full text-left py-1.5 flex items-center gap-2 hover:bg-surface-50 dark:hover:bg-dark-50 rounded px-1"
                    @click="$emit('open-issue', t.id)"
                  >
                    <IssueTypeIcon :type="t.issue_type" class="w-3 h-3 flex-shrink-0" />
                    <span class="text-[11px] font-mono text-gray-400 flex-shrink-0">{{ t.issue_key }}</span>
                    <span class="text-xs text-gray-700 dark:text-gray-300 truncate flex-1">{{ t.title }}</span>
                    <span class="badge text-[10px] capitalize flex-shrink-0">{{ t.status }}</span>
                  </button>
                  <p v-if="!(storyTasks[child.id] || []).length" class="py-1.5 text-xs text-gray-400">Chưa có task nào trong story.</p>
                  <button
                    v-if="canCreateIssue"
                    type="button"
                    class="mt-1 text-xs text-brand-600 hover:underline"
                    @click="$emit('create-child', { parentId: child.id, parentType: 'story', suggestType: 'task' })"
                  >+ Tạo Task trong story</button>
                </template>
              </div>
            </div>
          </div>
          <div class="px-4 py-2 border-t border-surface-100 dark:border-dark-50 flex items-center gap-3">
            <button
              v-if="canCreateIssue"
              type="button"
              class="text-xs text-brand-600 hover:underline"
              @click="$emit('create-child', { parentId: bundle.epic.id, parentType: 'epic', suggestType: 'story' })"
            >+ Tạo Story / Task</button>
            <button
              type="button"
              class="text-xs text-gray-500 hover:underline ml-auto"
              @click="$emit('open-issue', bundle.epic.id)"
            >
              Mở chi tiết epic →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  projectId: number
  canCreateIssue?: boolean
}>()

const emit = defineEmits<{
  'create-epic': []
  'open-issue': [id: number]
  'create-child': [payload: { parentId: number; parentType: string; suggestType: string }]
}>()

const api = useApi()
const loading = ref(true)
const search = ref('')
const epicBundles = ref<any[]>([])
const projectCompletionPct = ref(0)
const progressSource = ref('epics')
const epicCount = ref(0)
const expandedId = ref<number | null>(null)

// Mở rộng story → lazy-load task con
const storyExpanded = ref(new Set<number>())
const storyLoading = ref(new Set<number>())
const storyTasks = reactive<Record<number, any[]>>({})

async function toggleStory(child: any) {
  const id = child.id
  if (storyExpanded.value.has(id)) {
    const s = new Set(storyExpanded.value); s.delete(id); storyExpanded.value = s
    return
  }
  storyExpanded.value = new Set(storyExpanded.value).add(id)
  if (storyTasks[id]) return  // đã tải
  storyLoading.value = new Set(storyLoading.value).add(id)
  try {
    const data = await api.get('/api/issues/', { parent: id, page_size: 200, ordering: 'position' })
    storyTasks[id] = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : [])
  } catch {
    storyTasks[id] = []
  } finally {
    const s = new Set(storyLoading.value); s.delete(id); storyLoading.value = s
  }
}

const filteredEpics = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return epicBundles.value
  return epicBundles.value.filter((b: any) =>
    b.epic.title?.toLowerCase().includes(q)
    || b.epic.issue_key?.toLowerCase().includes(q),
  )
})

function statusClass(status: string) {
  const map: Record<string, string> = {
    todo: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-100 text-blue-700',
    done: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-400',
  }
  return map[status] || map.todo
}

function toggleExpand(id: number) {
  expandedId.value = expandedId.value === id ? null : id
}

async function loadEpics() {
  loading.value = true
  try {
    const data = await api.get(`/api/projects/${props.projectId}/epics/`)
    epicBundles.value = data.epics || []
    projectCompletionPct.value = data.project_completion_pct ?? 0
    progressSource.value = data.progress_source || 'epics'
    epicCount.value = data.epic_count ?? epicBundles.value.length
  } catch {
    epicBundles.value = []
  } finally {
    loading.value = false
  }
}

defineExpose({ loadEpics })

onMounted(() => loadEpics())
</script>

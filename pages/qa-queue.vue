<template>
  <div class="p-6 max-w-5xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BeakerIcon class="w-7 h-7 text-purple-500" />
          Hàng đợi kiểm tra (QA Queue)
        </h1>
        <p class="text-sm text-gray-500 mt-0.5">Issues đang chờ tester kiểm tra</p>
      </div>
      <div class="flex items-center gap-2">
        <select v-model="selectedProject" class="input py-1.5 text-sm w-44" @change="loadQueue">
          <option value="">Tất cả projects</option>
          <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <button @click="loadQueue" class="btn-secondary btn-sm">
          <ArrowPathIcon class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4">
      <div
        @click="activeTab = 'in_review'"
        class="card p-4 text-center border-l-4 border-yellow-400 cursor-pointer transition-all"
        :class="activeTab === 'in_review' ? 'ring-2 ring-yellow-400' : 'hover:shadow-md'"
      >
        <div class="text-3xl font-black text-yellow-600 dark:text-yellow-400">{{ queue.in_review || 0 }}</div>
        <div class="text-xs text-gray-500 mt-1">⏳ Chờ kiểm tra</div>
      </div>
      <div
        @click="activeTab = 'testing'"
        class="card p-4 text-center border-l-4 border-purple-500 cursor-pointer transition-all"
        :class="activeTab === 'testing' ? 'ring-2 ring-purple-500' : 'hover:shadow-md'"
      >
        <div class="text-3xl font-black text-purple-600 dark:text-purple-400">{{ queue.testing || 0 }}</div>
        <div class="text-xs text-gray-500 mt-1">🧪 Đang kiểm tra</div>
      </div>
      <div
        @click="activeTab = 'bug_fixing'"
        class="card p-4 text-center border-l-4 border-red-500 cursor-pointer transition-all"
        :class="activeTab === 'bug_fixing' ? 'ring-2 ring-red-500' : 'hover:shadow-md'"
      >
        <div class="text-3xl font-black text-red-600 dark:text-red-400">{{ queue.bug_fixing || 0 }}</div>
        <div class="text-xs text-gray-500 mt-1">🐛 Dev đang sửa lỗi</div>
      </div>
    </div>

    <!-- Issues waiting -->
    <div class="card overflow-hidden">
      <div v-if="activeTab === 'in_review'" class="card overflow-hidden">
        <div class="flex items-center gap-3 px-5 py-3.5 border-b border-surface-200 dark:border-dark-50 bg-yellow-50 dark:bg-yellow-900/10">
          <ExclamationTriangleIcon class="w-4 h-4 text-yellow-600" />
          <h2 class="font-semibold text-sm text-yellow-800 dark:text-yellow-300">
            Chờ kiểm tra ({{ queueIssues.length }})
          </h2>
        </div>

        <div v-if="loading" class="divide-y divide-surface-100 dark:divide-dark-50">
          <div v-for="i in 4" :key="i" class="h-16 flex items-center px-5 gap-3">
            <div class="w-8 h-8 rounded bg-surface-200 dark:bg-dark-50 animate-pulse"></div>
            <div class="flex-1 space-y-2">
              <div class="h-3 w-2/3 bg-surface-100 dark:bg-dark-50 rounded animate-pulse"></div>
              <div class="h-3 w-1/3 bg-surface-100 dark:bg-dark-50 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        <div v-else-if="queueIssues.length === 0" class="p-10 text-center text-sm text-gray-400">
          <CheckCircleIcon class="w-10 h-10 mx-auto text-green-400 mb-2" />
          Không có issue nào đang chờ kiểm tra! 🎉
        </div>

        <div v-else class="divide-y divide-surface-100 dark:divide-dark-50">
          <div
            v-for="issue in queueIssues"
            :key="issue.id"
            class="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-50 dark:hover:bg-dark-50/50 transition-colors group"
          >
            <IssueTypeIcon :type="issue.issue_type" class="w-4 h-4 flex-shrink-0" />

            <div class="flex-1 min-w-0">
              <button
                @click="selectedIssueId = issue.id"
                class="text-sm font-medium text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 truncate block text-left"
              >
                {{ issue.title }}
              </button>
              <div class="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                <span class="font-mono">{{ issue.issue_key }}</span>
                <span v-if="issue.assignee">👨‍💻 {{ issue.assignee.full_name }}</span>
                <span v-if="issue.github_commit_sha" class="font-mono text-brand-500">
                  {{ issue.github_commit_sha.slice(0, 8) }}
                </span>
                <span v-if="issue.dev_completed_at" class="text-yellow-600">
                  ⏱ Chờ {{ waitingTime(issue.dev_completed_at) }}
                </span>
              </div>
            </div>

            <IssuePriorityIcon :priority="issue.priority" class="w-4 h-4 flex-shrink-0" />

            <button
              @click="startTesting(issue)"
              :disabled="startingId === issue.id"
              class="flex-shrink-0 btn bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-all gap-1.5"
            >
              <PlayIcon class="w-3.5 h-3.5" />
              {{ startingId === issue.id ? '...' : 'Test ngay' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Tab: Đang kiểm tra (testing) -->
      <div v-else-if="activeTab === 'testing'" class="card overflow-hidden">
        <div class="flex items-center gap-3 px-5 py-3.5 border-b border-surface-200 dark:border-dark-50 bg-purple-50 dark:bg-purple-900/10">
          <BeakerIcon class="w-4 h-4 text-purple-600" />
          <h2 class="font-semibold text-sm text-purple-800 dark:text-purple-300">
            Đang kiểm tra ({{ testingIssues.length }})
          </h2>
        </div>

        <div v-if="loading" class="divide-y divide-surface-100 dark:divide-dark-50">
          <div v-for="i in 4" :key="i" class="h-16 flex items-center px-5 gap-3">
            <div class="w-8 h-8 rounded bg-surface-200 dark:bg-dark-50 animate-pulse"></div>
            <div class="flex-1 space-y-2">
              <div class="h-3 w-2/3 bg-surface-100 dark:bg-dark-50 rounded animate-pulse"></div>
              <div class="h-3 w-1/3 bg-surface-100 dark:bg-dark-50 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        <div v-else-if="testingIssues.length === 0" class="p-10 text-center text-sm text-gray-400">
          <BeakerIcon class="w-10 h-10 mx-auto text-purple-300 mb-2" />
          Không có issue nào đang được kiểm tra.
        </div>

        <div v-else class="divide-y divide-surface-100 dark:divide-dark-50">
          <div
            v-for="issue in testingIssues"
            :key="issue.id"
            @click="selectedIssueId = issue.id"
            class="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-50 dark:hover:bg-dark-50/50 transition-colors cursor-pointer"
          >
            <IssueTypeIcon :type="issue.issue_type" class="w-4 h-4 flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ issue.title }}</div>
              <div class="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                <span class="font-mono">{{ issue.issue_key }}</span>
                <span v-if="issue.assignee">👨‍💻 {{ issue.assignee.full_name }}</span>
                <span v-if="issue.tester" class="text-purple-500">🧪 {{ issue.tester.full_name }}</span>
              </div>
            </div>
            <IssuePriorityIcon :priority="issue.priority" class="w-4 h-4 flex-shrink-0" />
          </div>
        </div>
      </div>

      <!-- Tab: Dev đang sửa lỗi (bug_fixing) -->
      <div v-else-if="activeTab === 'bug_fixing'" class="card overflow-hidden">
        <div class="flex items-center gap-3 px-5 py-3.5 border-b border-surface-200 dark:border-dark-50 bg-red-50 dark:bg-red-900/10">
          <ExclamationTriangleIcon class="w-4 h-4 text-red-600" />
          <h2 class="font-semibold text-sm text-red-800 dark:text-red-300">
            Dev đang sửa lỗi ({{ bugFixingIssues.length }})
          </h2>
        </div>

        <div v-if="loading" class="divide-y divide-surface-100 dark:divide-dark-50">
          <div v-for="i in 4" :key="i" class="h-16 flex items-center px-5 gap-3">
            <div class="w-8 h-8 rounded bg-surface-200 dark:bg-dark-50 animate-pulse"></div>
            <div class="flex-1 space-y-2">
              <div class="h-3 w-2/3 bg-surface-100 dark:bg-dark-50 rounded animate-pulse"></div>
              <div class="h-3 w-1/3 bg-surface-100 dark:bg-dark-50 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        <div v-else-if="bugFixingIssues.length === 0" class="p-10 text-center text-sm text-gray-400">
          <CheckCircleIcon class="w-10 h-10 mx-auto text-green-400 mb-2" />
          Không có issue nào đang được sửa lỗi! 🎉
        </div>

        <div v-else class="divide-y divide-surface-100 dark:divide-dark-50">
          <div
            v-for="issue in bugFixingIssues"
            :key="issue.id"
            @click="selectedIssueId = issue.id"
            class="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-50 dark:hover:bg-dark-50/50 transition-colors cursor-pointer"
          >
            <IssueTypeIcon :type="issue.issue_type" class="w-4 h-4 flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ issue.title }}</div>
              <div class="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                <span class="font-mono">{{ issue.issue_key }}</span>
                <span v-if="issue.assignee" class="text-red-500">🐛 {{ issue.assignee.full_name }}</span>
                <span v-if="issue.dev_completed_at" class="text-gray-400">
                  Sửa từ {{ waitingTime(issue.dev_completed_at) }} trước
                </span>
              </div>
            </div>
            <IssuePriorityIcon :priority="issue.priority" class="w-4 h-4 flex-shrink-0" />
          </div>
        </div>
      </div>


    </div>


    <!-- Issue modal -->
    <IssueModal
      v-if="selectedIssueId"
      :issue-id="selectedIssueId"
      @close="selectedIssueId = null; loadQueue()"
      @updated="loadQueue"
    />
  </div>
</template>

<script setup lang="ts">
import {
  BeakerIcon, ArrowPathIcon, ExclamationTriangleIcon,
  CheckCircleIcon, PlayIcon
} from '@heroicons/vue/24/outline'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

definePageMeta({ middleware: 'auth' })

const api = useApi()
const projectsStore = useProjectsStore()
const toast = useToast()

const selectedProject = ref('')
const selectedIssueId = ref<number | null>(null)
const loading = ref(true)
const startingId = ref<number | null>(null)
const queueIssues = ref<any[]>([])
const testingIssues = ref<any[]>([])
const bugFixingIssues = ref<any[]>([])
const activeTab = ref<'in_review' | 'testing' | 'bug_fixing'>('in_review')
const queue = ref({ in_review: 0, testing: 0, bug_fixing: 0 })

const projects = computed(() => projectsStore.projects)

async function loadQueue() {
  loading.value = true
  try {
    const params: any = {}
    if (selectedProject.value) params.project = selectedProject.value

    const [reviewData, testingData, bugFixingData] = await Promise.all([
      api.get('/api/issues/', { ...params, status: 'in_review', ordering: 'dev_completed_at' }),
      api.get('/api/issues/', { ...params, status: 'testing' }),
      api.get('/api/issues/', { ...params, status: 'bug_fixing' }),
    ])

    queueIssues.value = reviewData.results || reviewData
    testingIssues.value = testingData.results || testingData       
    bugFixingIssues.value = bugFixingData.results || bugFixingData

    queue.value = {
      in_review: (reviewData.results || reviewData).length,
      testing: (testingData.results || testingData).length,
      bug_fixing: (bugFixingData.results || bugFixingData).length,
    }
  } finally { loading.value = false }
}

async function startTesting(issue: any) {
  startingId.value = issue.id
  try {
    await api.post(`/api/issues/${issue.id}/start_testing/`)
    selectedIssueId.value = issue.id
    toast.success('🧪 Đã bắt đầu test session!')
    await loadQueue()
  } catch (e: any) {
    toast.error(e?.data?.detail || 'Không thể bắt đầu test')
  } finally { startingId.value = null }
}

function waitingTime(dt: string) {
  return formatDistanceToNow(new Date(dt), { locale: vi, addSuffix: false })
}

onMounted(async () => {
  await projectsStore.fetchProjects()
  await loadQueue()
  // Auto-refresh every 30s
  const t = setInterval(loadQueue, 30000)
  onUnmounted(() => clearInterval(t))
})
</script>

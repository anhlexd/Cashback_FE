<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <div class="flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
          <ShieldCheckIcon class="w-4 h-4" /> Tổng quan Admin
        </div>
        <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mt-0.5">
          Trạng thái toàn bộ dự án &amp; nhân sự
        </h2>
      </div>
      <button @click="refresh" :disabled="loading" class="btn-secondary btn-sm">
        <ArrowPathIcon class="w-3.5 h-3.5" :class="loading ? 'animate-spin' : ''" />
        Làm mới
      </button>
    </div>

    <!-- KPI cards -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <div class="card p-4">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
            <RectangleGroupIcon class="w-4 h-4 text-brand-600 dark:text-brand-300" />
          </div>
          <div>
            <div class="text-[10px] text-gray-400 uppercase tracking-wider">Tổng dự án</div>
            <div class="text-lg font-bold">{{ totals.projects }}</div>
          </div>
        </div>
      </div>
      <div class="card p-4">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <BoltIcon class="w-4 h-4 text-green-600 dark:text-green-300" />
          </div>
          <div>
            <div class="text-[10px] text-gray-400 uppercase tracking-wider">Đang hoạt động</div>
            <div class="text-lg font-bold">{{ totals.activeProjects }}</div>
          </div>
        </div>
      </div>
      <div class="card p-4 border-l-2 border-l-red-500">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <ExclamationTriangleIcon class="w-4 h-4 text-red-600 dark:text-red-300" />
          </div>
          <div>
            <div class="text-[10px] text-gray-400 uppercase tracking-wider">Bị chậm deadline</div>
            <div class="text-lg font-bold text-red-600 dark:text-red-400">{{ overdueProjects.length }}</div>
          </div>
        </div>
      </div>
      <div class="card p-4">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <UsersIcon class="w-4 h-4 text-purple-600 dark:text-purple-300" />
          </div>
          <div>
            <div class="text-[10px] text-gray-400 uppercase tracking-wider">Tổng nhân sự</div>
            <div class="text-lg font-bold">{{ totals.users }}</div>
          </div>
        </div>
      </div>
      <div class="card p-4">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <ClipboardDocumentListIcon class="w-4 h-4 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <div class="text-[10px] text-gray-400 uppercase tracking-wider">Tổng issue</div>
            <div class="text-lg font-bold">{{ totals.issues }}</div>
            <div class="text-[10px] text-red-500 mt-0.5">{{ totals.overdueIssues }} quá hạn</div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid lg:grid-cols-5 gap-5">
      <!-- Projects behind deadline -->
      <div class="lg:col-span-3 card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
            <ExclamationTriangleIcon class="w-4 h-4 text-red-500" />
            Dự án bị chậm deadline
          </h3>
          <span class="badge bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs">
            {{ overdueProjects.length }}
          </span>
        </div>

        <div v-if="loading" class="space-y-2">
          <div v-for="i in 4" :key="i" class="h-14 bg-surface-100 dark:bg-dark-50 rounded-lg animate-pulse"></div>
        </div>
        <div v-else-if="!overdueProjects.length" class="text-center py-8 text-sm text-gray-400">
          🎉 Không có dự án nào bị chậm deadline
        </div>
        <div v-else class="space-y-2">
          <button
            v-for="proj in overdueProjects.slice(0, 8)"
            :key="proj.id"
            type="button"
            @click="openProjectOverdue(proj)"
            class="w-full text-left flex items-center gap-3 p-3 rounded-lg border border-red-100 dark:border-red-900/30 bg-red-50/40 dark:bg-red-950/10 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors group"
          >
            <div class="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
              :style="{ backgroundColor: projColor(proj.key) + '20', color: projColor(proj.key) }">
              {{ proj.key }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {{ proj.name }}
                </span>
                <span class="badge text-[10px]" :class="proj.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'">
                  {{ proj.status }}
                </span>
              </div>
              <div class="text-xs text-gray-500 mt-0.5 flex items-center gap-3 flex-wrap">
                <span v-if="proj.end_date" class="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                  <ClockIcon class="w-3 h-3" />
                  Quá {{ daysOverdue(proj.end_date) }} ngày
                </span>
                <span v-if="proj.overdue_issue_count" class="text-orange-500 font-medium">
                  {{ proj.overdue_issue_count }} issue quá hạn
                </span>
                <span class="text-gray-400">{{ proj.member_count || 0 }} thành viên</span>
                <span class="text-[10px] text-brand-500 ml-auto font-semibold">Xem chi tiết →</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Top members -->
      <div class="lg:col-span-2 space-y-5">
        <!-- Top members behind deadline -->
        <div class="card p-5">
          <h3 class="font-semibold text-gray-900 dark:text-white text-sm mb-3 flex items-center gap-2">
            <span class="text-base">🐢</span> Top nhân sự đang chậm
          </h3>
          <div v-if="loading" class="space-y-2">
            <div v-for="i in 5" :key="i" class="h-10 bg-surface-100 dark:bg-dark-50 rounded animate-pulse"></div>
          </div>
          <div v-else-if="!laggingMembers.length" class="text-center py-4 text-xs text-gray-400">
            Không có nhân sự nào đang chậm 👏
          </div>
          <div v-else class="space-y-1">
            <button
              v-for="(m, i) in laggingMembers.slice(0, 5)"
              :key="m.id"
              type="button"
              @click="openMemberOverdue(m)"
              class="w-full text-left flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group"
            >
              <div class="text-xs font-bold w-5 text-gray-400 text-center flex-shrink-0">{{ i + 1 }}</div>
              <UserAvatar :user="m.user" size="sm" />
              <div class="flex-1 min-w-0">
                <div class="text-xs font-medium text-gray-900 dark:text-white truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {{ m.user?.full_name }}
                </div>
                <div class="text-[10px] text-gray-500 truncate">{{ m.user?.email }}</div>
              </div>
              <div class="flex flex-col items-end flex-shrink-0">
                <span class="badge bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px]">
                  {{ m.overdue }} quá hạn
                </span>
                <span class="text-[10px] text-gray-400 mt-0.5">{{ m.total }} tổng</span>
              </div>
              <ChevronRightIcon class="w-3.5 h-3.5 text-gray-300 group-hover:text-red-500 flex-shrink-0 transition-colors" />
            </button>
          </div>
        </div>

        <!-- Top performers -->
        <div class="card p-5">
          <h3 class="font-semibold text-gray-900 dark:text-white text-sm mb-3 flex items-center gap-2">
            <span class="text-base">🚀</span> Top nhân sự hoàn thành
          </h3>
          <p class="text-[10px] text-gray-400 mb-3">Trong 30 ngày qua</p>
          <div v-if="loading" class="space-y-2">
            <div v-for="i in 5" :key="i" class="h-10 bg-surface-100 dark:bg-dark-50 rounded animate-pulse"></div>
          </div>
          <div v-else-if="!topPerformers.length" class="text-center py-4 text-xs text-gray-400">
            Chưa có dữ liệu hoàn thành
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="(m, i) in topPerformers.slice(0, 5)"
              :key="m.id"
              class="flex items-center gap-2.5"
            >
              <div class="text-xs font-bold w-5 text-center flex-shrink-0" :class="rankColor(i)">
                {{ ['🥇', '🥈', '🥉'][i] || (i + 1) }}
              </div>
              <UserAvatar :user="m.user" size="sm" />
              <div class="flex-1 min-w-0">
                <div class="text-xs font-medium text-gray-900 dark:text-white truncate">{{ m.user?.full_name }}</div>
                <div class="text-[10px] text-gray-500">{{ m.user?.email }}</div>
              </div>
              <div class="flex flex-col items-end flex-shrink-0">
                <span class="badge bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px]">
                  ✓ {{ m.done }}
                </span>
                <span class="text-[10px] text-gray-400 mt-0.5">{{ m.points || 0 }} SP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Overdue detail drawer -->
    <OverdueIssuesDrawer
      v-if="drawerOpen"
      :issues="allIssues"
      :projects="projects"
      :title="drawerTitle"
      :filter-by-project="drawerProjectId"
      :filter-by-assignee="drawerAssigneeId"
      @close="closeDrawer"
    />
  </div>
</template>

<script setup lang="ts">
import {
  ShieldCheckIcon, ArrowPathIcon, ChevronRightIcon, ClockIcon,
  RectangleGroupIcon, BoltIcon, ExclamationTriangleIcon, UsersIcon, ClipboardDocumentListIcon,
} from '@heroicons/vue/24/outline'
import { colorFromKey } from '~/utils/brandColors'
import { normalizeApiList } from '~/utils/apiList'

const api = useApi()
const projectsStore = useProjectsStore()
const loading = ref(true)

// Dữ liệu tính sẵn ở server (1 endpoint aggregate) — thay 3 fetch nặng
const totals = ref({ projects: 0, activeProjects: 0, users: 0, issues: 0, overdueIssues: 0 })
const overdueProjects = ref<any[]>([])
const laggingMembers = ref<any[]>([])
const topPerformers = ref<any[]>([])

const projects = ref<any[]>([])     // danh sách project (cho drawer tra tên)
const allIssues = ref<any[]>([])    // lazy: chỉ tải khi mở drawer

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function daysOverdue(endDate: string) {
  const today = startOfToday()
  const end = new Date(endDate)
  return Math.floor((today.getTime() - end.getTime()) / (24 * 60 * 60 * 1000))
}

function projColor(key: string) {
  return colorFromKey(key)
}

function rankColor(i: number) {
  if (i === 0) return 'text-yellow-500'
  if (i === 1) return 'text-gray-400'
  if (i === 2) return 'text-orange-500'
  return 'text-gray-400'
}

async function loadAll() {
  loading.value = true
  try {
    const [data] = await Promise.all([
      api.get<any>('/api/projects/admin-overview/'),
      projectsStore.fetchProjects().catch(() => {}),
    ])
    totals.value = data?.totals || totals.value
    overdueProjects.value = data?.overdueProjects || []
    laggingMembers.value = data?.laggingMembers || []
    topPerformers.value = data?.topPerformers || []
    projects.value = projectsStore.projects
  } finally {
    loading.value = false
  }
}

async function refresh() {
  await projectsStore.fetchProjects({ force: true }).catch(() => {})
  await loadAll()
}

// ===== Overdue drawer state (lazy-load issues khi mở) =====
const drawerOpen = ref(false)
const drawerTitle = ref('')
const drawerProjectId = ref<number | undefined>(undefined)
const drawerAssigneeId = ref<number | undefined>(undefined)
const drawerLoading = ref(false)

async function ensureIssues(params: Record<string, any>) {
  drawerLoading.value = true
  try {
    const data = await api.get('/api/issues/', { ...params, page_size: 300, ordering: 'due_date' })
    allIssues.value = normalizeApiList(data)
  } finally {
    drawerLoading.value = false
  }
}

async function openProjectOverdue(proj: any) {
  drawerTitle.value = `${proj.name}`
  drawerProjectId.value = proj.id
  drawerAssigneeId.value = undefined
  await ensureIssues({ project: proj.id })
  drawerOpen.value = true
}

async function openMemberOverdue(m: any) {
  drawerTitle.value = m.user?.full_name || `User #${m.id}`
  drawerProjectId.value = undefined
  drawerAssigneeId.value = m.id
  await ensureIssues({ assignee: m.id })
  drawerOpen.value = true
}

function closeDrawer() {
  drawerOpen.value = false
  drawerProjectId.value = undefined
  drawerAssigneeId.value = undefined
}

onMounted(loadAll)
</script>

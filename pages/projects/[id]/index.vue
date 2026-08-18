<template>
  <div class="flex flex-col h-full">
    <!-- Project header -->
    <div class="flex-shrink-0 bg-white dark:bg-dark-100 border-b border-surface-200 dark:border-dark-50">
      <div class="max-w-7xl mx-auto px-6 pt-5 pb-0">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <NuxtLink to="/projects" class="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Projects</NuxtLink>
          <span>/</span>
          <span class="text-gray-600 dark:text-gray-300">{{ project?.name }}</span>
        </nav>

        <!-- Project info -->
        <div class="flex flex-wrap items-start gap-3 sm:gap-4 mb-4">
          <div
            class="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold shadow-md ring-2 ring-white transition-transform dark:ring-dark-100 sm:text-base"
            :style="project ? {
              backgroundColor: projectColor + '22',
              color: projectColor,
              boxShadow: `0 6px 16px -4px ${projectColor}55`,
            } : {}"
          >
            {{ project?.key }}
          </div>
          <div class="flex-1 min-w-[180px]">
            <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{{ project?.name }}</h1>
              <span v-if="project" :class="statusBadgeClass(project.status)" class="badge text-xs">
                {{ statusLabel(project.status) }}
              </span>
            </div>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{{ project?.description || 'Không có mô tả' }}</p>
          </div>
          <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap flex-shrink-0 mt-2 sm:mt-0">
            <ProjectRoleBadge v-if="role" :role="role" size="md" />
            <NuxtLink :to="`/board/${projectId}`" class="btn-primary btn-sm">
              <RectangleGroupIcon class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">Board</span>
            </NuxtLink>
            <NuxtLink :to="`/backlog/${projectId}`" class="btn-secondary btn-sm">
              <ListBulletIcon class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">Backlog</span>
            </NuxtLink>
            <NuxtLink :to="`/gantt/${projectId}`" class="btn-secondary btn-sm">
              <ChartBarIcon class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">Gantt</span>
            </NuxtLink>
            <NuxtLink
              :to="`/projects/${projectId}/implementor-note`"
              class="btn-secondary btn-sm ring-1 ring-brand-200 dark:ring-brand-800"
              title="Tài liệu Implementor — trang riêng"
            >
              <DocumentTextIcon class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">Tài liệu dự án</span>
            </NuxtLink>
            <button v-if="canEditSettings" @click="showSettings = true" class="btn-ghost btn-icon" title="Cài đặt">
              <Cog6ToothIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex items-center gap-1 -mb-px overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            @click="goToTab(tab.key)"
            class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
            :class="activeTab === tab.key
              ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'"
          >
            {{ tab.label }}
            <span v-if="tab.count !== undefined" class="ml-1.5 text-xs bg-surface-200 dark:bg-dark-50 text-gray-500 px-1.5 py-0.5 rounded-full">
              {{ tab.count }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Tab content -->
    <div class="flex-1 overflow-y-auto" data-tab-content>
      <div class="max-w-7xl mx-auto px-6 py-6">

        <!-- Overview tab -->
        <div v-if="activeTab === 'overview'" class="space-y-6">
          <!-- Stats row -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Tiến độ dự án" :value="stats.project_completion_pct ?? 0" icon="ChartBarIcon" color="purple" :loading="statsLoading" />
            <StatCard label="Epic" :value="stats.epic_count ?? 0" icon="ClipboardDocumentListIcon" color="purple" :loading="statsLoading" />
            <StatCard label="Hoàn thành" :value="stats.by_status?.done || 0" icon="CheckCircleIcon" color="green" :loading="statsLoading" />
            <StatCard label="Thành viên" :value="stats.members || 0" icon="UsersIcon" color="blue" :loading="statsLoading" />
          </div>
          <div v-if="!statsLoading" class="card p-4">
            <div class="flex justify-between text-sm mb-2">
              <span class="text-gray-600 dark:text-gray-300">Tiến độ tổng hợp từ Epic</span>
              <span class="font-bold text-brand-600">{{ stats.project_completion_pct ?? 0 }}%</span>
            </div>
            <div class="w-full h-2 bg-surface-200 dark:bg-dark-50 rounded-full overflow-hidden">
              <div class="h-full bg-brand-500 rounded-full transition-all" :style="{ width: (stats.project_completion_pct ?? 0) + '%' }" />
            </div>
            <button type="button" class="text-xs text-brand-600 mt-2 hover:underline" @click="goToTab('epics')">Xem chi tiết Epic →</button>
          </div>

          <!-- Sprint progress + recent issues -->
          <div class="grid lg:grid-cols-5 gap-5">
            <!-- Active sprint -->
            <div class="lg:col-span-3 card p-5">
              <h3 class="font-semibold text-sm text-gray-900 dark:text-white mb-4">Sprint hiện tại</h3>
              <div v-if="!activeSprint" class="text-center py-6 text-sm text-gray-400">
                Không có sprint nào đang chạy.
                <NuxtLink :to="`/backlog/${projectId}`" class="text-brand-600 dark:text-brand-400 hover:underline ml-1">Tạo sprint mới</NuxtLink>
              </div>
              <div v-else>
                <div class="flex items-center justify-between mb-3">
                  <div>
                    <div class="font-medium text-gray-900 dark:text-white">{{ activeSprint.name }}</div>
                    <div v-if="activeSprint.goal" class="text-xs text-gray-400 mt-0.5 italic">{{ activeSprint.goal }}</div>
                  </div>
                  <span class="text-sm font-bold text-brand-600 dark:text-brand-400">{{ activeSprint.completion_rate }}%</span>
                </div>
                <div class="w-full h-2.5 bg-surface-200 dark:bg-dark-50 rounded-full overflow-hidden mb-3">
                  <div class="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-700"
                       :style="{ width: activeSprint.completion_rate + '%' }"></div>
                </div>
                <div class="grid grid-cols-4 gap-2">
                  <div v-for="s in sprintStatuses" :key="s.key" class="text-center p-2 rounded-lg bg-surface-50 dark:bg-dark-50">
                    <div class="text-lg font-bold" :class="s.color">{{ getSprintStatusCount(s.key) }}</div>
                    <div class="text-xs text-gray-400">{{ s.label }}</div>
                  </div>
                </div>
                <div class="flex items-center justify-between mt-3 pt-3 border-t border-surface-100 dark:border-dark-50 text-xs text-gray-400">
                  <span v-if="activeSprint.start_date">{{ formatDate(activeSprint.start_date) }}</span>
                  <span v-if="activeSprint.end_date">→ {{ formatDate(activeSprint.end_date) }}</span>
                  <span class="font-medium text-gray-600 dark:text-gray-300">{{ activeSprint.total_points || 0 }} story pts</span>
                </div>
              </div>
            </div>

            <!-- Members -->
            <div class="lg:col-span-2 card p-5">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-sm text-gray-900 dark:text-white">Thành viên</h3>
                <button
                  type="button"
                  @click="goToTab('members')"
                  class="inline-flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline cursor-pointer"
                >
                  Quản lý
                  <ChevronRightIcon class="w-3 h-3" />
                </button>
              </div>
              <div class="space-y-2.5">
                <div v-for="member in (project?.members || []).slice(0, 6)" :key="member.id"
                     class="flex items-center gap-2.5">
                  <UserAvatar :user="member.user" size="sm" />
                  <div class="flex-1 min-w-0">
                    <div class="text-xs font-medium text-gray-900 dark:text-white truncate">{{ member.user?.full_name }}</div>
                    <div class="text-xs text-gray-400">{{ member.role }}</div>
                  </div>
                  <div class="w-2 h-2 rounded-full" :class="member.user?.is_online ? 'bg-green-400' : 'bg-gray-300'"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Epics tab -->
        <div v-else-if="activeTab === 'epics'">
          <ProjectEpicsPanel
            ref="epicsPanelRef"
            :project-id="projectId"
            :can-create-issue="canCreateIssue"
            @create-epic="openCreateEpic"
            @open-issue="selectedIssueId = $event"
            @create-child="openCreateChild"
          />
        </div>

        <!-- Issues tab -->
        <div v-else-if="activeTab === 'issues'">
          <div class="flex flex-wrap items-center gap-3 mb-4">
            <input
              v-model="issueSearch"
              class="input max-w-xs min-w-[12rem]"
              placeholder="Tìm mã, tiêu đề, người thực hiện..."
            />
            <button
              type="button"
              class="btn-secondary btn-sm !text-xs shrink-0"
              :class="myIssuesOnly && '!bg-brand-50 !text-brand-700 dark:!bg-brand-950/40 dark:!text-brand-200 ring-1 ring-brand-500/40'"
              :title="authStore.user?.full_name ? `Issues giao cho ${authStore.user.full_name}` : 'Issues của tôi'"
              @click="toggleMyIssues"
            >
              <UserIcon class="w-3.5 h-3.5" />
              <span>Của tôi</span>
            </button>
            <select v-model="issueAssigneeFilter" class="input w-44 py-2">
              <option value="">Người thực hiện</option>
              <option value="unassigned">Chưa giao</option>
              <option
                v-for="m in issueMemberOptions"
                :key="m.user?.id"
                :value="String(m.user?.id)"
              >
                {{ m.user?.full_name || m.user?.email }}
              </option>
            </select>
            <select v-model="issueStatusFilter" class="input w-36 py-2">
              <option value="">Trạng thái</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="done">Done</option>
            </select>
            <select v-model="issueTypeFilter" class="input w-28 py-2">
              <option value="">Loại</option>
              <option value="task">Task</option>
              <option value="bug">Bug</option>
              <option value="story">Story</option>
              <option value="epic">Epic</option>
            </select>
            <select v-model="issueDateField" class="input w-36 py-2">
              <option value="due_date">Ngày deadline</option>
              <option value="created_at">Ngày tạo</option>
              <option value="updated_at">Ngày cập nhật</option>
            </select>
            <input v-model="issueDateFrom" type="date" class="input w-36 py-2" title="Từ ngày" />
            <input v-model="issueDateTo" type="date" class="input w-36 py-2" title="Đến ngày" />
            <button
              type="button"
              class="btn-secondary btn-sm"
              :disabled="exportingExcel"
              @click="exportIssuesExcel"
            >
              <ArrowDownTrayIcon class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">{{ exportingExcel ? 'Đang xuất...' : 'Xuất Excel' }}</span>
            </button>
            <button v-if="canCreateIssue" @click="showCreateIssue = true" class="btn-primary btn-sm ml-auto">
              <PlusIcon class="w-3.5 h-3.5" /> Issue
            </button>
          </div>

          <div class="card overflow-hidden">
            <div v-if="issuesLoading" class="divide-y divide-surface-100 dark:divide-dark-50">
              <div v-for="i in 6" :key="i" class="flex items-center gap-3 px-4 py-3">
                <div class="w-4 h-4 bg-surface-200 dark:bg-dark-50 rounded animate-pulse"></div>
                <div class="flex-1 h-4 bg-surface-100 dark:bg-dark-50 rounded animate-pulse"></div>
              </div>
            </div>
            <div v-else-if="issuesList.length === 0" class="p-10 text-center text-sm text-gray-400">
              Không có issue nào.
            </div>
            <div v-else class="divide-y divide-surface-100 dark:divide-dark-50">
              <BacklogIssueRow
                v-for="issue in issuesList"
                :key="issue.id"
                :issue="issue"
                @click="selectedIssueId = issue.id"
              />
            </div>
          </div>

          <nav
            v-if="!issuesLoading && issuesTotalCount > 0"
            class="flex flex-wrap items-center justify-between gap-3 mt-4 pt-2 border-t border-surface-200 dark:border-dark-50"
            aria-label="Phân trang issues"
          >
            <p class="text-sm text-gray-500">
              Hiển thị {{ issuesRangeStart }}–{{ issuesRangeEnd }} / {{ issuesTotalCount }}
            </p>
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="btn-secondary text-sm px-3 py-1.5"
                :disabled="issuesPage <= 1 || issuesLoading"
                @click="goToIssuesPage(issuesPage - 1)"
              >
                Trước
              </button>
              <button
                v-for="p in issuesVisiblePages"
                :key="p"
                type="button"
                class="min-w-[2.25rem] px-2 py-1.5 text-sm rounded-lg transition-colors"
                :class="p === issuesPage ? 'bg-brand-600 text-white' : 'btn-secondary'"
                :disabled="issuesLoading"
                @click="goToIssuesPage(p)"
              >
                {{ p }}
              </button>
              <button
                type="button"
                class="btn-secondary text-sm px-3 py-1.5"
                :disabled="issuesPage >= issuesTotalPages || issuesLoading"
                @click="goToIssuesPage(issuesPage + 1)"
              >
                Sau
              </button>
            </div>
          </nav>
        </div>

        <!-- Knowledge Graph tab -->
        <div v-else-if="activeTab === 'knowledge'">
          <ProjectKnowledgeGraph :project-id="projectId" :project-key="project?.key" />
        </div>

        <!-- Members tab -->
        <div v-else-if="activeTab === 'members'">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm text-gray-500">{{ project?.members?.length || 0 }} thành viên</span>
            <button v-if="canAddMember" @click="showAddMember = true" class="btn-primary btn-sm">
              <PlusIcon class="w-3.5 h-3.5" /> Thêm thành viên
            </button>
            <span v-else class="text-xs text-gray-400 italic">Chỉ Owner/Manager mới được thêm thành viên</span>
          </div>

          <div class="card overflow-hidden">
            <div class="divide-y divide-surface-100 dark:divide-dark-50">
              <div v-for="member in project?.members" :key="member.id"
                   class="flex items-center gap-4 px-5 py-3.5 group">
                <UserAvatar :user="member.user" size="md" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-gray-900 dark:text-white">{{ member.user?.full_name }}</span>
                    <span v-if="member.user?.id === authStore.user?.id" class="text-[10px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-1.5 py-0.5 rounded">Bạn</span>
                  </div>
                  <div class="text-sm text-gray-400">{{ member.user?.email }}</div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="flex items-center gap-1.5 text-xs text-gray-400">
                    <div class="w-2 h-2 rounded-full" :class="member.user?.is_online ? 'bg-green-400' : 'bg-gray-300'"></div>
                    {{ member.user?.is_online ? 'Online' : 'Offline' }}
                  </div>
                  <select
                    v-if="canChangeRole && member.role !== 'owner'"
                    :value="member.role"
                    @change="updateMemberRole(member, ($event.target as HTMLSelectElement).value)"
                    class="input py-1 text-xs w-28"
                  >
                    <option v-if="isOwner" value="owner">Owner</option>
                    <option value="manager">Manager</option>
                    <option value="developer">Developer</option>
                    <option value="tester">Tester</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <ProjectRoleBadge v-else :role="member.role" size="sm" />
                  <button
                    v-if="canRemoveMember && member.role !== 'owner' && member.user?.id !== authStore.user?.id"
                    @click="removeMember(member)"
                    class="btn-ghost btn-sm text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <TrashIcon class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Documents tab -->
        <div v-else-if="activeTab === 'documents'">
          <ProjectDocumentsPanel
            :project-id="projectId"
            :project-key="project?.key"
            @open-settings="goToTab('settings')"
          />
        </div>

        <!-- Settings tab -->
        <div v-else-if="activeTab === 'settings'" class="max-w-3xl space-y-6">
          <div v-if="canEditSettings" class="card p-6 space-y-4">
            <h3 class="font-semibold text-gray-900 dark:text-white">Thông tin Project</h3>
            <div>
              <label class="label">Tên Project</label>
              <input v-model="settingsForm.name" class="input" />
            </div>
            <div>
              <label class="label">Project Key</label>
              <input v-model="settingsForm.key" class="input font-mono uppercase" />
            </div>
            <div>
              <label class="label">Mô tả</label>
              <textarea v-model="settingsForm.description" class="input resize-none" rows="3"></textarea>
            </div>
            <div>
              <label class="label">Trạng thái</label>
              <select v-model="settingsForm.status" class="input">
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label">Ngày bắt đầu</label>
                <input v-model="settingsForm.start_date" type="date" class="input" />
              </div>
              <div>
                <label class="label">Ngày kết thúc</label>
                <input v-model="settingsForm.end_date" type="date" class="input" />
              </div>
            </div>
            <div class="flex justify-end">
              <button @click="saveSettings" :disabled="savingSettings" class="btn-primary">
                <span v-if="savingSettings" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Lưu thay đổi
              </button>
            </div>
          </div>

          <div v-else class="card p-6 text-sm text-gray-500">
            <LockClosedIcon class="w-8 h-8 text-gray-300 mb-2" />
            Chỉ Owner/Manager được sửa thông tin project. Bạn vẫn xem được phần tích hợp bên dưới.
          </div>

          <ProjectIntegrationsPanel
            :project-id="projectId"
            @open-documents="goToTab('documents')"
          />

          <div v-if="canDelete" class="card p-6 border-red-200 dark:border-red-900/50">
            <h3 class="font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
            <p class="text-sm text-gray-500 mb-4">Xóa project sẽ xóa toàn bộ issues, sprints và dữ liệu liên quan. Chỉ <strong>Admin hệ thống</strong> mới có quyền này.</p>
            <button @click="deleteProject" class="btn-danger btn-sm">
              <TrashIcon class="w-3.5 h-3.5" />
              Xóa Project
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- Modals -->
    <IssueModal
      v-if="selectedIssueId"
      :issue-id="selectedIssueId"
      @close="selectedIssueId = null"
      @updated="onIssueUpdated"
      @deleted="onIssueDeleted"
      @navigate-issue="selectedIssueId = $event"
    />
    <CreateIssueModal
      v-if="showCreateIssue"
      :project-id="projectId"
      :default-issue-type="createIssueType"
      :prefill="createPrefill"
      @close="showCreateIssue = false; createIssueType = undefined; createPrefill = null"
      @created="onIssueCreated"
    />
    <AddMemberModal v-if="showAddMember" :project-id="projectId" @close="showAddMember = false" @added="onMemberAdded" />
  </div>
</template>

<script setup lang="ts">
import {
  RectangleGroupIcon, ListBulletIcon, Cog6ToothIcon,
  PlusIcon, TrashIcon, ChartBarIcon, LockClosedIcon, ChevronRightIcon,
  DocumentTextIcon, UsersIcon, UserIcon, ArrowDownTrayIcon,
} from '@heroicons/vue/24/outline'
import { format } from 'date-fns'
import { useDebounceFn } from '@vueuse/core'
import { colorFromKey } from '~/utils/brandColors'
import { normalizeApiList } from '~/utils/apiList'
import { buildIssueListParams, type IssueListFilterInput } from '~/utils/issueListParams'
import { exportIssuesToExcel, fetchAllIssuesMatchingFilters } from '~/utils/exportIssuesExcel'

definePageMeta({ middleware: ['auth', 'project-member'] })

const route = useRoute()
const router = useRouter()
const projectId = computed(() => Number(route.params.id))
const projectsStore = useProjectsStore()
const authStore = useAuthStore()
const api = useApi()

// Role-based permissions for current user in this project
const {
  role, isOwner, canEditSettings, canDelete,
  canAddMember, canRemoveMember, canChangeRole, canCreateIssue,
} = useProjectRole(projectId)

const project = computed(() => projectsStore.currentProject)
const activeSprint = computed(() => projectsStore.activeSpring)

const activeTab = ref('overview')
const selectedIssueId = ref<number | null>(null)
const showCreateIssue = ref(false)
const createIssueType = ref<string | undefined>(undefined)
const createPrefill = ref<any>(null)
const epicsPanelRef = ref<{ loadEpics?: () => void } | null>(null)
const showAddMember = ref(false)
const showSettings = ref(false)
const statsLoading = ref(true)
const issuesLoading = ref(true)
const savingSettings = ref(false)
const stats = ref<any>({})
const issuesList = ref<any[]>([])
const sprintIssues = ref<any[]>([])
const issuesTotalCount = ref(0)
const issuesPage = ref(1)
const issuesPageSize = 20
const issueSearch = ref('')
const issueSearchApplied = ref('')
const issueAssigneeFilter = ref('')
const issueStatusFilter = ref('')
const issueTypeFilter = ref('')
const issueDateField = ref<'due_date' | 'created_at' | 'updated_at'>('due_date')
const issueDateFrom = ref('')
const issueDateTo = ref('')
const exportingExcel = ref(false)

const myIssuesOnly = computed(() => {
  const uid = authStore.user?.id
  return uid != null && issueAssigneeFilter.value === String(uid)
})

function toggleMyIssues() {
  const uid = authStore.user?.id
  if (!uid) return
  issueAssigneeFilter.value = myIssuesOnly.value ? '' : String(uid)
}

const issueMemberOptions = computed(() => {
  const members = project.value?.members || []
  return [...members].sort((a: any, b: any) =>
    (a.user?.full_name || a.user?.email || '').localeCompare(
      b.user?.full_name || b.user?.email || '',
      'vi',
    ),
  )
})

const sprintStatuses = [
  { key: 'todo', label: 'To Do', color: 'text-gray-500' },
  { key: 'in_progress', label: 'In Prog', color: 'text-blue-500' },
  { key: 'in_review', label: 'Review', color: 'text-purple-500' },
  { key: 'done', label: 'Done', color: 'text-green-500' },
]

const projectColor = computed(() => colorFromKey(project.value?.key || 'A'))

const tabs = computed(() => [
  { key: 'overview', label: 'Tổng quan' },
  { key: 'epics', label: 'Epic', count: stats.value.epic_count },
  { key: 'issues', label: 'Issues', count: issuesTotalCount.value || stats.value.total_issues },
  { key: 'knowledge', label: 'Knowledge Graph' },
  { key: 'members', label: 'Thành viên', count: project.value?.members?.length },
  { key: 'documents', label: 'Tài liệu' },
  { key: 'settings', label: 'Cài đặt' },
])

const issuesTotalPages = computed(() =>
  Math.max(1, Math.ceil(issuesTotalCount.value / issuesPageSize)),
)
const issuesRangeStart = computed(() =>
  issuesTotalCount.value === 0 ? 0 : (issuesPage.value - 1) * issuesPageSize + 1,
)
const issuesRangeEnd = computed(() =>
  Math.min(issuesPage.value * issuesPageSize, issuesTotalCount.value),
)
const issuesVisiblePages = computed(() => {
  const total = issuesTotalPages.value
  const current = issuesPage.value
  const window = 5
  let start = Math.max(1, current - Math.floor(window / 2))
  let end = Math.min(total, start + window - 1)
  start = Math.max(1, end - window + 1)
  const pages: number[] = []
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const settingsForm = reactive({
  name: '', key: '', description: '', status: 'active',
  start_date: '', end_date: ''
})

watch(project, (p) => {
  if (!p) return
  Object.assign(settingsForm, {
    name: p.name, key: p.key, description: p.description || '',
    status: p.status, start_date: p.start_date || '', end_date: p.end_date || '',
  })
}, { immediate: true })


function goToIssuesPage(p: number) {
  const next = Math.min(Math.max(1, p), issuesTotalPages.value)
  if (next === issuesPage.value) return
  issuesPage.value = next
  loadIssues()
}

const applyIssueSearch = useDebounceFn(() => {
  issueSearchApplied.value = issueSearch.value
  issuesPage.value = 1
  loadIssues()
}, 300)

watch(issueSearch, () => applyIssueSearch())
watch([issueStatusFilter, issueTypeFilter, issueAssigneeFilter, issueDateField, issueDateFrom, issueDateTo], () => {
  issuesPage.value = 1
  loadIssues()
})

function buildProjectIssueFilters(overrides: Partial<IssueListFilterInput> = {}): IssueListFilterInput {
  const input: IssueListFilterInput = {
    projectId: projectId.value,
    page: issuesPage.value,
    page_size: issuesPageSize,
    ordering: '-created_at',
    q: issueSearchApplied.value,
    status: issueStatusFilter.value,
    issue_type: issueTypeFilter.value,
    date_field: issueDateField.value,
    date_from: issueDateFrom.value,
    date_to: issueDateTo.value,
    ...overrides,
  }
  if (issueAssigneeFilter.value === 'unassigned') input.assignee__isnull = true
  else if (issueAssigneeFilter.value) input.assignee = Number(issueAssigneeFilter.value)
  return input
}

async function exportIssuesExcel() {
  exportingExcel.value = true
  try {
    const issues = await fetchAllIssuesMatchingFilters(api, buildProjectIssueFilters())
    const parts: string[] = []
    if (issueSearchApplied.value.trim()) parts.push(`tìm: ${issueSearchApplied.value.trim()}`)
    if (issueStatusFilter.value) parts.push(`trạng thái: ${issueStatusFilter.value}`)
    if (issueTypeFilter.value) parts.push(`loại: ${issueTypeFilter.value}`)
    if (myIssuesOnly.value) parts.push('của tôi')
    if (issueDateFrom.value || issueDateTo.value) {
      parts.push(`ngày ${issueDateField.value}: ${issueDateFrom.value || '…'} → ${issueDateTo.value || '…'}`)
    }
    exportIssuesToExcel({
      issues,
      projectKey: project.value?.key,
      projectName: project.value?.name,
      filterSummary: parts.join('; '),
    })
  } finally {
    exportingExcel.value = false
  }
}

const STATUS_LABELS: Record<string, string> = {
  planning: 'Planning', active: 'Active', on_hold: 'On Hold',
  completed: 'Completed', archived: 'Archived'
}
const STATUS_BADGES: Record<string, string> = {
  planning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  on_hold: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  archived: 'bg-gray-100 text-gray-500',
}
function statusLabel(s: string) { return STATUS_LABELS[s] || s }
function statusBadgeClass(s: string) { return STATUS_BADGES[s] || STATUS_BADGES.planning }
function formatDate(d: string) { return format(new Date(d), 'dd/MM/yyyy') }

function goToTab(key: string) {
  activeTab.value = key
  router.replace({ query: { ...route.query, tab: key } })
  nextTick(() => {
    const el = document.querySelector<HTMLElement>('[data-tab-content]')
    el?.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

function getSprintStatusCount(status: string) {
  if (!activeSprint.value) return 0
  return sprintIssues.value.filter(i => i.status === status).length
}

async function loadData() {
  if (!projectId.value) return

  issuesPage.value = 1
  issueSearch.value = ''
  issueSearchApplied.value = ''
  issueDateFrom.value = ''
  issueDateTo.value = ''

  await Promise.all([
    projectsStore.fetchProject(projectId.value),
    projectsStore.fetchSprints(projectId.value),
    loadStats(),
    loadIssues(),
  ])
  await loadSprintIssues()

  statsLoading.value = false
}

async function saveSettings() {
  savingSettings.value = true
  try {
    await projectsStore.updateProject(projectId.value, settingsForm)
  } finally { savingSettings.value = false }
}

async function deleteProject() {
  if (!confirm(`Bạn chắc muốn xóa "${project.value?.name}"? Hành động này không thể hoàn tác.`)) return
  try {
    await api.delete(`/api/projects/${projectId.value}/`)
    projectsStore.projects = projectsStore.projects.filter(p => p.id !== projectId.value)
    router.push('/projects')
  } catch (e: any) {
    alert(e?.data?.detail || 'Chỉ Admin hệ thống được xóa project.')
  }
}

async function updateMemberRole(member: any, role: string) {
  await api.post(`/api/projects/${projectId.value}/members/`, { user_id: member.user.id, role })
  member.role = role
}

async function removeMember(member: any) {
  if (!confirm(`Xóa ${member.user?.full_name} khỏi project?`)) return
  await api.delete(`/api/projects/${projectId.value}/members/${member.user.id}/`)
  if (project.value?.members) {
    project.value.members = project.value.members.filter((m: any) => m.id !== member.id)
  }
}

function openCreateEpic() {
  createIssueType.value = 'epic'
  createPrefill.value = null
  showCreateIssue.value = true
}

// Tạo Story/Task ngay tại 1 epic, hoặc Task ngay trong 1 story
function openCreateChild(payload: { parentId: number; parentType: string; suggestType: string }) {
  createIssueType.value = payload.suggestType
  createPrefill.value = { issue_type: payload.suggestType, parent: payload.parentId }
  showCreateIssue.value = true
}

async function onIssueCreated() {
  showCreateIssue.value = false
  createIssueType.value = undefined
  createPrefill.value = null
  issuesPage.value = 1
  await Promise.all([loadIssues(), loadStats(), loadSprintIssues()])
  epicsPanelRef.value?.loadEpics?.()
}

async function onIssueUpdated() {
  // KHÔNG đóng panel khi sửa field — chỉ refresh danh sách nền. Panel đóng khi bấm thoát.
  await Promise.all([loadIssues(), loadSprintIssues()])
}

async function onIssueDeleted() {
  selectedIssueId.value = null
  await Promise.all([loadIssues(), loadStats(), loadSprintIssues()])
}
async function loadIssues() {
  if (!projectId.value) return
  issuesLoading.value = true
  try {
    const issueData = await api.get<{ count?: number; results?: unknown[] }>(
      '/api/issues/',
      buildIssueListParams(buildProjectIssueFilters()),
    )
    issuesList.value = normalizeApiList(issueData)
    issuesTotalCount.value = typeof issueData?.count === 'number'
      ? issueData.count
      : issuesList.value.length
  } catch {
    issuesList.value = []
    issuesTotalCount.value = 0
  } finally {
    issuesLoading.value = false
  }
}

async function loadSprintIssues() {
  const sprintId = activeSprint.value?.id
  if (!projectId.value || !sprintId) {
    sprintIssues.value = []
    return
  }
  try {
    const data = await api.get('/api/issues/', {
      project: projectId.value,
      sprint: sprintId,
      page_size: 500,
    })
    sprintIssues.value = normalizeApiList(data)
  } catch {
    sprintIssues.value = []
  }
}

async function loadStats() {
  stats.value = await api.get(`/api/projects/${projectId.value}/stats/`)
}
function onMemberAdded() {
  showAddMember.value = false
  projectsStore.fetchProject(projectId.value, { force: true })
}

function applyTabFromQuery() {
  const t = route.query.tab
  if (typeof t === 'string' && ['overview', 'epics', 'issues', 'knowledge', 'members', 'documents', 'settings'].includes(t)) {
    activeTab.value = t
  }
}

onMounted(() => {
  applyTabFromQuery()
  loadData()
})

watch(() => route.query.tab, applyTabFromQuery)
watch(projectId, loadData)
</script>

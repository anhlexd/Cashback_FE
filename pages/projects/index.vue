<template>
  <div class="mx-auto max-w-6xl space-y-6 p-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Projects</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ isAdmin ? 'Toàn bộ dự án trong tổ chức' : 'Các dự án bạn đang tham gia' }}
        </p>
      </div>
      <button v-if="isAdmin" class="btn-primary shadow-md shadow-brand-600/20" @click="showCreate = true">
        <PlusIcon class="h-4 w-4" />
        Tạo Project
      </button>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <div class="relative min-w-[200px] flex-1 max-w-xs">
        <MagnifyingGlassIcon class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          v-model="search"
          class="input pl-9"
          placeholder="Tìm tên hoặc mã project..."
        />
      </div>
      <select v-model="statusFilter" class="input w-36 py-2">
        <option value="">Tất cả trạng thái</option>
        <option value="active">Active</option>
        <option value="planning">Planning</option>
        <option value="on_hold">On Hold</option>
        <option value="completed">Completed</option>
      </select>
    </div>

    <div v-if="projectsStore.loading" class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 6" :key="i" class="h-44 animate-pulse rounded-2xl bg-surface-100 dark:bg-dark-50" />
    </div>

    <div v-else-if="filteredProjects.length === 0" class="rounded-2xl border border-dashed border-surface-200 py-16 text-center dark:border-dark-50">
      <RectangleGroupIcon class="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
      <h3 class="font-medium text-gray-600 dark:text-gray-300">Chưa có project nào</h3>
      <p class="mt-1 text-sm text-gray-400">
        {{ isAdmin ? 'Tạo project đầu tiên để bắt đầu!' : 'Liên hệ Admin để được tạo project mới.' }}
      </p>
      <button v-if="isAdmin" class="btn-primary mt-5" @click="showCreate = true">
        <PlusIcon class="h-4 w-4" />
        Tạo Project mới
      </button>
    </div>

    <div v-else class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      <ProjectListCard
        v-for="project in filteredProjects"
        :key="project.id"
        :project="project"
        :user-role="roleOf(project)"
      />
    </div>

    <CreateProjectModal v-if="isAdmin && showCreate" @close="showCreate = false" @created="onProjectCreated" />
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, RectangleGroupIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.user?.role === 'admin')
const projectsStore = useProjectsStore()
const router = useRouter()
const search = ref('')
const statusFilter = ref('')
const showCreate = ref(false)

const filteredProjects = computed(() => {
  let list = projectsStore.projects
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q))
  }
  if (statusFilter.value) list = list.filter(p => p.status === statusFilter.value)
  return list
})

function roleOf(project: any): string | null {
  if (authStore.user?.role === 'admin') return 'admin'
  if (project?.current_user_role) return project.current_user_role
  const members = project?.members || project?.project_members
  if (Array.isArray(members) && authStore.user) {
    const m = members.find((x: any) => (x.user?.id ?? x.user_id) === authStore.user!.id)
    if (m?.role) return m.role
  }
  return null
}

function onProjectCreated(project: any) {
  showCreate.value = false
  router.push(`/projects/${project.id}`)
}

onMounted(() => projectsStore.fetchProjects())
</script>

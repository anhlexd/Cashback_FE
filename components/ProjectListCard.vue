<template>
  <NuxtLink
    :to="`/projects/${project.id}`"
    class="project-card group relative flex flex-col overflow-hidden rounded-2xl border bg-white dark:bg-dark-50 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-500/5 dark:hover:shadow-black/40"
    :class="cardBorderClass"
  >
    <!-- Thanh accent theo màu project -->
    <div
      class="absolute inset-x-0 top-0 h-1 opacity-80 group-hover:opacity-100 group-hover:h-1.5 transition-all duration-300"
      :style="{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)` }"
    />

    <!-- Admin: ánh sáng nhẹ góc -->
    <div
      v-if="userRole === 'admin'"
      class="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-amber-400/20 to-rose-500/15 blur-2xl"
    />

    <div class="relative flex flex-1 flex-col p-5 pt-6">
      <div class="flex items-start gap-3">
        <div
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold shadow-md ring-2 ring-white transition-all duration-300 group-hover:scale-110 group-hover:ring-brand-200/50 dark:ring-dark-100 dark:group-hover:ring-brand-800/40"
          :style="{
            backgroundColor: accentColor + '22',
            color: accentColor,
            boxShadow: `0 8px 20px -6px ${accentColor}55`,
          }"
        >
          {{ project.key }}
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-2">
            <h3
              class="truncate font-semibold text-gray-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400"
            >
              {{ project.name }}
            </h3>
            <span :class="statusBadgeClass" class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
              {{ statusLabel }}
            </span>
          </div>
          <p class="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {{ project.description || 'Không có mô tả' }}
          </p>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-2">
        <ProjectRoleBadge v-if="userRole" :role="userRole" size="sm" />
        <div class="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
          <span class="inline-flex items-center gap-1 rounded-lg bg-surface-50 px-2 py-1 dark:bg-dark-100">
            <ClipboardDocumentListIcon class="h-3.5 w-3.5 text-gray-400" />
            <span class="font-medium text-gray-700 dark:text-gray-300">{{ project.issue_count ?? 0 }}</span>
            <span class="hidden sm:inline">issues</span>
          </span>
          <span class="inline-flex items-center gap-1 rounded-lg bg-surface-50 px-2 py-1 dark:bg-dark-100">
            <UsersIcon class="h-3.5 w-3.5 text-gray-400" />
            <span class="font-medium text-gray-700 dark:text-gray-300">{{ project.member_count ?? 0 }}</span>
            <span class="hidden sm:inline">thành viên</span>
          </span>
        </div>
      </div>

      <div
        class="mt-4 flex items-center gap-2 border-t border-surface-100 pt-3 opacity-0 transition-all duration-300 group-hover:opacity-100 dark:border-dark-50"
      >
        <span class="text-[10px] font-medium uppercase tracking-wider text-gray-400">Mở nhanh</span>
        <div class="ml-auto flex gap-1.5">
          <NuxtLink
            :to="`/board/${project.id}`"
            class="rounded-lg bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700 transition-colors hover:bg-brand-100 dark:bg-brand-950/50 dark:text-brand-300 dark:hover:bg-brand-900/50"
            @click.stop
          >
            Board
          </NuxtLink>
          <NuxtLink
            :to="`/backlog/${project.id}`"
            class="rounded-lg bg-surface-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600 transition-colors hover:bg-surface-200 dark:bg-dark-100 dark:text-gray-300 dark:hover:bg-dark-50"
            @click.stop
          >
            Backlog
          </NuxtLink>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { ClipboardDocumentListIcon, UsersIcon } from '@heroicons/vue/24/outline'
import { colorFromKey } from '~/utils/brandColors'

const props = defineProps<{
  project: {
    id: number
    key: string
    name: string
    description?: string
    status: string
    issue_count?: number
    member_count?: number
  }
  userRole: string | null
}>()

const accentColor = computed(() => colorFromKey(props.project.key || 'A'))

const cardBorderClass = computed(() => {
  if (props.userRole === 'admin') {
    return 'border-amber-200/70 dark:border-amber-500/25 hover:border-amber-300/80 dark:hover:border-amber-500/40'
  }
  return 'border-surface-200 dark:border-dark-50 hover:border-brand-200/60 dark:hover:border-brand-800/50'
})

const STATUS_LABELS: Record<string, string> = {
  planning: 'Planning',
  active: 'Active',
  on_hold: 'On hold',
  completed: 'Done',
  archived: 'Archived',
}

const STATUS_CLASSES: Record<string, string> = {
  planning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  on_hold: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  completed: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  archived: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

const statusLabel = computed(() => STATUS_LABELS[props.project.status] || props.project.status)
const statusBadgeClass = computed(() => STATUS_CLASSES[props.project.status] || STATUS_CLASSES.planning)
</script>

<style scoped>
.project-card {
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.04), 0 4px 12px rgb(0 0 0 / 0.03);
}
</style>

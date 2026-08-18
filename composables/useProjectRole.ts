// composables/useProjectRole.ts
// Derive current user's role + permissions in a project.
//
// Usage:
//   const { role, isMember, canManage, canEditSettings, canDelete } = useProjectRole(projectId)
//
// Project membership data is read from projectsStore.currentProject (when on detail page)
// or from projectsStore.projects (list cache). Returns null role if user is not a member.

import type { MaybeRef } from 'vue'

export type ProjectRole = 'owner' | 'manager' | 'developer' | 'tester' | 'viewer' | 'admin' | null

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin hệ thống',
  owner: 'Chủ dự án',
  manager: 'Quản lý',
  developer: 'Developer',
  tester: 'Tester',
  viewer: 'Người xem',
}

/** Nhãn ngắn trên badge / card */
export const ROLE_SHORT_LABELS: Record<string, string> = {
  admin: 'Admin',
  owner: 'Owner',
  manager: 'Manager',
  developer: 'Dev',
  tester: 'QA',
  viewer: 'Viewer',
}

/** @deprecated Dùng ProjectRoleBadge — giữ cho chỗ chưa migrate */
export const ROLE_BADGE_CLASS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  owner: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  developer: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  tester: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  viewer: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
}

export type RoleMeta = {
  shortLabel: string
  title: string
  pill: string
  icon: string
}

/** Style pill + icon cho ProjectRoleBadge */
export const ROLE_META: Record<string, RoleMeta> = {
  admin: {
    shortLabel: 'Admin',
    title: 'Admin hệ thống — truy cập mọi dự án',
    pill: 'bg-gradient-to-r from-amber-50 to-rose-50 text-amber-900 ring-1 ring-amber-300/60 shadow-sm dark:from-amber-950/50 dark:to-rose-950/40 dark:text-amber-100 dark:ring-amber-500/35',
    icon: 'ShieldCheckIcon',
  },
  owner: {
    shortLabel: 'Owner',
    title: 'Chủ dự án',
    pill: 'bg-gradient-to-r from-violet-50 to-purple-50 text-violet-800 ring-1 ring-violet-200/80 dark:from-violet-950/40 dark:to-purple-950/30 dark:text-violet-200 dark:ring-violet-500/30',
    icon: 'StarIcon',
  },
  manager: {
    shortLabel: 'Manager',
    title: 'Quản lý dự án',
    pill: 'bg-gradient-to-r from-sky-50 to-blue-50 text-sky-800 ring-1 ring-sky-200/80 dark:from-sky-950/40 dark:to-blue-950/30 dark:text-sky-200 dark:ring-sky-500/30',
    icon: 'BriefcaseIcon',
  },
  developer: {
    shortLabel: 'Dev',
    title: 'Developer',
    pill: 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 ring-1 ring-emerald-200/70 dark:from-emerald-950/40 dark:to-green-950/30 dark:text-emerald-200 dark:ring-emerald-500/25',
    icon: 'CodeBracketIcon',
  },
  tester: {
    shortLabel: 'QA',
    title: 'Tester',
    pill: 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-800 ring-1 ring-orange-200/70 dark:from-orange-950/40 dark:to-amber-950/30 dark:text-orange-200 dark:ring-orange-500/25',
    icon: 'BeakerIcon',
  },
  viewer: {
    shortLabel: 'Viewer',
    title: 'Người xem',
    pill: 'bg-surface-100 text-gray-600 ring-1 ring-gray-200/80 dark:bg-dark-100 dark:text-gray-300 dark:ring-dark-50',
    icon: 'EyeIcon',
  },
}

export function getRoleMeta(role: string | null | undefined): RoleMeta | null {
  if (!role) return null
  return ROLE_META[role] || {
    shortLabel: role,
    title: ROLE_LABELS[role] || role,
    pill: ROLE_BADGE_CLASS[role] || ROLE_META.viewer.pill,
    icon: 'UserIcon',
  }
}

export function useProjectRole(projectId: MaybeRef<number | null | undefined>) {
  const authStore = useAuthStore()
  const projectsStore = useProjectsStore()

  const project = computed(() => {
    const pid = unref(projectId)
    if (!pid) return null
    if (projectsStore.currentProject?.id === pid) return projectsStore.currentProject
    return projectsStore.projects.find((p: any) => p.id === pid) || null
  })

  const currentMember = computed(() => {
    const p = project.value
    if (!p || !authStore.user) return null
    // Try project.members first (full member array), then current_user_role field from list endpoint
    const members = p.members || p.project_members
    if (Array.isArray(members)) {
      return members.find((m: any) => (m.user?.id ?? m.user_id) === authStore.user!.id) || null
    }
    if (p.current_user_role) {
      return { role: p.current_user_role }
    }
    return null
  })

  const isSystemAdmin = computed(() => authStore.user?.role === 'admin')

  const role = computed<ProjectRole>(() => {
    if (isSystemAdmin.value) return 'admin'
    const p = project.value
    if (p?.current_user_role) return p.current_user_role as ProjectRole
    return (currentMember.value?.role as ProjectRole) ?? null
  })
  const isMember = computed(() => isSystemAdmin.value || role.value !== null)
  const isOwner = computed(() => role.value === 'owner')
  const isManager = computed(() => role.value === 'manager')
  const isDeveloper = computed(() => role.value === 'developer')
  const isTester = computed(() => role.value === 'tester')
  const isViewer = computed(() => role.value === 'viewer')

  // Permission matrix — xóa project chỉ Admin hệ thống
  const canManage = computed(() => isSystemAdmin.value || isOwner.value || isManager.value)
  const canEditSettings = computed(() => isSystemAdmin.value || isOwner.value || isManager.value)
  const canDelete = computed(() => isSystemAdmin.value)
  const canAddMember = computed(() => isSystemAdmin.value || isOwner.value || isManager.value)
  const canRemoveMember = computed(() => isSystemAdmin.value || isOwner.value || isManager.value)
  const canChangeRole = computed(() => isSystemAdmin.value || isOwner.value || isManager.value)
  const canCreateIssue = computed(() => isSystemAdmin.value || (isMember.value && !isViewer.value))
  const canEditAnyIssue = computed(() => isSystemAdmin.value || isOwner.value || isManager.value)

  return {
    project,
    currentMember,
    isSystemAdmin,
    role,
    isMember,
    isOwner,
    isManager,
    isDeveloper,
    isTester,
    isViewer,
    canManage,
    canEditSettings,
    canDelete,
    canAddMember,
    canRemoveMember,
    canChangeRole,
    canCreateIssue,
    canEditAnyIssue,
  }
}

// middleware/project-member.ts
// Ensures the current user is a member of the project before allowing access
// to project detail / board / backlog / gantt pages.
//
// Usage in page: definePageMeta({ middleware: ['auth', 'project-member'] })
//
// If user is not a member (or project returns 403/404), redirect to /projects with a toast.
// Owner/manager/developer/tester/viewer roles all pass — only non-members are blocked.

export default defineNuxtRouteMiddleware(async (to) => {
  const id = Number(to.params.id)
  if (!id) return

  const authStore = useAuthStore()
  const projectsStore = useProjectsStore()
  const toast = useToast()

  // auth.client.ts plugin should have loaded the user. Bail if not.
  if (!authStore.user) {
    try { await authStore.fetchProfile() } catch { /* fall through */ }
    if (!authStore.user) return navigateTo('/login')
  }

  // Admin hệ thống được vào mọi project (BE queryset đã mở rộng)
  if (authStore.user?.role === 'admin') return

  let project: any
  try {
    project = await projectsStore.fetchProject(id)
  } catch (err: any) {
    if (err?.status === 403 || err?.status === 404) {
      toast.error('Bạn không có quyền truy cập dự án này')
      return navigateTo('/projects')
    }
    throw err
  }

  const members = project?.members || project?.project_members || []
  const isMember = Array.isArray(members)
    && members.some((m: any) => (m.user?.id ?? m.user_id) === authStore.user!.id)

  // Some backends already filter by membership and may return current_user_role as a fallback signal
  const hasRoleField = !!project?.current_user_role

  if (!isMember && !hasRoleField) {
    toast.error('Bạn không có quyền truy cập dự án này')
    return navigateTo('/projects')
  }
})

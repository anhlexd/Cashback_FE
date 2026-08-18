<template>
  <div class="card p-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        Hoạt động GitHub
      </h3>
      <NuxtLink to="/github" class="text-xs text-brand-600 dark:text-brand-400 hover:underline">
        Xem tất cả
      </NuxtLink>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="flex gap-3">
        <div class="w-7 h-7 rounded-full bg-surface-200 dark:bg-dark-50 animate-pulse flex-shrink-0"></div>
        <div class="flex-1 space-y-1.5">
          <div class="h-3 bg-surface-100 dark:bg-dark-50 rounded w-3/4 animate-pulse"></div>
          <div class="h-3 bg-surface-100 dark:bg-dark-50 rounded w-1/2 animate-pulse"></div>
        </div>
      </div>
    </div>

    <div v-else-if="items.length === 0" class="text-center py-6 text-sm text-gray-400">
      <p>Chưa có hoạt động GitHub nào.</p>
      <NuxtLink to="/github" class="text-brand-600 dark:text-brand-400 hover:underline text-xs mt-1 block">
        Kết nối repository →
      </NuxtLink>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="item in items"
        :key="item.id + item.type"
        class="flex items-start gap-3"
      >
        <!-- Icon by type -->
        <div class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
             :class="item.type === 'completion' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-dark-50'">
          <CheckCircleIcon v-if="item.type === 'completion'" class="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
          <code v-else class="text-[9px] font-bold text-gray-500 dark:text-gray-400">GIT</code>
        </div>

        <div class="flex-1 min-w-0">
          <!-- Completion event -->
          <template v-if="item.type === 'completion'">
            <div class="text-xs">
              <span class="font-semibold text-green-700 dark:text-green-400">✅ {{ item.issue_key }}</span>
              <span class="text-gray-500 dark:text-gray-400"> hoàn thành bởi </span>
              <span class="font-medium text-gray-700 dark:text-gray-300">@{{ item.github_user }}</span>
            </div>
            <div class="text-xs text-gray-400 mt-0.5 truncate">{{ item.issue_title }}</div>
          </template>

          <!-- Commit -->
          <template v-else>
            <div class="flex items-center gap-1.5 text-xs">
              <code class="font-mono text-brand-600 dark:text-brand-400">{{ item.short_sha }}</code>
              <span class="text-gray-500">@{{ item.author }}</span>
              <div v-if="item.linked_issue_keys?.length" class="flex gap-1">
                <span
                  v-for="key in item.linked_issue_keys.slice(0,2)"
                  :key="key"
                  class="badge bg-surface-200 dark:bg-dark-50 text-gray-600 dark:text-gray-300 font-mono text-[10px]"
                >{{ key }}</span>
              </div>
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate">
              {{ item.message?.split('\n')[0] }}
            </div>
          </template>

          <div class="text-xs text-gray-300 dark:text-gray-600 mt-0.5">{{ timeAgo(item.date) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircleIcon } from '@heroicons/vue/24/outline'
import { format } from 'date-fns'

const api = useApi()
const loading = ref(true)
const items = ref<any[]>([])

async function load() {
  loading.value = true
  try {
    const [completions, repos] = await Promise.all([
      api.get('/api/github/completions/'),
      api.get('/api/github/repos/'),
    ])

    const completionList = (completions.results || completions).slice(0, 5).map((e: any) => ({
      id: e.id, type: 'completion',
      issue_key: e.issue_key, issue_title: e.issue_title,
      github_user: e.completed_by_github_user,
      date: e.completed_at,
    }))

    // Get commits from first repo
    const repoList = repos.results || repos
    let commits: any[] = []
    if (repoList.length > 0) {
      const data = await api.get(`/api/github/repos/${repoList[0].id}/commits/`)
      commits = (data || []).slice(0, 5).map((c: any) => ({
        id: c.id, type: 'commit',
        short_sha: c.short_sha, author: c.author_github_login || c.author_name,
        message: c.message, linked_issue_keys: c.linked_issue_keys,
        date: c.committed_at,
      }))
    }

    // Merge and sort by date
    items.value = [...completionList, ...commits]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8)
  } catch {
    // GitHub not configured — silently show empty
  } finally {
    loading.value = false
  }
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'vừa xong'
  if (mins < 60) return `${mins}p trước`
  const h = Math.floor(mins / 60)
  if (h < 24) return `${h}h trước`
  return format(new Date(d), 'dd/MM HH:mm')
}

onMounted(load)
</script>

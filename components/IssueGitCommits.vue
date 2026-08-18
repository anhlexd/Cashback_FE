<template>
  <div class="space-y-3">
    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="rounded-xl border border-surface-200 dark:border-dark-50 p-3 animate-pulse">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-6 h-6 rounded-full bg-surface-200 dark:bg-dark-100"></div>
          <div class="h-3 w-28 bg-surface-200 dark:bg-dark-100 rounded"></div>
          <div class="h-3 w-16 bg-surface-100 dark:bg-dark-50 rounded ml-auto"></div>
        </div>
        <div class="h-3 w-3/4 bg-surface-100 dark:bg-dark-50 rounded mb-2"></div>
        <div class="flex gap-1 pl-8">
          <div class="h-4 w-8 bg-green-100 dark:bg-green-900/20 rounded"></div>
          <div class="h-4 w-8 bg-surface-200 dark:bg-dark-100 rounded"></div>
          <div class="h-4 w-8 bg-red-100 dark:bg-red-900/20 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="commits.length === 0" class="text-sm text-gray-400 italic text-center py-6">
      Chưa có commit nào liên kết với issue này.
    </div>

    <!-- Commit list -->
    <div v-else class="space-y-2">
      <div
        v-for="commit in commits"
        :key="commit.id"
        class="rounded-xl border border-surface-200 dark:border-dark-50 bg-white dark:bg-dark-100 p-3 hover:bg-surface-50 dark:hover:bg-dark-50 transition-colors"
      >
        <!-- Header: avatar + author + time + COMMIT badge -->
        <div class="flex items-center gap-2 mb-2">
          <div class="w-6 h-6 rounded-full bg-gray-200 dark:bg-dark-50 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-gray-500 uppercase">
            {{ (commit.author_github_login || commit.author_name || '?').charAt(0) }}
          </div>
          <span class="text-xs font-semibold text-gray-800 dark:text-gray-200">
            {{ commit.author_github_login || commit.author_name }}
          </span>
          <span class="text-xs text-gray-400">committed {{ timeAgo(commit.committed_at) }}</span>
          <span class="ml-auto text-[10px] font-bold tracking-widest bg-surface-100 dark:bg-dark-50 border border-surface-200 dark:border-dark-50 text-gray-500 px-2 py-0.5 rounded">
            COMMIT
          </span>
        </div>

        <!-- Commit message + short sha -->
        <p class="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mb-2 pl-8">
          <span
            v-for="(part, i) in parseMessage(commit.message)"
            :key="i"
            :class="part.isKey ? 'line-through text-gray-400' : ''"
          >{{ part.text }}</span>
          <a
            v-if="commit.url"
            :href="commit.url"
            target="_blank"
            class="ml-1.5 font-mono text-[11px] text-brand-500 hover:underline"
          >{{ commit.short_sha }}</a>
        </p>

        <!-- Repo / branch / full sha -->
        <div class="flex items-center gap-3 pl-8 flex-wrap mb-2">
          <span class="text-[11px] text-gray-500">{{ commit.repo_name }}</span>

          <span class="text-[11px] text-gray-500 flex items-center gap-1">

            <img src="/assets/icons/git-branch-icon.svg?url" class="w-3"/>

            {{ commit.branch || 'main' }}
          </span>

          <a
            v-if="commit.url"
            :href="commit.url"
            target="_blank"
            class="text-[11px] font-mono text-gray-400 hover:text-brand-500 truncate max-w-[200px] transition-colors"
          >{{ commit.sha }}</a>

          <a
            v-if="commit.url"
            :href="commit.url"
            target="_blank"
            class="text-[11px] text-gray-400 hover:text-brand-500 ml-auto transition-colors"
          >GitHub ↗</a>
        </div>

        <!-- Diff stats -->
        <div class="flex items-center gap-1.5 pl-8">
          <span v-if="commit.additions > 0"
            class="text-[11px] font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded">
            +{{ commit.additions }}
          </span>
          <span v-if="commit.files_changed > 0"
            class="text-[11px] font-bold bg-surface-200 dark:bg-dark-50 text-gray-500 px-1.5 py-0.5 rounded">
            ±{{ commit.files_changed }}
          </span>
          <span v-if="commit.deletions > 0"
            class="text-[11px] font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded">
            -{{ commit.deletions }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

const props = defineProps<{ issueId: number }>()

const api = useApi()
const commits = ref<any[]>([])
const loading = ref(true)

async function loadCommits() {
  loading.value = true
  try {
    const data = await api.get('/api/github/issue-commits/', { issue_id: props.issueId })
    commits.value = data.results || data
  } finally {
    loading.value = false
  }
}

function parseMessage(msg: string) {
  const parts: { text: string; isKey: boolean }[] = []
  const regex = /([A-Z]+-\d+)/g
  let last = 0, match
  while ((match = regex.exec(msg)) !== null) {
    if (match.index > last) parts.push({ text: msg.slice(last, match.index), isKey: false })
    parts.push({ text: match[0], isKey: true })
    last = match.index + match[0].length
  }
  if (last < msg.length) parts.push({ text: msg.slice(last), isKey: false })
  return parts.length ? parts : [{ text: msg, isKey: false }]
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'vừa xong'
  if (mins < 60) return `${mins}p trước`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h trước`
  return format(new Date(dateStr), 'dd/MM/yyyy')
}

onMounted(loadCommits)
</script>
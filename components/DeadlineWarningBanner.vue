<template>
  <!-- Floating warning bar at top -->
  <Transition name="slide-down">
    <div v-if="urgentIssues.length > 0 && !dismissed" class="fixed top-0 left-0 right-0 z-[200]">
      <!-- Critical: overdue -->
      <div v-if="overdueIssues.length > 0" class="bg-red-600 text-white px-4 py-2.5 flex items-center gap-3 shadow-lg">
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <ExclamationCircleIcon class="w-5 h-5 flex-shrink-0 animate-pulse" />
          <span class="text-sm font-semibold">
            🚨 {{ overdueIssues.length }} issue đã QUÁ HẠN!
          </span>
          <div class="hidden sm:flex items-center gap-1.5 flex-1 overflow-x-auto">
            <button
              v-for="issue in overdueIssues.slice(0, 3)"
              :key="issue.id"
              @click="openIssue(issue)"
              class="flex-shrink-0 bg-red-700 hover:bg-red-800 text-white text-xs px-2 py-0.5 rounded transition-colors"
            >
              {{ issue.issue_key }}
            </button>
            <span v-if="overdueIssues.length > 3" class="text-red-200 text-xs">+{{ overdueIssues.length - 3 }} nữa</span>
          </div>
        </div>
        <NuxtLink to="/deadline" class="flex-shrink-0 bg-white text-red-600 text-xs font-bold px-3 py-1 rounded-lg hover:bg-red-50 transition-colors">
          Xem tất cả
        </NuxtLink>
        <button @click="dismissed = true" class="flex-shrink-0 hover:bg-red-700 rounded p-1 transition-colors">
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>

      <!-- Warning: due soon -->
      <div v-else-if="dueSoonIssues.length > 0" class="bg-orange-500 text-white px-4 py-2 flex items-center gap-3 shadow-lg">
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <ClockIcon class="w-4 h-4 flex-shrink-0" />
          <span class="text-sm font-medium">
            ⏰ {{ dueSoonIssues.length }} issue sắp hết hạn hôm nay
          </span>
        </div>
        <NuxtLink to="/deadline" class="flex-shrink-0 text-xs underline hover:no-underline">Xem chi tiết</NuxtLink>
        <button @click="dismissed = true" class="flex-shrink-0 hover:bg-orange-600 rounded p-1 transition-colors">
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
  </Transition>

  <!-- Issue modal -->
  <IssueModal v-if="selectedIssueId" :issue-id="selectedIssueId" @close="selectedIssueId = null" />
</template>

<script setup lang="ts">
import { ExclamationCircleIcon, ClockIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const api = useApi()
const authStore = useAuthStore()

const overdueIssues = ref<any[]>([])
const dueSoonIssues = ref<any[]>([])
const dismissed = ref(false)
const selectedIssueId = ref<number | null>(null)

const urgentIssues = computed(() => [...overdueIssues.value, ...dueSoonIssues.value])

function openIssue(issue: any) {
  selectedIssueId.value = issue.id
}

async function loadDeadlines() {
  if (!authStore.isAuthenticated) return
  try {
    const [overdueData, upcomingData] = await Promise.all([
      api.get('/api/deadlines/overdue_issues/'),
      api.get('/api/deadlines/upcoming_issues/'),
    ])
    overdueIssues.value = overdueData.issues || []

    // Only show "due today" in banner
    const today = new Date().toISOString().split('T')[0]
    dueSoonIssues.value = (upcomingData.issues || []).filter(
      (i: any) => i.due_date === today
    )
  } catch (e) {
    // Silently fail — banner is non-critical
  }
}

// Reset dismissed when route changes so user sees it again
const route = useRoute()
watch(() => route.path, () => { dismissed.value = false })

// Poll every 10 minutes
onMounted(() => {
  loadDeadlines()
  const interval = setInterval(loadDeadlines, 10 * 60 * 1000)
  onUnmounted(() => clearInterval(interval))
})
</script>

<style scoped>
.slide-down-enter-active { animation: slideDown 0.3s ease-out; }
.slide-down-leave-active { animation: slideDown 0.2s ease-in reverse; }
@keyframes slideDown {
  from { transform: translateY(-100%); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
}
</style>

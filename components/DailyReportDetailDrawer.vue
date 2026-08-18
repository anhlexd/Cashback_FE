<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[80] flex justify-end" @keydown.esc="$emit('close')">
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')"></div>

      <div class="relative w-full max-w-[560px] h-full bg-white dark:bg-dark-100 shadow-2xl flex flex-col">
        <!-- Header -->
        <div class="flex items-center gap-3 px-5 py-4 border-b border-surface-200 dark:border-dark-50 flex-shrink-0">
          <div class="flex-1 min-w-0">
            <div class="font-bold text-gray-900 dark:text-white truncate">{{ userName }}</div>
            <div class="text-xs text-gray-400">Báo cáo từng ngày · tháng {{ month }}/{{ year }}</div>
          </div>
          <button class="btn-ghost btn-icon" @click="$emit('close')"><XMarkIcon class="w-5 h-5" /></button>
        </div>

        <div class="flex-1 overflow-y-auto p-5 space-y-3">
          <div v-if="loading" class="space-y-2">
            <div v-for="i in 5" :key="i" class="h-16 card animate-pulse" />
          </div>

          <template v-else>
            <div v-if="rows.length === 0" class="text-sm text-gray-400 text-center py-8">
              Không có ngày làm việc nào trong tháng.
            </div>
            <div
              v-for="row in rows" :key="row.date"
              class="rounded-xl border p-3"
              :class="row.status === 'missing'
                ? 'border-red-200 dark:border-red-900/40 bg-red-50/40 dark:bg-red-950/10'
                : 'border-surface-200 dark:border-dark-50'"
            >
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ formatDate(row.date) }}</span>
                <span class="text-xs px-1.5 py-0.5 rounded" :class="badge(row.status)">{{ statusLabel(row.status) }}</span>
              </div>

              <template v-if="row.report">
                <div class="mb-2">
                  <div class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">✅ Đã làm</div>
                  <ul v-if="row.report.done_items?.length" class="space-y-0.5">
                    <li v-for="it in row.report.done_items" :key="it.id" class="text-xs text-gray-700 dark:text-gray-300">
                      <span class="font-mono text-gray-400">{{ it.issue_key }}</span> {{ it.title }}
                    </li>
                  </ul>
                  <p v-else class="text-xs text-gray-400 italic">—</p>
                </div>
                <div class="mb-2">
                  <div class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">📌 Kế hoạch</div>
                  <ul v-if="row.report.plan_items?.length" class="space-y-0.5">
                    <li v-for="it in row.report.plan_items" :key="it.id" class="text-xs text-gray-700 dark:text-gray-300">
                      <span class="font-mono text-gray-400">{{ it.issue_key }}</span> {{ it.title }}
                    </li>
                  </ul>
                  <p v-else class="text-xs text-gray-400 italic">—</p>
                </div>
                <div v-if="row.report.blockers">
                  <div class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">⚠️ Khó khăn</div>
                  <p class="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ row.report.blockers }}</p>
                </div>
              </template>
              <p v-else-if="row.status === 'missing'" class="text-xs text-red-600 dark:text-red-400 font-medium">
                Thiếu báo cáo
              </p>
              <p v-else class="text-xs text-gray-400">Chưa nộp (trong ngày)</p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { format } from 'date-fns'
import { normalizeApiList } from '~/utils/apiList'

const props = defineProps<{ userId: number; userName: string; year: number | string; month: number | string }>()
defineEmits(['close'])

const api = useApi()
const loading = ref(true)
const rows = ref<any[]>([])

function formatDate(d: string) { return format(new Date(d), 'EEEE, dd/MM/yyyy') }
function statusLabel(s: string) {
  return { submitted: 'Đã báo cáo', missing: 'Thiếu báo cáo', pending: 'Trong ngày' }[s] || s
}
function badge(s: string) {
  if (s === 'submitted') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
  if (s === 'missing') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  return 'bg-surface-100 dark:bg-dark-50 text-gray-500'
}

async function load() {
  loading.value = true
  try {
    const [summary, reports] = await Promise.all([
      api.get<any>('/api/daily-reports/monthly-summary/', { user: props.userId, year: props.year, month: props.month }),
      api.get<any>('/api/daily-reports/', { user: props.userId, year: props.year, month: props.month, page_size: 100 }),
    ])
    const byDate: Record<string, any> = {}
    for (const r of normalizeApiList(reports)) {
      if (r.submitted_at) byDate[r.date] = r
    }
    // chỉ hiện ngày làm việc (submitted/missing/pending), mới nhất trước
    rows.value = (summary.days || [])
      .filter((d: any) => ['submitted', 'missing', 'pending'].includes(d.status))
      .map((d: any) => ({ date: d.date, status: d.status, report: byDate[d.date] || null }))
      .reverse()
  } catch {
    rows.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

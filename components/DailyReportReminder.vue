<template>
  <Teleport to="body">
    <!-- Icon thu nhỏ treo mép phải — luôn cảnh báo tới 24h nếu chưa nộp -->
    <Transition name="dr-fade">
      <button
        v-if="phase === 'minimized'"
        type="button"
        class="fixed right-0 top-1/2 -translate-y-1/2 z-[90] flex items-center gap-1.5 pl-2.5 pr-3 py-2.5 rounded-l-xl bg-red-600 hover:bg-red-700 text-white shadow-lg animate-pulse"
        title="Bạn chưa làm báo cáo hôm nay — bấm để điền"
        @click="expand"
      >
        <ClipboardDocumentCheckIcon class="w-5 h-5" />
        <span class="text-xs font-semibold whitespace-nowrap">Báo cáo</span>
      </button>
    </Transition>

    <!-- Popup đầy đủ -->
    <Transition name="dr-slide">
      <div
        v-if="phase === 'expanded'"
        class="fixed bottom-4 right-4 z-[90] w-[370px] max-w-[calc(100vw-2rem)] bg-white dark:bg-dark-100 rounded-2xl shadow-modal border border-red-200 dark:border-red-900/40 flex flex-col max-h-[80vh]"
      >
        <div class="flex items-center gap-2 px-4 py-3 border-b border-surface-100 dark:border-dark-50 bg-red-50/60 dark:bg-red-950/20 rounded-t-2xl">
          <span class="text-lg">📝</span>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-sm text-gray-900 dark:text-white">Báo cáo cuối ngày</div>
            <div class="text-[11px] text-red-500">Chưa nộp — vui lòng điền báo cáo hôm nay</div>
          </div>
          <button class="text-gray-400 hover:text-gray-600" title="Thu nhỏ" @click="minimize">
            <MinusIcon class="w-4 h-4" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <div>
            <div class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">✅ Hôm nay làm được gì</div>
            <div v-if="doneList.length" class="space-y-1 max-h-28 overflow-y-auto">
              <label v-for="it in doneList" :key="it.id" class="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" v-model="doneSel" :value="it.id" class="rounded" />
                <span class="font-mono text-gray-400">{{ it.issue_key }}</span>
                <span class="truncate text-gray-700 dark:text-gray-300">{{ it.title }}</span>
              </label>
            </div>
            <p v-else class="text-[11px] text-gray-400 italic">Không có task done hôm nay.</p>
          </div>

          <div>
            <div class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">📌 Kế hoạch ngày mai</div>
            <div v-if="planList.length" class="space-y-1 max-h-28 overflow-y-auto">
              <label v-for="it in planList" :key="it.id" class="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" v-model="planSel" :value="it.id" class="rounded" />
                <span class="font-mono text-gray-400">{{ it.issue_key }}</span>
                <span class="truncate text-gray-700 dark:text-gray-300">{{ it.title }}</span>
              </label>
            </div>
            <p v-else class="text-[11px] text-gray-400 italic">Không có task được giao đang mở.</p>
          </div>

          <div>
            <div class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">⚠️ Khó khăn trong ngày</div>
            <textarea v-model="blockers" rows="2" class="input text-xs w-full" placeholder="Vướng mắc (nếu có)..."></textarea>
          </div>
        </div>

        <div class="flex items-center gap-2 px-4 py-3 border-t border-surface-100 dark:border-dark-50">
          <NuxtLink to="/daily-report" class="text-xs text-brand-600 hover:underline" @click="minimize">
            Mở trang đầy đủ
          </NuxtLink>
          <div class="flex-1" />
          <button class="btn-secondary btn-sm" @click="minimize">Thu nhỏ</button>
          <button class="btn-primary btn-sm" :disabled="saving" @click="save">
            <span v-if="saving" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Gửi
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { MinusIcon, ClipboardDocumentCheckIcon } from '@heroicons/vue/24/outline'

const api = useApi()
const toast = useToast()
const authStore = useAuthStore()

const phase = ref<'hidden' | 'expanded' | 'minimized'>('hidden')
const loadedForDate = ref<string | null>(null)
const saving = ref(false)
const reportId = ref<number | null>(null)
const doneList = ref<any[]>([])
const planList = ref<any[]>([])
const doneSel = ref<number[]>([])
const planSel = ref<number[]>([])
const blockers = ref('')

function dateStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const submittedKey = () => `dr-submitted-${dateStr()}`
const minimizedKey = () => `dr-minimized-${dateStr()}`

const config = useRuntimeConfig()

/** Ngày làm việc: T2–T6 làm; CN nghỉ; T7 làm CÁCH TUẦN (mốc cấu hình). */
function isWorkingDay(now: Date) {
  const wd = now.getDay() // 0 CN … 6 T7
  if (wd >= 1 && wd <= 5) return true
  if (wd === 0) return false
  const raw = String(config.public.workingSaturdayAnchor || '2026-06-20').split('-').map(Number)
  const anchor = new Date(raw[0], (raw[1] || 1) - 1, raw[2] || 1)
  const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weeks = Math.round((d0.getTime() - anchor.getTime()) / (7 * 86400000))
  return ((weeks % 2) + 2) % 2 === 0
}

/** Sau 17h của NGÀY LÀM VIỆC, trong ngày (đến 24h) → cần cảnh báo. */
function isActiveWindow(now = new Date()) {
  if (!isWorkingDay(now)) return false
  return now.getHours() >= 17
}

let timer: any = null

async function ensureLoaded() {
  const today = dateStr()
  if (loadedForDate.value === today) return true
  try {
    const data = await api.get<any>('/api/daily-reports/mine/', { date: today })
    if (data?.report?.submitted_at) {
      sessionStorage.setItem(submittedKey(), '1')
      return false
    }
    reportId.value = data.report?.id ?? null
    const existingDone = data.report?.done_items || []
    doneList.value = [...existingDone, ...(data.suggested_done || [])]
    doneSel.value = doneList.value.map((i: any) => i.id)
    const existingPlan = data.report?.plan_items || []
    planList.value = [...existingPlan, ...(data.plan_candidates || [])]
    planSel.value = existingPlan.map((i: any) => i.id)
    blockers.value = data.report?.blockers || ''
    loadedForDate.value = today
    return true
  } catch {
    return false
  }
}

async function tick() {
  if (!authStore.isAuthenticated || !isActiveWindow()) {
    if (phase.value !== 'hidden') phase.value = 'hidden'
    return
  }
  if (sessionStorage.getItem(submittedKey())) {
    phase.value = 'hidden'
    return
  }
  const ok = await ensureLoaded()
  if (!ok) {
    phase.value = 'hidden'
    return
  }
  // Đã từng thu nhỏ trong ngày → giữ icon; chưa thì mở popup
  phase.value = sessionStorage.getItem(minimizedKey()) ? 'minimized' : 'expanded'
}

function minimize() {
  phase.value = 'minimized'
  sessionStorage.setItem(minimizedKey(), '1')
}
async function expand() {
  await ensureLoaded()
  phase.value = 'expanded'
}

async function save() {
  if (!reportId.value) return
  saving.value = true
  try {
    await api.patch(`/api/daily-reports/${reportId.value}/`, {
      done_item_ids: doneSel.value,
      plan_item_ids: planSel.value,
      blockers: blockers.value,
    })
    sessionStorage.setItem(submittedKey(), '1')
    phase.value = 'hidden'
    toast.success('Đã gửi báo cáo ngày')
  } catch (e: any) {
    toast.error(e?.data?.detail || 'Gửi thất bại')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  tick()
  timer = setInterval(tick, 60_000)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<style scoped>
.dr-slide-enter-active, .dr-slide-leave-active { transition: all 0.25s ease; }
.dr-slide-enter-from, .dr-slide-leave-to { opacity: 0; transform: translateY(16px); }
.dr-fade-enter-active, .dr-fade-leave-active { transition: opacity 0.2s ease; }
.dr-fade-enter-from, .dr-fade-leave-to { opacity: 0; }
</style>

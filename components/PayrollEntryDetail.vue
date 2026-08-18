<template>
  <div class="grid lg:grid-cols-2 gap-6 text-sm">
    <div>
      <h4 class="font-semibold text-gray-800 dark:text-gray-200 mb-2">Chỉ số từ DevFlow</h4>
      <pre class="text-xs bg-white dark:bg-dark-100 border border-surface-200 dark:border-dark-50 rounded-lg p-3 overflow-auto max-h-64">{{ prettyMetrics }}</pre>
    </div>

    <div>
      <h4 class="font-semibold text-gray-800 dark:text-gray-200 mb-2">Công thức & kết quả</h4>
      <p v-if="entry.calculation?.formula" class="text-xs text-gray-500 mb-2">{{ entry.calculation.formula }}</p>
      <dl class="space-y-1 text-xs">
        <template v-if="entry.payroll_role === 'developer'">
          <div class="flex justify-between"><dt>SP hoàn thành</dt><dd>{{ entry.metrics?.story_points_done ?? 0 }}</dd></div>
          <div class="flex justify-between"><dt>Bug rate</dt><dd>{{ entry.metrics?.bug_rate ?? 0 }}</dd></div>
          <div class="flex justify-between"><dt>Hệ số chất lượng</dt><dd>{{ entry.calculation?.quality_label }} (×{{ entry.calculation?.quality_factor }})</dd></div>
          <div class="flex justify-between"><dt>Khoán output</dt><dd>{{ formatVnd(entry.calculation?.output_pay) }}</dd></div>
        </template>
        <template v-else-if="entry.payroll_role === 'tester'">
          <div v-for="(row, prio) in entry.calculation?.bugs_breakdown || {}" :key="prio" class="flex justify-between">
            <dt class="capitalize">{{ prio }}</dt>
            <dd>{{ row.count }} × {{ formatVnd(row.unit_price) }} = {{ formatVnd(row.amount) }}</dd>
          </div>
        </template>
        <div class="flex justify-between text-gray-700 dark:text-gray-300 pt-2 border-t border-surface-100 dark:border-dark-50">
          <dt>① Lương KPI cá nhân</dt>
          <dd>{{ formatVnd(entry.personal_total ?? (entry.variable_total - (entry.team_project_bonus || 0))) }}</dd>
        </div>
        <div class="flex justify-between text-purple-600 dark:text-purple-400">
          <dt>② Lương KPI team (theo tiến độ dự án)</dt>
          <dd>{{ formatVnd(entry.team_project_bonus || 0) }}</dd>
        </div>
        <div v-if="teamProjects.length" class="pl-3 space-y-0.5 pb-1">
          <div v-for="(tp, i) in teamProjects" :key="i" class="flex justify-between text-[11px] text-gray-400">
            <dt>Dự án #{{ tp.project_id }} · điểm team {{ Math.round((tp.score || 0) * 100) }}%</dt>
            <dd>{{ formatVnd(tp.amount) }}</dd>
          </div>
        </div>
        <div class="flex justify-between font-semibold text-brand-600 dark:text-brand-400 pt-2 border-t border-surface-200 dark:border-dark-50">
          <dt>Tổng khoán (KPI cá nhân + team)</dt>
          <dd>{{ formatVnd(entry.variable_total) }}</dd>
        </div>
      </dl>

      <div v-if="!readonly" class="mt-4 space-y-3 border-t border-surface-200 dark:border-dark-50 pt-4">
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-xs text-gray-500">Vai trò khoán</label>
            <select v-model="form.payroll_role" class="input py-1.5 text-sm w-full">
              <option value="developer">Developer</option>
              <option value="tester">Tester</option>
              <option value="designer">Designer</option>
              <option value="ba">BA</option>
              <option value="pm">PM</option>
            </select>
          </div>
          <div v-if="form.payroll_role === 'developer'">
            <label class="text-xs text-gray-500">Level</label>
            <select v-model="form.developer_level" class="input py-1.5 text-sm w-full">
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
              <option value="tech_lead">Tech Lead</option>
            </select>
          </div>
        </div>
        <div v-if="form.payroll_role === 'developer'" class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-xs text-gray-500">Thưởng on-time (VND)</label>
            <input v-model.number="form.on_time_bonus" type="number" min="0" class="input py-1.5 text-sm w-full" />
          </div>
        </div>
        <div v-if="form.payroll_role === 'tester'">
          <label class="text-xs text-gray-500">Thưởng team QA (VND)</label>
          <input v-model.number="form.team_qa_bonus" type="number" min="0" class="input py-1.5 text-sm w-full" />
        </div>
        <div v-if="['designer', 'ba', 'pm', 'other'].includes(form.payroll_role)">
          <label class="text-xs text-gray-500">Hệ số rework</label>
          <input v-model.number="form.manual_rework_factor" type="number" min="0" max="2" step="0.05" class="input py-1.5 text-sm w-full" />
          <label class="text-xs text-gray-500 mt-2 block">Thưởng thêm (VND)</label>
          <input v-model.number="form.manual_extra_bonus" type="number" min="0" class="input py-1.5 text-sm w-full" />
          <label class="text-xs text-gray-500 mt-2 block">Deliverable (JSON: quantity, unit_price, label)</label>
          <textarea
            v-model="manualLinesJson"
            rows="4"
            class="input text-xs w-full font-mono"
            placeholder='[{"label":"Screen","quantity":3,"unit_price":200000}]'
          />
        </div>
        <button class="btn-primary text-sm" :disabled="saving" @click="save">Lưu & tính lại</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatVnd } from '~/utils/formatMoney'

const props = defineProps<{
  entry: Record<string, any>
  readonly?: boolean
}>()

const emit = defineEmits<{ saved: [entry: Record<string, any>] }>()

const api = useApi()
const saving = ref(false)

const form = reactive({
  payroll_role: props.entry.payroll_role,
  developer_level: props.entry.developer_level || 'mid',
  on_time_bonus: props.entry.on_time_bonus || 0,
  team_qa_bonus: props.entry.team_qa_bonus || 0,
  manual_rework_factor: props.entry.manual_rework_factor ?? 1,
  manual_extra_bonus: props.entry.manual_extra_bonus || 0,
})

const manualLinesJson = ref(JSON.stringify(props.entry.manual_lines || [], null, 2))

const prettyMetrics = computed(() => JSON.stringify(props.entry.metrics || {}, null, 2))
const teamProjects = computed<any[]>(() => props.entry.calculation?.team_bonus?.projects || [])

watch(
  () => props.entry.id,
  () => {
    form.payroll_role = props.entry.payroll_role
    form.developer_level = props.entry.developer_level || 'mid'
    form.on_time_bonus = props.entry.on_time_bonus || 0
    form.team_qa_bonus = props.entry.team_qa_bonus || 0
    form.manual_rework_factor = props.entry.manual_rework_factor ?? 1
    form.manual_extra_bonus = props.entry.manual_extra_bonus || 0
    manualLinesJson.value = JSON.stringify(props.entry.manual_lines || [], null, 2)
  },
)

async function save() {
  saving.value = true
  try {
    let manual_lines = props.entry.manual_lines || []
    if (['designer', 'ba', 'pm', 'other'].includes(form.payroll_role)) {
      manual_lines = JSON.parse(manualLinesJson.value || '[]')
    }
    const updated = await api.patch(`/api/payroll/entries/${props.entry.id}/`, {
      ...form,
      manual_lines,
    })
    emit('saved', updated)
  } catch (e: any) {
    alert(e?.data?.detail || 'Lưu thất bại')
  } finally {
    saving.value = false
  }
}
</script>

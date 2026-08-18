<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Phòng ban & Vị trí</h2>
    <p class="text-sm text-gray-500 mb-5">
      Tùy biến cơ cấu tổ chức. Vị trí gắn <strong>loại KPI</strong> để hệ thống tính lương khoán theo từng vị trí.
    </p>

    <div v-if="!isAdmin" class="card p-6 text-sm text-gray-500 dark:text-gray-400">
      Chỉ tài khoản <strong>Admin hệ thống</strong> mới quản lý được phòng ban / vị trí.
    </div>

    <template v-else>
      <!-- Tabs -->
      <div class="flex items-center gap-1 mb-4 border-b border-surface-200 dark:border-dark-50">
        <button
          v-for="t in tabs" :key="t.key"
          @click="tab = t.key"
          class="px-3 py-2 text-sm font-medium -mb-px border-b-2 transition-colors"
          :class="tab === t.key
            ? 'border-brand-600 text-brand-700 dark:text-brand-300'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- ───── Departments ───── -->
      <div v-if="tab === 'dept'" class="space-y-3">
        <div class="flex justify-end">
          <button class="btn-primary btn-sm" @click="openDept()">+ Thêm phòng ban</button>
        </div>
        <div v-if="loading && !departments.length" class="text-sm text-gray-400 py-4">Đang tải…</div>
        <div v-else-if="!departments.length" class="card p-6 text-sm text-gray-400 text-center">
          Chưa có phòng ban. Bấm “Thêm phòng ban”.
        </div>
        <div v-else class="grid sm:grid-cols-2 gap-3">
          <div v-for="d in departments" :key="d.id" class="card p-4">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <div class="font-semibold text-sm text-gray-900 dark:text-white truncate">
                  {{ d.name }}
                  <span class="badge bg-surface-100 dark:bg-dark-100 text-gray-500 ml-1">{{ d.code }}</span>
                  <span v-if="!d.is_active" class="badge bg-amber-100 text-amber-700 ml-1">Tạm ẩn</span>
                </div>
                <p v-if="d.description" class="text-xs text-gray-400 mt-1 line-clamp-2">{{ d.description }}</p>
                <div class="text-xs text-gray-400 mt-1.5">
                  {{ d.position_count ?? d.positions?.length ?? 0 }} vị trí · {{ d.member_count ?? 0 }} nhân sự
                </div>
              </div>
              <div class="flex items-center gap-1 flex-shrink-0">
                <button class="btn-ghost btn-sm" @click="openDept(d)" title="Sửa">✏️</button>
                <button class="btn-ghost btn-sm text-red-500" @click="removeDept(d)" title="Xóa">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ───── Positions ───── -->
      <div v-else class="space-y-3">
        <div class="flex justify-end">
          <button class="btn-primary btn-sm" :disabled="!departments.length" @click="openPos()">+ Thêm vị trí</button>
        </div>
        <p v-if="!departments.length" class="text-xs text-amber-600">Tạo phòng ban trước khi thêm vị trí.</p>
        <div v-if="!positions.length && departments.length" class="card p-6 text-sm text-gray-400 text-center">
          Chưa có vị trí nào.
        </div>
        <div v-else class="space-y-2">
          <div v-for="p in positions" :key="p.id" class="card p-4 flex items-center gap-3">
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-sm text-gray-900 dark:text-white truncate">
                {{ p.name }}
                <span class="badge bg-surface-100 dark:bg-dark-100 text-gray-500 ml-1">{{ p.code }}</span>
                <span v-if="!p.is_active" class="badge bg-amber-100 text-amber-700 ml-1">Tạm ẩn</span>
              </div>
              <div class="flex items-center gap-2 mt-1 flex-wrap text-xs text-gray-400">
                <span>{{ p.department_name }}</span>
                <span class="badge bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300">
                  KPI: {{ kpiShort(p.kpi_type) }}
                </span>
                <span>· bậc {{ p.default_level || '—' }}</span>
                <span>· {{ p.holder_count ?? 0 }} người</span>
              </div>
            </div>
            <div class="flex items-center gap-1 flex-shrink-0">
              <button class="btn-ghost btn-sm" @click="openPos(p)" title="Sửa">✏️</button>
              <button class="btn-ghost btn-sm text-red-500" @click="removePos(p)" title="Xóa">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ───── Department modal ───── -->
    <div v-if="deptModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="deptModal = false">
      <div class="w-full max-w-md bg-white dark:bg-dark-100 rounded-2xl shadow-modal animate-scale-in p-6 space-y-4">
        <h3 class="font-bold text-gray-900 dark:text-white">{{ deptForm.id ? 'Sửa phòng ban' : 'Thêm phòng ban' }}</h3>
        <div>
          <label class="label">Tên phòng ban *</label>
          <input v-model="deptForm.name" class="input" placeholder="Engineering" />
        </div>
        <div>
          <label class="label">Mã *</label>
          <input v-model="deptForm.code" class="input" placeholder="ENG" />
        </div>
        <div>
          <label class="label">Mô tả</label>
          <textarea v-model="deptForm.description" class="input" rows="2" />
        </div>
        <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <input type="checkbox" v-model="deptForm.is_active" /> Đang hoạt động
        </label>
        <div class="flex justify-end gap-2 pt-1">
          <button class="btn-secondary" @click="deptModal = false">Hủy</button>
          <button class="btn-primary" :disabled="saving || !deptForm.name || !deptForm.code" @click="saveDept">
            {{ saving ? 'Đang lưu…' : 'Lưu' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ───── Position modal ───── -->
    <div v-if="posModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="posModal = false">
      <div class="w-full max-w-md bg-white dark:bg-dark-100 rounded-2xl shadow-modal animate-scale-in p-6 space-y-4">
        <h3 class="font-bold text-gray-900 dark:text-white">{{ posForm.id ? 'Sửa vị trí' : 'Thêm vị trí' }}</h3>
        <div>
          <label class="label">Phòng ban *</label>
          <select v-model="posForm.department" class="input">
            <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">Tên vị trí *</label>
            <input v-model="posForm.name" class="input" placeholder="Backend Developer" />
          </div>
          <div>
            <label class="label">Mã *</label>
            <input v-model="posForm.code" class="input" placeholder="BE" />
          </div>
        </div>
        <div>
          <label class="label">Loại KPI (cách tính lương)</label>
          <select v-model="posForm.kpi_type" class="input">
            <option v-for="o in KPI_TYPE_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
        </div>
        <div>
          <label class="label">Bậc mặc định</label>
          <select v-model="posForm.default_level" class="input">
            <option v-for="o in LEVEL_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
        </div>
        <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <input type="checkbox" v-model="posForm.is_active" /> Đang hoạt động
        </label>
        <div class="flex justify-end gap-2 pt-1">
          <button class="btn-secondary" @click="posModal = false">Hủy</button>
          <button class="btn-primary" :disabled="saving || !posForm.name || !posForm.code || !posForm.department" @click="savePos">
            {{ saving ? 'Đang lưu…' : 'Lưu' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { KPI_TYPE_OPTIONS, LEVEL_OPTIONS, kpiTypeLabel } from '~/composables/useOrg'

definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const toast = useToast()
const org = useOrg()

const isAdmin = computed(() => authStore.user?.role === 'admin')
const { departments, positions, loading } = org

const tabs = [
  { key: 'dept', label: 'Phòng ban' },
  { key: 'pos', label: 'Vị trí' },
]
const tab = ref<'dept' | 'pos'>('dept')
const saving = ref(false)

function kpiShort(v: string) {
  return kpiTypeLabel(v).split('—')[0].trim()
}

onMounted(() => { if (isAdmin.value) org.fetchAll() })

// ── Department modal ──
const deptModal = ref(false)
const deptForm = reactive<any>({ id: null, name: '', code: '', description: '', is_active: true })

function openDept(d?: any) {
  if (d) Object.assign(deptForm, { id: d.id, name: d.name, code: d.code, description: d.description || '', is_active: d.is_active })
  else Object.assign(deptForm, { id: null, name: '', code: '', description: '', is_active: true })
  deptModal.value = true
}

async function saveDept() {
  saving.value = true
  try {
    const body = { name: deptForm.name, code: deptForm.code, description: deptForm.description, is_active: deptForm.is_active }
    if (deptForm.id) await org.updateDepartment(deptForm.id, body)
    else await org.createDepartment(body)
    toast.success('Đã lưu phòng ban')
    deptModal.value = false
  } catch (e: any) {
    toast.error(e?.data?.code?.[0] || e?.data?.detail || 'Lưu thất bại (mã có thể trùng)')
  } finally {
    saving.value = false
  }
}

async function removeDept(d: any) {
  if (!confirm(`Xóa phòng ban "${d.name}"? Mọi vị trí thuộc phòng ban này cũng bị xóa.`)) return
  try {
    await org.deleteDepartment(d.id)
    toast.success('Đã xóa')
  } catch {
    toast.error('Xóa thất bại')
  }
}

// ── Position modal ──
const posModal = ref(false)
const posForm = reactive<any>({ id: null, department: null, name: '', code: '', kpi_type: 'manual', default_level: 'mid', is_active: true })

function openPos(p?: any) {
  if (p) Object.assign(posForm, { id: p.id, department: p.department, name: p.name, code: p.code, kpi_type: p.kpi_type, default_level: p.default_level || 'mid', is_active: p.is_active })
  else Object.assign(posForm, { id: null, department: departments.value[0]?.id ?? null, name: '', code: '', kpi_type: 'manual', default_level: 'mid', is_active: true })
  posModal.value = true
}

async function savePos() {
  saving.value = true
  try {
    const body = {
      department: posForm.department, name: posForm.name, code: posForm.code,
      kpi_type: posForm.kpi_type, default_level: posForm.default_level, is_active: posForm.is_active,
    }
    if (posForm.id) await org.updatePosition(posForm.id, body)
    else await org.createPosition(body)
    toast.success('Đã lưu vị trí')
    posModal.value = false
  } catch (e: any) {
    toast.error(e?.data?.detail || e?.data?.non_field_errors?.[0] || 'Lưu thất bại (mã có thể trùng trong phòng ban)')
  } finally {
    saving.value = false
  }
}

async function removePos(p: any) {
  if (!confirm(`Xóa vị trí "${p.name}"?`)) return
  try {
    await org.deletePosition(p.id)
    toast.success('Đã xóa')
  } catch {
    toast.error('Xóa thất bại')
  }
}
</script>

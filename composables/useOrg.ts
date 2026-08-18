// composables/useOrg.ts — Quản lý Phòng ban (Department) + Vị trí (Position)
// Singleton: state module-level để trang Settings và Members dùng chung danh sách.
import { normalizeApiList } from '~/utils/apiList'

export interface Department {
  id: number
  name: string
  code: string
  description?: string
  is_active: boolean
  positions?: Position[]
  member_count?: number
  position_count?: number
}

export interface Position {
  id: number
  department: number
  department_name?: string
  name: string
  code: string
  kpi_type: string
  kpi_type_display?: string
  default_level: string
  description?: string
  is_active: boolean
  holder_count?: number
}

export const KPI_TYPE_OPTIONS = [
  { value: 'developer', label: 'Developer — SP × đơn giá × hệ số chất lượng' },
  { value: 'tester', label: 'Tester — bug × giá ưu tiên + thưởng QA' },
  { value: 'ba', label: 'Business Analyst — story + thưởng sprint' },
  { value: 'pm', label: 'Project Manager — khoán + thưởng' },
  { value: 'designer', label: 'Designer — deliverable × đơn giá × hệ số rework' },
  { value: 'manual', label: 'Khoán thủ công (nhập tay)' },
  { value: 'none', label: 'Không tính KPI' },
] as const

export const LEVEL_OPTIONS = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'tech_lead', label: 'Tech Lead' },
] as const

export function kpiTypeLabel(v: string) {
  return KPI_TYPE_OPTIONS.find(o => o.value === v)?.label || v
}

// ── shared state ──
const departments = ref<Department[]>([])
const positions = ref<Position[]>([])
const loading = ref(false)
let loaded = false

export const useOrg = () => {
  const api = useApi()

  async function fetchAll(force = false) {
    if (loaded && !force) return
    loading.value = true
    try {
      const [deps, pos] = await Promise.all([
        api.get<any>('/api/auth/departments/'),
        api.get<any>('/api/auth/positions/'),
      ])
      departments.value = normalizeApiList(deps)
      positions.value = normalizeApiList(pos)
      loaded = true
    } finally {
      loading.value = false
    }
  }

  // ── Departments ──
  const createDepartment = (body: Partial<Department>) =>
    api.post<Department>('/api/auth/departments/', body).then(d => { fetchAll(true); return d })
  const updateDepartment = (id: number, body: Partial<Department>) =>
    api.patch<Department>(`/api/auth/departments/${id}/`, body).then(d => { fetchAll(true); return d })
  const deleteDepartment = (id: number) =>
    api.delete(`/api/auth/departments/${id}/`).then(() => fetchAll(true))

  // ── Positions ──
  const createPosition = (body: Partial<Position>) =>
    api.post<Position>('/api/auth/positions/', body).then(p => { fetchAll(true); return p })
  const updatePosition = (id: number, body: Partial<Position>) =>
    api.patch<Position>(`/api/auth/positions/${id}/`, body).then(p => { fetchAll(true); return p })
  const deletePosition = (id: number) =>
    api.delete(`/api/auth/positions/${id}/`).then(() => fetchAll(true))

  // ── Assign nhân sự ──
  const assignUserOrg = (userId: number, body: { department_ref?: number | null; position?: number | null }) =>
    api.patch(`/api/auth/users/${userId}/assign-org/`, body)

  return {
    departments, positions, loading,
    fetchAll,
    createDepartment, updateDepartment, deleteDepartment,
    createPosition, updatePosition, deletePosition,
    assignUserOrg,
  }
}

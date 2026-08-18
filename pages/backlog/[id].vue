<template>
  <div class="flex flex-col flex-1 min-h-0 h-full overflow-hidden">
    <!-- Toolbar -->
    <div
      class="flex-shrink-0 flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 border-b border-surface-200 dark:border-dark-50 bg-white dark:bg-dark-100"
    >
      <h2 class="font-semibold text-gray-900 dark:text-white text-sm hidden sm:block">
        Backlog
      </h2>
      <div class="hidden sm:block flex-1"></div>
      <input
        v-model="search"
        class="input py-1.5 w-full sm:w-52 text-sm order-first sm:order-none"
        placeholder="Tìm issue..."
      />
      <select v-model="typeFilter" class="input py-1.5 text-sm w-24 sm:w-28">
        <option value="">Tất cả</option>
        <option value="task">Task</option>
        <option value="bug">Bug</option>
        <option value="story">Story</option>
      </select>
      <!-- Bộ lọc trạng thái -->
      <select v-model="statusFilter" class="input py-1.5 text-sm w-28 hidden sm:block">
        <option value="">Trạng thái</option>
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="in_review">In Review</option>
        <option value="bug_fixing">Bug Fixing</option>
        <option value="done">Done</option>
      </select>

      <!-- Assignee filter dropdown -->
      <div class="relative">
        <button
          @click="showMemberDropdown = !showMemberDropdown"
          class="input py-1.5 text-sm w-28 flex items-center justify-between gap-1"
          :class="assigneeFilter ? 'border-brand-500 text-brand-600 dark:text-brand-400' : ''"
        >
          <span class="truncate">{{ selectedMemberName }}</span>
          <svg class="w-3 h-3 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>

        <div
          v-if="showMemberDropdown"
          v-click-outside="() => showMemberDropdown = false"
          class="absolute top-full mt-1 right-0 z-50 w-52 bg-white dark:bg-dark-100 rounded-xl shadow-lg border border-surface-200 dark:border-dark-50 overflow-hidden"
        >
          <!-- Search -->
          <div class="p-2 border-b border-surface-100 dark:border-dark-50">
            <input
              v-model="memberSearch"
              class="input py-1 text-xs w-full"
              placeholder="Tìm theo tên..."
              autofocus
            />
          </div>

          <!-- Options -->
          <div class="max-h-48 overflow-y-auto py-1">
            <button
              @click="assigneeFilter = ''; showMemberDropdown = false"
              class="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-surface-50 dark:hover:bg-dark-50 transition-colors"
              :class="!assigneeFilter ? 'text-brand-600 font-medium' : 'text-gray-700 dark:text-gray-300'"
            >
              Tất cả
            </button>

            <!-- Members -->
            <button
              v-for="m in filteredMembers"
              :key="m.user?.id"
              @click="assigneeFilter = m.user?.id; showMemberDropdown = false; memberSearch = ''"
              class="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-surface-50 dark:hover:bg-dark-50 transition-colors"
              :class="assigneeFilter === m.user?.id ? 'text-brand-600 font-medium' : 'text-gray-700 dark:text-gray-300'"
            >
              <div class="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                {{ m.user?.full_name?.charAt(0)?.toUpperCase() || '?' }}
              </div>
              <span class="truncate">{{ m.user?.full_name }}</span>
            </button>
          </div>
        </div>
      </div>

      <button v-if="canManage" @click="openCreateSprint()" class="btn-secondary btn-sm">
        <PlusIcon class="w-3.5 h-3.5" /> <span class="hidden sm:inline">Sprint</span>
      </button>
      <button v-if="canCreateIssue" @click="openCreateIssue()" class="btn-primary btn-sm">
        <PlusIcon class="w-3.5 h-3.5" /> <span class="hidden sm:inline">Issue</span>
      </button>
    </div>

    <!-- Split: Backlog (trái) | Sprint (phải) -->
    <div class="flex-1 flex flex-col lg:flex-row gap-4 p-4 min-h-0 overflow-hidden">
      <!-- Backlog column -->
      <div class="flex flex-col min-h-0 flex-1 basis-0 lg:w-1/2">
        <div class="card overflow-hidden flex flex-col min-h-0 flex-1">
          <div
            class="flex items-center gap-3 px-4 py-3 border-b border-surface-200 dark:border-dark-50 flex-shrink-0"
          >
            <input
              v-if="canManage && backlogIssuesMutable.length"
              type="checkbox"
              class="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer flex-shrink-0"
              :checked="allVisibleSelected"
              :indeterminate.prop="someSelected"
              title="Chọn / bỏ chọn tất cả"
              @change="toggleSelectAll"
            />
            <button
              type="button"
              class="flex items-center gap-2"
              @click="backlogOpen = !backlogOpen"
            >
              <ChevronRightIcon
                class="w-4 h-4 text-gray-400 transition-transform"
                :class="{ 'rotate-90': backlogOpen }"
              />
              <span class="font-semibold text-sm text-gray-900 dark:text-white">Backlog</span>
            </button>
            <span class="text-xs text-gray-400">{{ backlogTotal }} issues</span>
            <div class="flex-1" />
            <button type="button" class="btn-ghost btn-sm text-gray-400" @click="openCreateIssue()">
              <PlusIcon class="w-3.5 h-3.5" /> Thêm
            </button>
          </div>

          <!-- Thanh thao tác hàng loạt -->
          <div
            v-if="selectedIds.length"
            class="flex items-center gap-2 px-4 py-2 bg-brand-50 dark:bg-brand-950/20 border-b border-surface-200 dark:border-dark-50 flex-shrink-0 flex-wrap"
          >
            <span class="text-xs font-semibold text-brand-700 dark:text-brand-300">
              Đã chọn {{ selectedIds.length }} task
            </span>
            <div class="flex-1" />
            <select v-model="bulkTargetSprintId" class="input py-1 text-xs w-40">
              <option value="">Chọn sprint…</option>
              <option v-if="activeSprint" :value="activeSprint.id">{{ activeSprint.name }} (active)</option>
              <option v-for="s in planningSprints" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
            <button
              type="button"
              class="btn-primary btn-sm"
              :disabled="!bulkTargetSprintId || bulkMoving"
              @click="bulkMove"
            >
              {{ bulkMoving ? 'Đang chuyển…' : 'Chuyển sang sprint' }}
            </button>
            <button type="button" class="btn-secondary btn-sm" @click="clearSelection">Bỏ chọn</button>
          </div>

          <div v-show="backlogOpen" class="flex flex-col min-h-0 flex-1">
            <div class="flex-1 overflow-y-auto min-h-[200px] lg:min-h-0">
              <div v-if="backlogLoading" class="p-4 space-y-2">
                <div
                  v-for="i in 5"
                  :key="i"
                  class="h-10 bg-surface-100 dark:bg-dark-50 rounded animate-pulse"
                />
              </div>
              <div
                v-else-if="backlogIssuesMutable.length === 0"
                class="p-8 text-center text-sm text-gray-400"
              >
                <ClipboardDocumentListIcon class="w-8 h-8 mx-auto mb-2 text-gray-300" />
                Backlog trống. Kéo issue từ sprint về hoặc tạo mới!
              </div>
              <VueDraggable
                v-else
                v-model="backlogIssuesMutable"
                group="sprint-issues"
                class="divide-y divide-surface-100 dark:divide-dark-50 min-h-[80px]"
                ghost-class="sortable-ghost"
                :animation="150"
                @end="onBacklogDragEnd"
                @add="onBacklogIssueAdded"
              >
                <BacklogIssueRow
                  v-for="element in backlogIssuesMutable"
                  :key="element.id"
                  :data-id="element.id"
                  :issue="element"
                  :selectable="canManage"
                  :selected="selectedIds.includes(element.id)"
                  @click="selectedIssueId = element.id"
                  @toggle-select="toggleSelect(element.id)"
                  @quick-assign="quickAssign(element, $event)"
                />
              </VueDraggable>
            </div>

            <nav
              v-if="!backlogLoading && backlogTotal > 0"
              class="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-t border-surface-200 dark:border-dark-50 flex-shrink-0"
              aria-label="Phân trang backlog"
            >
              <p class="text-xs text-gray-500">
                {{ backlogRangeStart }}–{{ backlogRangeEnd }} / {{ backlogTotal }}
              </p>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="btn-secondary text-xs px-2 py-1"
                  :disabled="backlogPage <= 1 || backlogLoading"
                  @click="goToBacklogPage(backlogPage - 1)"
                >
                  Trước
                </button>
                <button
                  v-for="p in backlogVisiblePages"
                  :key="p"
                  type="button"
                  class="min-w-[1.75rem] px-1.5 py-1 text-xs rounded-lg"
                  :class="p === backlogPage ? 'bg-brand-600 text-white' : 'btn-secondary'"
                  :disabled="backlogLoading"
                  @click="goToBacklogPage(p)"
                >
                  {{ p }}
                </button>
                <button
                  type="button"
                  class="btn-secondary text-xs px-2 py-1"
                  :disabled="backlogPage >= backlogTotalPages || backlogLoading"
                  @click="goToBacklogPage(backlogPage + 1)"
                >
                  Sau
                </button>
              </div>
            </nav>
          </div>
        </div>
      </div>

      <!-- Sprint column -->
      <div class="flex flex-col min-h-0 flex-1 basis-0 lg:w-1/2 overflow-hidden">
        <p class="flex-shrink-0 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider lg:hidden mb-2">
          Sprint — kéo issue từ backlog sang đây
        </p>
        <div class="flex-1 min-h-0 overflow-y-auto overscroll-y-contain space-y-4 pr-1 -mr-1">
          <SprintSection
            v-if="activeSprint"
            :sprint="activeSprint"
            :issues="getSprintIssues(activeSprint.id)"
            :loading="sprintLoading"
            is-active
            @create-issue="openCreateIssue(activeSprint.id)"
            @complete-sprint="handleCompleteSprint"
            @issue-click="handleIssueClick"
            @issue-moved="moveIssueToSprint"
          />
          <SprintSection
            v-for="sprint in planningSprints"
            :key="sprint.id"
            :sprint="sprint"
            :issues="getSprintIssues(sprint.id)"
            :loading="sprintLoading"
            @create-issue="openCreateIssue(sprint.id)"
            @start-sprint="handleStartSprint(sprint)"
            @issue-click="handleIssueClick"
            @issue-moved="moveIssueToSprint"
          />
          <div v-if="completedSprints.length" class="space-y-3">
            <div class="flex items-center gap-2 px-1 pt-1">
              <div class="h-px flex-1 bg-surface-200 dark:bg-dark-50"></div>
              <span class="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Sprint đã hoàn thành
              </span>
              <div class="h-px flex-1 bg-surface-200 dark:bg-dark-50"></div>
            </div>
            <SprintSection
              v-for="sprint in completedSprints"
              :key="sprint.id"
              :sprint="sprint"
              :issues="getSprintIssues(sprint.id)"
              :loading="sprintLoading"
              is-completed
              read-only
              :initially-open="false"
              @issue-click="handleIssueClick"
            />
          </div>
          <div
            v-if="!activeSprint && !planningSprints.length && !completedSprints.length"
            class="card p-8 text-center text-sm text-gray-400"
          >
            Chưa có sprint. Tạo sprint để kéo issue từ backlog.
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->

    <IssueModal
      v-if="selectedIssueId"
      :issue-id="selectedIssueId"
      :require-due-date="!!pendingSprintMove || forceRequireDueDate"
      @close="onIssueModalClose"
      @updated="onIssueUpdated"
      @deleted="onIssueDeleted"
    />

    <CreateIssueModal
      v-if="showCreateIssue"
      :project-id="projectId"
      :sprint-id="createForSprintId"
      @close="showCreateIssue = false"
      @created="onIssueCreated"
    />

    <CreateSprintModal
      v-if="showCreateSprint"
      :project-id="projectId"
      @close="showCreateSprint = false"
      @created="onSprintCreated"
    />

    <CompleteSprintModal
      v-if="completingSprintId"
      :sprint-id="completingSprintId"
      :planning-sprints="planningSprints"
      @close="completingSprintId = null"
      @completed="onSprintCompleted"
    />
  </div>
</template>

<script setup lang="ts">
import {
  PlusIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/vue/24/outline";
import { VueDraggable } from "vue-draggable-plus";
import { useDebounceFn } from "@vueuse/core";
import { normalizeApiList } from "~/utils/apiList";
import { buildIssueListParams } from "~/utils/issueListParams";

definePageMeta({ middleware: ["auth", "project-member"] });

const route = useRoute();
const projectId = computed(() =>
  Number(route.params.id || route.query.project),
);

const projectsStore = useProjectsStore();
const issuesStore = useIssuesStore();
const api = useApi();
const toast = useToast();

const { canCreateIssue, canManage } = useProjectRole(projectId);

const search = ref("");
const searchApplied = ref("");
const typeFilter = ref("");
const statusFilter = ref("");

const assigneeFilter = ref<number | ''>('')
const members = ref<any[]>([])
const memberSearch = ref('')
const showMemberDropdown = ref(false)

const filteredMembers = computed(() => {
  if (!memberSearch.value) return members.value
  const q = memberSearch.value.toLowerCase()
  return members.value.filter(m => 
    m.user?.full_name?.toLowerCase().includes(q) ||
    m.user?.email?.toLowerCase().includes(q)
  )
})

const selectedMemberName = computed(() => {
  if (!assigneeFilter.value) return 'Assignee'
  const m = members.value.find(m => m.user?.id === assigneeFilter.value)
  return m?.user?.full_name || 'Assignee'
})

const backlogOpen = ref(true);
const backlogLoading = ref(true);
const sprintLoading = ref(true);
const backlogPage = ref(1);
const backlogPageSize = 500;
const backlogList = ref<any[]>([]);
const backlogTotal = ref(0);
const sprintIssuesAll = ref<any[]>([]);
const selectedIssueId = ref<number | null>(null);
const showCreateIssue = ref(false);
const showCreateSprint = ref(false);
const createForSprintId = ref<number | undefined>();
const completingSprintId = ref<number | null>(null);
const hasChanges = ref(false)
const pendingSprintMove = ref<{ issueId: number, sprintId: number } | null>(null);

const activeSprint = computed(() => projectsStore.activeSpring);
const planningSprints = computed(() => projectsStore.planningSprints);
const completedSprints = computed(() => projectsStore.completedSprints);
const forceRequireDueDate = ref(false)

const backlogIssuesMutable = ref<any[]>([]);

// ── Chọn nhiều & chuyển hàng loạt ──
const selectedIds = ref<number[]>([]);
const bulkTargetSprintId = ref<number | "">("");
const bulkMoving = ref(false);

const allVisibleSelected = computed(
  () =>
    backlogIssuesMutable.value.length > 0 &&
    backlogIssuesMutable.value.every((i) => selectedIds.value.includes(i.id)),
);
const someSelected = computed(
  () => selectedIds.value.length > 0 && !allVisibleSelected.value,
);

function toggleSelect(id: number) {
  const idx = selectedIds.value.indexOf(id);
  if (idx === -1) selectedIds.value.push(id);
  else selectedIds.value.splice(idx, 1);
}
function toggleSelectAll() {
  if (allVisibleSelected.value) {
    const visible = new Set(backlogIssuesMutable.value.map((i) => i.id));
    selectedIds.value = selectedIds.value.filter((id) => !visible.has(id));
  } else {
    const ids = new Set(selectedIds.value);
    backlogIssuesMutable.value.forEach((i) => ids.add(i.id));
    selectedIds.value = [...ids];
  }
}
function clearSelection() {
  selectedIds.value = [];
}

const backlogTotalPages = computed(() =>
  Math.max(1, Math.ceil(backlogTotal.value / backlogPageSize)),
);
const backlogRangeStart = computed(() =>
  backlogTotal.value === 0 ? 0 : (backlogPage.value - 1) * backlogPageSize + 1,
);
const backlogRangeEnd = computed(() =>
  Math.min(backlogPage.value * backlogPageSize, backlogTotal.value),
);
const backlogVisiblePages = computed(() => {
  const total = backlogTotalPages.value;
  const current = backlogPage.value;
  const window = 5;
  let start = Math.max(1, current - Math.floor(window / 2));
  let end = Math.min(total, start + window - 1);
  start = Math.max(1, end - window + 1);
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

const filteredSprintIssues = computed(() => {
  let issues = sprintIssuesAll.value;
  if (searchApplied.value) {
    const q = searchApplied.value.toLowerCase();
    issues = issues.filter(
      (i) =>
        i.title?.toLowerCase().includes(q) ||
        i.issue_key?.toLowerCase().includes(q),
    );
  }
  if (typeFilter.value) {
    issues = issues.filter((i) => i.issue_type === typeFilter.value);
  }
  if (assigneeFilter.value) {
    issues = issues.filter((i) => i.assignee?.id === assigneeFilter.value);
  }
  if (statusFilter.value) {
    issues = issues.filter((i) => i.status === statusFilter.value);
  }
  return issues;
});

watch(backlogList, (v) => {
  backlogIssuesMutable.value = [...v];
}, { immediate: true });

function buildBacklogFilters() {
  return buildIssueListParams({
    projectId: projectId.value,
    page: backlogPage.value,
    page_size: backlogPageSize,
    ordering: "position",
    sprint__isnull: true,
    q: searchApplied.value,
    issue_type: typeFilter.value,
    status: statusFilter.value,
    assignee: assigneeFilter.value ? Number(assigneeFilter.value) : undefined,
  });
}

function getSprintIssues(sprintId: number) {
  return filteredSprintIssues.value.filter((i) => i.sprint === sprintId);
}

function goToBacklogPage(p: number) {
  const next = Math.min(Math.max(1, p), backlogTotalPages.value);
  if (next === backlogPage.value) return;
  backlogPage.value = next;
  loadBacklog();
}

const applySearch = useDebounceFn(() => {
  searchApplied.value = search.value;
  backlogPage.value = 1;
  loadBacklog();
}, 300);

watch(search, () => applySearch());
watch([typeFilter, statusFilter, assigneeFilter], () => {
  backlogPage.value = 1;
  loadBacklog();
});

async function loadBacklog() {
  if (!projectId.value) return;
  backlogLoading.value = true;
  try {
    const data = await api.get<{ count?: number; results?: unknown[] }>(
      "/api/issues/",
      buildBacklogFilters(),
    );
    backlogList.value = normalizeApiList(data);
    backlogTotal.value =
      typeof data?.count === "number" ? data.count : backlogList.value.length;
  } catch {
    backlogList.value = [];
    backlogTotal.value = 0;
  } finally {
    backlogLoading.value = false;
  }
}

async function loadSprintIssues() {
  if (!projectId.value) return;
  sprintLoading.value = true;
  try {
    const data = await api.get("/api/issues/", {
      project: projectId.value,
      sprint__isnull: false,
      page_size: 500,
      ordering: "position",
    });
    sprintIssuesAll.value = normalizeApiList(data);
  } catch {
    sprintIssuesAll.value = [];
  } finally {
    sprintLoading.value = false;
  }
}

async function loadData() {
  if (!projectId.value) return;
  backlogPage.value = 1;
  searchApplied.value = search.value;
  await Promise.all([
    projectsStore.fetchSprints(projectId.value),
    api.get(`/api/projects/${projectId.value}/members/`).then((memberData: any) => {
      members.value = memberData.results || memberData;
    }),
  ]);
  await Promise.all([loadBacklog(), loadSprintIssues()]);
}

async function refreshIssueLists() {
  await Promise.all([loadBacklog(), loadSprintIssues()]);
}

function openCreateIssue(sprintId?: number) {
  createForSprintId.value = sprintId;
  showCreateIssue.value = true;
}

function openCreateSprint() {
  showCreateSprint.value = true;
}

function handleCompleteSprint(sprintId: number) {
  completingSprintId.value = sprintId;
}

async function handleStartSprint(sprint: any) {
  await projectsStore.startSprint(sprint.id);
  await loadSprintIssues();
}

function findIssueById(issueId: number) {
  return (
    backlogList.value.find((i) => i.id === issueId) ||
    sprintIssuesAll.value.find((i) => i.id === issueId)
  );
}

/**
 * Cập nhật cục bộ ngay (optimistic): chuyển issue giữa backlog ↔ sprint
 * trong state mà KHÔNG reload — để kéo liên tục không bị khựng.
 */
function applyLocalMove(issue: any, toSprintId: number | null) {
  const inBacklogBefore = backlogList.value.some((i) => i.id === issue.id);
  issue.sprint = toSprintId;
  backlogList.value = backlogList.value.filter((i) => i.id !== issue.id);
  sprintIssuesAll.value = sprintIssuesAll.value.filter((i) => i.id !== issue.id);
  if (toSprintId === null) {
    backlogList.value = [issue, ...backlogList.value];
    if (!inBacklogBefore) backlogTotal.value += 1;
  } else {
    sprintIssuesAll.value = [...sprintIssuesAll.value, issue];
    if (inBacklogBefore) backlogTotal.value = Math.max(0, backlogTotal.value - 1);
  }
}

async function moveIssueToSprint(issueId: number, sprintId: number | null) {
  const issue = findIssueById(issueId);
  if (!issue) return;

  // Vào sprint mà chưa có deadline → mở modal nhập (giữ luồng cũ)
  if (sprintId !== null && !issue.due_date) {
    selectedIssueId.value = issueId;
    pendingSprintMove.value = { issueId, sprintId };
    return;
  }

  const prevSprint = (issue.sprint ?? null) as number | null;
  if (prevSprint === sprintId) return; // không có thay đổi thực sự

  selectedIds.value = selectedIds.value.filter((x) => x !== issueId);
  applyLocalMove(issue, sprintId); // hiển thị ngay, không reload
  try {
    await issuesStore.updateIssue(issueId, { sprint: sprintId });
  } catch (e) {
    applyLocalMove(issue, prevSprint); // hoàn tác
    toast.error("Không lưu được thay đổi — đã hoàn tác.");
    await refreshIssueLists(); // đồng bộ lại với server cho chắc
  }
}

/** Chuyển nhiều task đã chọn sang 1 sprint cùng lúc (optimistic + lưu nền). */
async function bulkMove() {
  if (!bulkTargetSprintId.value || !selectedIds.value.length) return;
  const sprintId = Number(bulkTargetSprintId.value);
  const ids = [...selectedIds.value];
  const issues = ids.map(findIssueById).filter(Boolean);
  const snapshot = issues.map((i) => ({ issue: i, sprint: (i.sprint ?? null) as number | null }));

  bulkMoving.value = true;
  issues.forEach((i) => applyLocalMove(i, sprintId)); // optimistic
  clearSelection();
  try {
    const res = await api.post<any>("/api/issues/bulk-move/", {
      issue_ids: ids,
      sprint: sprintId,
    });
    const without = res?.without_due_date || 0;
    toast.success(
      `Đã chuyển ${res?.moved ?? ids.length} task sang sprint` +
        (without ? ` · ${without} task chưa có deadline, nên bổ sung` : ""),
    );
  } catch (e) {
    snapshot.forEach((s) => applyLocalMove(s.issue, s.sprint)); // hoàn tác
    toast.error("Chuyển hàng loạt thất bại — đã hoàn tác.");
    await refreshIssueLists();
  } finally {
    bulkMoving.value = false;
    bulkTargetSprintId.value = "";
  }
}

function handleIssueClick(issueId: number) {
  const issue = findIssueById(issueId);

  if (issue && issue.sprint && !issue.due_date) {
    pendingSprintMove.value = null
    selectedIssueId.value = issueId
    forceRequireDueDate.value = true
  } else {
    forceRequireDueDate.value = false
    selectedIssueId.value = issueId
  }
}

async function onIssueModalClose() {
  if (pendingSprintMove.value) {
    const pending = pendingSprintMove.value;
    pendingSprintMove.value = null;
    const latestIssue = await issuesStore.fetchIssue(pending.issueId).catch(() => null);
    if (latestIssue?.due_date) {
      await issuesStore.updateIssue(pending.issueId, { sprint: pending.sprintId });
    }
    hasChanges.value = false;
    await refreshIssueLists();
  }
  selectedIssueId.value = null;

  if (hasChanges.value) {
    hasChanges.value = false;
    await refreshIssueLists();
  }
}

function onBacklogIssueAdded(event: any) {
  const issueId = event.item?.getAttribute("data-id");
  if (issueId) {
    moveIssueToSprint(Number(issueId), null);
  }
}

async function onBacklogDragEnd(event: any) {
  // Could handle reorder here
}

async function quickAssign(issue: any, userId: number) {
  await issuesStore.updateIssue(issue.id, { assignee: userId });
  issue.assignee_id = userId;
}

async function onIssueCreated() {
  showCreateIssue.value = false;
  await refreshIssueLists();
}

function onIssueUpdated() {
  hasChanges.value = true;
}

function onIssueDeleted() {
  selectedIssueId.value = null;
  refreshIssueLists();
}

function onSprintCreated(sprint: any) {
  showCreateSprint.value = false;
}

function onSprintCompleted() {
  completingSprintId.value = null;
  loadData();
}

watch(projectId, () => {
  loadData();
});

onMounted(() => {
  loadData();
});
</script>

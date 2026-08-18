<template>
  <div class="flex flex-col flex-1 min-h-0 h-full overflow-hidden">
    <!-- Board toolbar -->
    <div
      class="flex-shrink-0 flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-surface-200 dark:border-dark-50 bg-white dark:bg-dark-100"
    >
      <h2 class="font-semibold text-gray-900 dark:text-white text-sm hidden sm:block">
        Kanban Board
      </h2>

      <!-- Sprint selector -->
      <select
        v-model="selectedSprintId"
        class="input py-1.5 w-36 sm:w-44 text-xs"
        @change="loadBoard"
      >
        <option value="">Backlog (không có sprint)</option>
        <option
          v-for="sprint in projectsStore.currentSprints"
          :key="sprint.id"
          :value="sprint.id"
        >
          {{ sprint.name }}
          <template v-if="sprint.status === 'active'"> 🟢</template>
        </option>
      </select>

      <input
        v-model="search"
        type="search"
        class="input py-1.5 text-xs w-full sm:w-44 order-first sm:order-none"
        :placeholder="isAdminOrManager ? 'Tìm mã, tiêu đề, tên người...' : 'Tìm issue (mã, tiêu đề)...'"
      />

      <div class="hidden sm:block flex-1"></div>

      <!-- Filters -->
      <div class="flex items-center gap-2 ml-auto flex-wrap justify-end">
        <button
          type="button"
          class="btn-secondary btn-sm !text-xs shrink-0"
          :class="myIssuesOnly && '!bg-brand-50 !text-brand-700 dark:!bg-brand-950/40 dark:!text-brand-200 ring-1 ring-brand-500/40'"
          :title="authStore.user?.full_name ? `Issues giao cho ${authStore.user.full_name}` : 'Issues của tôi'"
          @click="toggleMyIssues"
        >
          <UserIcon class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Của tôi</span>
        </button>

        <!-- Admin / quản lý: lọc theo mọi thành viên dự án -->
        <div v-if="isAdminOrManager" class="relative">
          <button
            type="button"
            class="input py-1.5 text-xs w-32 sm:w-36 flex items-center justify-between gap-1"
            :class="assigneeFilter ? 'border-brand-500 text-brand-600 dark:text-brand-400' : ''"
            @click="showMemberDropdown = !showMemberDropdown"
          >
            <span class="truncate">{{ selectedMemberLabel }}</span>
            <svg class="w-3 h-3 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            v-if="showMemberDropdown"
            v-click-outside="() => showMemberDropdown = false"
            class="absolute top-full mt-1 right-0 z-50 w-56 bg-white dark:bg-dark-100 rounded-xl shadow-lg border border-surface-200 dark:border-dark-50 overflow-hidden"
          >
            <div class="p-2 border-b border-surface-100 dark:border-dark-50">
              <input
                v-model="memberSearch"
                class="input py-1 text-xs w-full"
                placeholder="Tìm thành viên..."
                autofocus
              />
            </div>
            <div class="max-h-52 overflow-y-auto py-1">
              <button
                type="button"
                class="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-surface-50 dark:hover:bg-dark-50"
                :class="!assigneeFilter ? 'text-brand-600 font-medium' : 'text-gray-700 dark:text-gray-300'"
                @click="setAssigneeFilter('')"
              >
                Tất cả thành viên
              </button>
              <button
                type="button"
                class="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-surface-50 dark:hover:bg-dark-50"
                :class="assigneeFilter === 'unassigned' ? 'text-brand-600 font-medium' : 'text-gray-700 dark:text-gray-300'"
                @click="setAssigneeFilter('unassigned')"
              >
                Chưa giao (unassigned)
              </button>
              <button
                v-for="m in filteredMembers"
                :key="m.user?.id"
                type="button"
                class="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-surface-50 dark:hover:bg-dark-50"
                :class="assigneeFilter === m.user?.id ? 'text-brand-600 font-medium' : 'text-gray-700 dark:text-gray-300'"
                @click="setAssigneeFilter(m.user?.id)"
              >
                <UserAvatar :user="m.user" size="xs" class="w-5 h-5" />
                <span class="truncate text-left">
                  {{ m.user?.full_name }}
                  <span v-if="m.role" class="text-gray-400 ml-1">· {{ m.role }}</span>
                </span>
              </button>
              <p v-if="!filteredMembers.length" class="px-3 py-2 text-xs text-gray-400">Không tìm thấy thành viên</p>
            </div>
          </div>
        </div>

        <div v-else class="hidden md:flex -space-x-2">
          <button
            v-for="member in visibleMembers"
            :key="member.id"
            type="button"
            @click="toggleAssigneeFilter(member.id)"
            :title="member.full_name"
            class="w-7 h-7 rounded-full border-2 transition-all"
            :class="
              assigneeFilters.includes(member.id)
                ? 'border-brand-500 scale-110'
                : 'border-white dark:border-dark-100 opacity-60 hover:opacity-100'
            "
          >
            <UserAvatar :user="member" size="xs" />
          </button>
        </div>

        <select v-model="typeFilter" class="input py-1.5 text-xs w-24 sm:w-28">
          <option value="">All types</option>
          <option value="task">Task</option>
          <option value="bug">Bug</option>
          <option value="story">Story</option>
        </select>

        <button v-if="canCreateIssue" @click="showCreateIssue = true" class="btn-primary btn-sm">
          <PlusIcon class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Tạo Issue</span>
        </button>
      </div>
    </div>

    <div
      v-if="projectIntegrations?.drive?.linked"
      class="mx-3 sm:mx-4 mt-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex flex-wrap items-center gap-2"
    >
      <span>📁 Tài liệu BA phải nằm trong folder dự án — không dùng Drive cá nhân.</span>
      <NuxtLink
        :to="`/projects/${projectId}?tab=documents`"
        class="font-medium text-brand-600 hover:underline"
      >{{ projectIntegrations.drive.folder_name }}</NuxtLink>
      <a
        :href="projectIntegrations.drive.folder_url"
        target="_blank"
        rel="noopener"
        class="text-brand-600 hover:underline"
      >Mở Drive</a>
    </div>

    <!-- Board columns -->
    <div class="flex-1 overflow-x-auto overflow-y-hidden">
      <div class="flex gap-3 p-4 h-full">
        <div v-for="col in columns" :key="col.key" class="kanban-col">
          <!-- Column header -->
          <div class="flex items-center justify-between px-3 py-2.5">
            <div class="flex items-center gap-2">
              <span :class="`status-${col.key}`">{{ col.label }}</span>
              <span class="text-xs font-medium text-gray-400">{{
                filteredBoard[col.key]?.length || 0
              }}</span>
            </div>
            <button
              @click="quickCreateIssue(col.key)"
              class="btn-icon btn-ghost p-1 opacity-0 group-hover:opacity-100 hover:opacity-100"
            >
              <PlusIcon class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Cards -->
          <div class="flex-1 overflow-y-auto px-2 pb-2">
            <VueDraggable
              v-model="boardLocal[col.key]"
              group="issues"
              class="min-h-[100px] space-y-2"
              ghost-class="sortable-ghost"
              drag-class="sortable-drag"
              :animation="150"
              :data-status="col.key"
              @end="onDragEnd($event, col.key)"
            >
              <div
                v-for="element in boardLocal[col.key] || []"
                v-show="matchesFilter(element)"
                :key="element.id"
                :data-id="element.id"
              >
                <IssueCard
                  :issue="element"
                  @click="selectedIssueId = element.id"
                  @update="onIssueUpdated"
                />
              </div>
            </VueDraggable>
          </div>
        </div>
      </div>
    </div>

    <!-- Issue detail modal -->
    <IssueModal
      v-if="selectedIssueId"
      :issue-id="selectedIssueId"
      @close="selectedIssueId = null"
      @updated="onIssueUpdated"
      @deleted="onIssueDeleted"
    />

    <!-- Create issue modal -->
    <CreateIssueModal
      v-if="showCreateIssue"
      :project-id="projectId"
      :sprint-id="selectedSprintId || undefined"
      :default-status="createIssueStatus"
      @close="showCreateIssue = false"
      @created="onIssueCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, UserIcon } from "@heroicons/vue/24/outline";
import { VueDraggable } from "vue-draggable-plus";

definePageMeta({ middleware: ["auth", "project-member"] });

const route = useRoute();
const projectId = computed(() =>
  Number(route.params.id || route.query.project),
);

const projectsStore = useProjectsStore();
const issuesStore = useIssuesStore();
const authStore = useAuthStore();
const api = useApi();

const { canCreateIssue, canManage } = useProjectRole(projectId);

const isAdminOrManager = computed(
  () => authStore.user?.role === "admin" || canManage.value,
);

const selectedSprintId = ref<number | "">("");
const selectedIssueId = ref<number | null>(null);
const showCreateIssue = ref(false);
const createIssueStatus = ref("todo");
const assigneeFilters = ref<number[]>([]);
const assigneeFilter = ref<number | "" | "unassigned">("");
const members = ref<any[]>([]);
const memberSearch = ref("");
const showMemberDropdown = ref(false);
const typeFilter = ref("");
const search = ref("");
const myIssuesOnly = ref(false);
const projectIntegrations = ref<any>(null);

const filteredMembers = computed(() => {
  if (!memberSearch.value.trim()) return members.value;
  const q = memberSearch.value.trim().toLowerCase();
  return members.value.filter(
    (m) =>
      m.user?.full_name?.toLowerCase().includes(q) ||
      m.user?.email?.toLowerCase().includes(q) ||
      m.user?.username?.toLowerCase().includes(q),
  );
});

const selectedMemberLabel = computed(() => {
  if (!assigneeFilter.value) return "Thành viên";
  if (assigneeFilter.value === "unassigned") return "Chưa giao";
  const m = members.value.find((x) => x.user?.id === assigneeFilter.value);
  return m?.user?.full_name || "Thành viên";
});

const columns = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "in_review", label: "Chờ Test" },
  { key: "testing", label: "Đang Test" },
  { key: "bug_fixing", label: "Sửa Lỗi" },
  { key: "done", label: "Done" },
];

const boardLocal = ref<Record<string, any[]>>({
  todo: [],
  in_progress: [],
  in_review: [],
  testing: [],
  bug_fixing: [],
  done: [],
});

// boardLocal defined above with columns

function matchesFilter(issue: any) {
  if (myIssuesOnly.value) {
    const uid = authStore.user?.id;
    if (!uid || issue.assignee?.id !== uid) return false;
  }
  if (isAdminOrManager.value && assigneeFilter.value) {
    if (assigneeFilter.value === "unassigned") {
      if (issue.assignee?.id) return false;
    } else if (issue.assignee?.id !== assigneeFilter.value) {
      return false;
    }
  } else if (assigneeFilters.value.length) {
    if (!assigneeFilters.value.includes(issue.assignee?.id)) return false;
  }
  if (typeFilter.value && issue.issue_type !== typeFilter.value) return false;
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase();
    const key = (issue.issue_key || "").toLowerCase();
    const title = (issue.title || "").toLowerCase();
    const name = (issue.assignee?.full_name || "").toLowerCase();
    const email = (issue.assignee?.email || "").toLowerCase();
    const matchText =
      key.includes(q) ||
      title.includes(q) ||
      (isAdminOrManager.value && (name.includes(q) || email.includes(q)));
    if (!matchText) return false;
  }
  return true;
}

function setAssigneeFilter(value: number | "" | "unassigned") {
  assigneeFilter.value = value;
  assigneeFilters.value = [];
  myIssuesOnly.value = false;
  showMemberDropdown.value = false;
  memberSearch.value = "";
  if (typeof value === "number" && value === authStore.user?.id) {
    myIssuesOnly.value = true;
  }
}

async function loadProjectMembers() {
  if (!projectId.value || !isAdminOrManager.value) return;
  try {
    const data = await api.get(`/api/projects/${projectId.value}/members/`);
    members.value = data.results || data || [];
  } catch {
    members.value =
      projectsStore.currentProject?.project_members ||
      projectsStore.currentProject?.members ||
      [];
  }
}

const filteredBoard = computed(() => {
  const result: Record<string, any[]> = {};
  for (const col of columns) {
    result[col.key] = (boardLocal.value[col.key] || []).filter(matchesFilter);
  }
  return result;
});

function toggleMyIssues() {
  const uid = authStore.user?.id;
  if (!uid) return;
  myIssuesOnly.value = !myIssuesOnly.value;
  if (myIssuesOnly.value) {
    assigneeFilters.value = [];
    assigneeFilter.value = uid;
  } else {
    if (assigneeFilter.value === uid) assigneeFilter.value = "";
    if (assigneeFilters.value.length === 1 && assigneeFilters.value[0] === uid) {
      assigneeFilters.value = [];
    }
  }
}

const visibleMembers = computed(() => {
  const members =
    projectsStore.currentProject?.project_members?.map((m: any) => m.user) ||
    [];
  return members.slice(0, 5);
});

async function loadBoard() {
  if (!projectId.value) return;
  await issuesStore.fetchBoard(
    projectId.value,
    selectedSprintId.value ? Number(selectedSprintId.value) : undefined,
  );
  boardLocal.value = {
    todo: [...(issuesStore.boardData.todo || [])],
    in_progress: [...(issuesStore.boardData.in_progress || [])],
    in_review: [...(issuesStore.boardData.in_review || [])],
    testing: [...(issuesStore.boardData.testing || [])],
    bug_fixing: [...(issuesStore.boardData.bug_fixing || [])],
    done: [...(issuesStore.boardData.done || [])],
  };
}

async function onDragEnd(event: any) {
  const issueId = event.item?.getAttribute("data-id");
  if (!issueId) return;

  // lấy status cột đích
  const toStatus = event.to?.getAttribute("data-status");

  // lấy status cột nguồn (nếu cần)
  const fromStatus = event.from?.getAttribute("data-status");

  const position = event.newIndex;

  // update local item status luôn để tránh lệch state
  const movedIssue = Object.values(boardLocal.value)
    .flat()
    .find((i: any) => i.id == issueId);

  if (movedIssue) {
    movedIssue.status = toStatus;
  }

  await issuesStore.moveIssue(issueId, {
    status: toStatus,
    position,
  });
}

function toggleAssigneeFilter(userId: number) {
  const idx = assigneeFilters.value.indexOf(userId);
  if (idx === -1) assigneeFilters.value.push(userId);
  else assigneeFilters.value.splice(idx, 1);
  const uid = authStore.user?.id;
  if (uid) {
    myIssuesOnly.value =
      assigneeFilters.value.length === 1 && assigneeFilters.value[0] === uid;
  }
}

function quickCreateIssue(status: string) {
  createIssueStatus.value = status;
  showCreateIssue.value = true;
}

function onIssueCreated(issue: any) {
  showCreateIssue.value = false;
  boardLocal.value[issue.status]?.unshift(issue);
}

function onIssueUpdated(updated: any) {
  for (const col of columns) {
    const idx = boardLocal.value[col.key]?.findIndex(
      (i: any) => i.id === updated.id,
    );
    if (idx !== -1) {
      if (col.key === updated.status) {
        boardLocal.value[col.key][idx] = updated;
      } else {
        boardLocal.value[col.key].splice(idx, 1);
        boardLocal.value[updated.status]?.unshift(updated);
      }
    }
  }
  selectedIssueId.value = null;
}

function onIssueDeleted(id: number) {
  for (const col of columns) {
    boardLocal.value[col.key] = boardLocal.value[col.key]?.filter(
      (i: any) => i.id !== id,
    );
  }
  selectedIssueId.value = null;
}

onMounted(async () => {
  if (projectId.value) {
    await Promise.all([
      projectsStore.fetchProject(projectId.value),
      projectsStore.fetchSprints(projectId.value),
    ]);
    await loadProjectMembers();
    try {
      projectIntegrations.value = await api.get(`/api/projects/${projectId.value}/integrations/`);
    } catch { /* ignore */ }
    const active = projectsStore.activeSpring;
    if (active) selectedSprintId.value = active.id;
  }
  await loadBoard();
});

watch(projectId, async () => {
  await loadProjectMembers();
  await loadBoard();
});
</script>

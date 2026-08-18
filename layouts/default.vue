<template>
  <div class="flex h-screen overflow-hidden bg-surface-50 dark:bg-dark-200">
    <!-- Mobile backdrop -->
    <Transition name="fade">
      <div
        v-if="isMobile && sidebarOpen"
        @click="sidebarOpen = false"
        class="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
      ></div>
    </Transition>

    <!-- Sidebar -->
    <aside
      class="flex flex-col bg-white dark:bg-dark-100 border-r border-surface-200 dark:border-dark-50 transition-all duration-200 z-40
             lg:relative lg:flex-shrink-0
             fixed inset-y-0 left-0"
      :class="[
        sidebarOpen ? 'w-60 translate-x-0' : 'w-14 -translate-x-full lg:translate-x-0',
      ]"
    >
      <!-- Logo -->
      <div
        class="flex items-center px-3 py-4 border-b border-surface-200 dark:border-dark-50"
      >
        <AppLogo :compact="!sidebarOpen" />
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto p-2 space-y-0.5">
        <template v-for="item in navItems" :key="item.to">
          <NuxtLink :to="item.to" custom v-slot="{ isActive, navigate }">
            <div
              @click="navigate"
              :class="isActive ? 'nav-item-active' : 'nav-item'"
              :title="!sidebarOpen ? item.label : ''"
            >
              <div class="relative flex-shrink-0">
                <component :is="item.icon" class="w-4 h-4" />
                <span
                  v-if="item.badge && item.badge.value > 0"
                  class="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none"
                >
                  {{ item.badge.value > 9 ? "9+" : item.badge.value }}
                </span>
              </div>
              <span v-if="sidebarOpen" class="truncate flex-1">{{
                item.label
              }}</span>
              <span
                v-if="sidebarOpen && item.badge && item.badge.value > 0"
                class="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none flex-shrink-0"
                >{{ item.badge.value }}</span
              >
            </div>
          </NuxtLink>
        </template>

        <!-- Projects section -->
        <div v-if="sidebarOpen" class="pt-4">
          <div class="flex items-center justify-between px-3 mb-1">
            <span
              class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
              >Projects</span
            >
            <button
              v-if="isAdmin"
              @click="showCreateProject = true"
              class="btn-ghost btn-icon p-0.5"
              title="Tạo project (Admin)"
            >
              <PlusIcon class="w-3.5 h-3.5" />
            </button>
          </div>
          <div
            v-for="project in projectsStore.projects.slice(0, 6)"
            :key="project.id"
          >
            <NuxtLink
              :to="`/projects/${project.id}`"
              custom
              v-slot="{ isActive, navigate }"
            >
              <div
                @click="navigate"
                :class="isActive ? 'nav-item-active' : 'nav-item'"
                class="pl-3"
              >
                <span
                  class="w-4 h-4 rounded text-xs font-bold flex items-center justify-center bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300 flex-shrink-0"
                >
                  {{ project.key[0] }}
                </span>
                <span class="truncate text-xs">{{ project.name }}</span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </nav>

      <Button
        @click="sidebarOpen = !sidebarOpen"
        :class="[
          'absolute right-3 bottom-16 mb-2 btn-ghost p-1 flex items-center justify-center gap-2 bg-transparent transition-all duration-300 overflow-hidden border border-gray-300 dark:border-gray-500 hover:border-gray-400 dark:hover:border-gray-400',
          sidebarOpen ? 'w-8' : 'w-8 justify-center',
        ]"
      >
        <ChevronLeftIcon v-if="sidebarOpen" class="w-4 h-4" />
        <ChevronRightIcon v-else class="w-4 h-4" />
      </Button>

      <!-- User -->
      <div class="border-t border-surface-200 dark:border-dark-50 p-2">
        <div class="relative" ref="userMenuRef">
          <button
            @click="userMenuOpen = !userMenuOpen"
            class="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-surface-100 dark:hover:bg-dark-50 transition-colors"
          >
            <UserAvatar :user="authStore.user" size="sm" />
            <div v-if="sidebarOpen" class="flex-1 text-left min-w-0">
              <div
                class="text-xs font-medium text-gray-900 dark:text-white truncate"
              >
                {{ authStore.user?.full_name }}
              </div>
              <div class="text-xs text-gray-400 truncate">
                {{ authStore.user?.role }}
              </div>
            </div>
          </button>
          <!-- User dropdown -->
          <Transition name="scale-in">
            <div
              v-if="userMenuOpen"
              class="absolute bottom-full left-0 mb-1 w-48 card shadow-modal z-50 py-1 animate-scale-in"
            >
              <NuxtLink
                to="/settings/profile"
                class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-surface-100 dark:hover:bg-dark-50"
              >
                <UserCircleIcon class="w-4 h-4" /> Hồ sơ
              </NuxtLink>
              <NuxtLink
                to="/settings"
                class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-surface-100 dark:hover:bg-dark-50"
              >
                <Cog6ToothIcon class="w-4 h-4" /> Cài đặt
              </NuxtLink>
              <div
                class="border-t border-surface-200 dark:border-dark-50 my-1"
              ></div>
              <button
                @click="handleLogout"
                class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <ArrowRightOnRectangleIcon class="w-4 h-4" /> Đăng xuất
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Top bar -->
      <header
        class="flex-shrink-0 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 bg-white dark:bg-dark-100 border-b border-surface-200 dark:border-dark-50"
      >
        <!-- Hamburger (mobile only) -->
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="btn-icon btn-ghost lg:hidden"
          :aria-label="sidebarOpen ? 'Đóng menu' : 'Mở menu'"
        >
          <Bars3Icon class="w-5 h-5" />
        </button>

        <div class="flex-1"></div>

        <!-- Search (full button on sm+, icon-only on mobile) -->
        <button
          @click="showSearch = true"
          class="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 bg-surface-100 dark:bg-dark-50 rounded-lg hover:bg-surface-200 dark:hover:bg-dark-50 transition-colors w-40 md:w-48"
        >
          <MagnifyingGlassIcon class="w-4 h-4" />
          <span class="hidden md:inline">Tìm kiếm...</span>
          <span class="md:hidden">Tìm</span>
          <kbd
            class="ml-auto hidden md:inline-block text-xs bg-white dark:bg-dark-100 px-1.5 py-0.5 rounded border border-gray-200 dark:border-dark-50"
            >⌘K</kbd
          >
        </button>
        <button
          @click="showSearch = true"
          class="btn-icon btn-ghost sm:hidden"
          aria-label="Tìm kiếm"
        >
          <MagnifyingGlassIcon class="w-4 h-4" />
        </button>

        <!-- Dark mode -->
        <button @click="toggleDark()" class="btn-icon btn-ghost">
          <SunIcon v-if="isDark" class="w-4 h-4" />
          <MoonIcon v-else class="w-4 h-4" />
        </button>

        <!-- Notifications -->
        <div class="relative" ref="notifRef">
          <button
            @click="notifOpen = !notifOpen"
            class="btn-icon btn-ghost relative"
          >
            <BellIcon class="w-4 h-4" />
            <span
              v-if="unreadCount > 0"
              class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center leading-none"
            >
              {{ unreadCount > 9 ? "9+" : unreadCount }}
            </span>
          </button>
          <NotificationsPanel v-if="notifOpen" @close="notifOpen = false" />
        </div>
      </header>

      <!-- Idle (no in-progress task) warning banner -->
      <IdleTaskWarning v-if="authStore.isAuthenticated" />

      <!-- Deadline warning banner (fixed top) -->
      <DeadlineWarningBanner v-if="showDeadlineBanner" />

      <!-- Page content -->
      <main
        class="flex-1 min-h-0 pt-0"
        :class="mainScrollLocked ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'"
      >
        <slot />
      </main>
    </div>

    <!-- Modals -->
    <CreateProjectModal
      v-if="isAdmin && showCreateProject"
      @close="showCreateProject = false"
      @created="onProjectCreated"
    />
    <GlobalSearch v-if="showSearch" @close="showSearch = false" />
    <ToastContainer />
    <ImageLightbox />
    <DailyReportReminder />
  </div>
</template>

<script setup lang="ts">
import {
  HomeIcon,
  RectangleGroupIcon,
  ListBulletIcon,
  ChartBarIcon,
  UsersIcon,
  PlusIcon,
  BellIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ClockIcon,
  CodeBracketIcon,
  FolderIcon,
  SwatchIcon,
  Bars3Icon,
  BanknotesIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/vue/24/outline";
import { useDark, useToggle, onClickOutside, useMediaQuery } from "@vueuse/core";
import { BeakerIcon } from "@heroicons/vue/24/outline";
import { isPayrollViewerEmail } from "~/utils/payrollViewerEmails";
defineOptions({ middleware: "auth" });

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.user?.role === "admin");
const projectsStore = useProjectsStore();
const notificationsStore = useNotificationsStore();
const router = useRouter();
const route = useRoute();
const api = useApi();

/** Backlog/Board tự scroll bên trong — không để main cuộn cả trang. */
const mainScrollLocked = computed(() =>
  /^\/backlog\/\d+/.test(route.path) || /^\/board\/\d+/.test(route.path),
);

const isDark = useDark();
const toggleDark = useToggle(isDark);
const isMobile = useMediaQuery('(max-width: 1023px)');  // < lg breakpoint
const sidebarOpen = ref(true);

// Auto-collapse on mobile by default
watch(isMobile, (mobile: boolean) => {
  sidebarOpen.value = !mobile;
}, { immediate: true });

// Close sidebar after navigation on mobile
const currentRoute = useRoute();
watch(() => currentRoute.fullPath, () => {
  if (isMobile.value) sidebarOpen.value = false;
});
const userMenuOpen = ref(false);
const notifOpen = ref(false);
const showCreateProject = ref(false);
const showSearch = ref(false);
const unreadCount = computed(() => notificationsStore.unreadCount);
const overdueCount = ref(0);
const qaQueueCount = ref(0);

const userMenuRef = ref(null);
const notifRef = ref(null);
onClickOutside(userMenuRef, () => (userMenuOpen.value = false));
onClickOutside(notifRef, () => (notifOpen.value = false));

const config = useRuntimeConfig();
const showPayrollNav = computed(() =>
  isPayrollViewerEmail(
    authStore.user?.email,
    config.public.payrollViewerEmails as string | undefined,
  ),
);
const reportAnalyticsAccess = useReportAnalyticsAccess();
// Email analyst HOẶC nhân sự HCNS/HR (cờ từ BE)
const showReportAnalytics = computed(() => reportAnalyticsAccess.canView.value);

const navItems = computed(() => {
  const items = [
    { to: "/", label: "Dashboard", icon: HomeIcon },
    { to: "/projects", label: "Projects", icon: RectangleGroupIcon },
    { to: "/my-issues", label: "My Issues", icon: ListBulletIcon },
    { to: "/daily-report", label: "Báo cáo ngày", icon: ClipboardDocumentCheckIcon },
    { to: "/qa-queue", label: "QA Queue", icon: BeakerIcon, badge: qaQueueCount },
    { to: "/deadline", label: "Deadline", icon: ClockIcon, badge: overdueCount },
    { to: "/reports", label: "Reports", icon: ChartBarIcon },
    { to: "/github", label: "GitHub", icon: CodeBracketIcon },
  ];
  items.push(
    { to: "/integrations/drive", label: "Google Drive", icon: FolderIcon },
    { to: "/integrations/figma", label: "Figma", icon: SwatchIcon },
    { to: "/qa-reports", label: "QA Reports", icon: ChartBarIcon },
    { to: "/members", label: "Members", icon: UsersIcon },
  )
  if (showPayrollNav.value) {
    items.splice(6, 0, { to: "/payroll", label: "Lương khoán", icon: BanknotesIcon });
  }
  if (showReportAnalytics.value) {
    items.push({ to: "/report-tracking", label: "Theo dõi báo cáo", icon: ClipboardDocumentCheckIcon });
    items.push({ to: "/daily-report-analytics", label: "Phân tích báo cáo", icon: ChartBarIcon });
  }
  return items;
});

const showDeadlineBanner = computed(() => {
  return ["/my-issues", "/deadline"].includes(route.path);
});
async function loadOverdueCount() {
  if (!authStore.isAuthenticated) return;
  try {
    const [overdueData, qaData] = await Promise.all([
      api.get("/api/deadlines/overdue_issues/", { count_only: 1 }),
      api.get("/api/issues/qa_queue/", { count_only: 1 }),
    ]);
    overdueCount.value = overdueData?.count ?? overdueData?.issues?.length ?? 0;
    qaQueueCount.value = qaData?.count ?? qaData?.issues?.length ?? 0;
  } catch {}
}

onMounted(async () => {
  projectsStore.fetchProjects().catch(() => {});
  reportAnalyticsAccess.ensureLoaded();
  loadOverdueCount();
  notificationsStore.fetchUnreadCount();
  notificationsStore.connectWebSocket();
  // Refresh overdue count every 5 min
  const t = setInterval(loadOverdueCount, 5 * 60 * 1000);
  onUnmounted(() => {
    clearInterval(t);
    notificationsStore.disconnectWebSocket();
  });
});

// Reconnect WebSocket whenever the access token rotates (refresh flow)
watch(() => authStore.accessToken, (token: string | null) => {
  if (token) notificationsStore.connectWebSocket(token)
  else notificationsStore.disconnectWebSocket()
})

async function handleLogout() {
  notificationsStore.disconnectWebSocket();
  await authStore.logout();
  router.push("/login");
}

function onProjectCreated(project: any) {
  showCreateProject.value = false;
  router.push(`/projects/${project.id}`);
}

// Keyboard shortcut
onMounted(() => {
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      showSearch.value = true;
    }
  });
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

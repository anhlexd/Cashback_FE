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
      class="flex flex-col bg-gradient-to-b from-white via-white to-orange-50/40 dark:from-dark-100 dark:via-dark-100 dark:to-dark-100 border-r border-surface-200 dark:border-dark-50 shadow-[4px_0_24px_rgba(0,0,0,.03)] transition-all duration-200 z-40
             lg:relative lg:flex-shrink-0
             fixed inset-y-0 left-0"
      :class="[
        sidebarOpen ? 'w-60 translate-x-0' : 'w-14 -translate-x-full lg:translate-x-0',
      ]"
    >
      <!-- Logo -->
      <div
        class="relative flex items-center justify-center px-3 py-5 border-b border-surface-200 dark:border-dark-50"
      >
        <div
          class="pointer-events-none absolute inset-x-6 top-0 h-14 rounded-full bg-brand-300/30 blur-2xl dark:bg-brand-900/20"
        />
        <AppLogo :compact="!sidebarOpen" class="relative" />
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto p-2.5 space-y-0.5">
        <template v-for="(section, sIdx) in navSections" :key="section.title">
          <div
            v-if="sidebarOpen"
            class="px-3 pt-4 pb-1.5 text-[10px] font-bold tracking-wider text-gray-400 uppercase"
            :class="{ 'mt-1': sIdx > 0 }"
          >
            {{ section.title }}
          </div>
          <div
            v-else-if="sIdx > 0"
            class="my-2 border-t border-surface-200 dark:border-dark-50"
          ></div>

          <template v-for="item in section.items" :key="item.to">
            <NuxtLink :to="item.to" custom v-slot="{ isActive, navigate }">
              <div
                @click="navigate"
                :class="[isActive ? 'nav-item-active' : 'nav-item', 'group']"
                :title="!sidebarOpen ? item.label : ''"
              >
                <div
                  class="relative flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors"
                  :class="isActive ? 'bg-white/20' : 'group-hover:bg-brand-50 dark:group-hover:bg-brand-950/40'"
                >
                  <component :is="item.icon" class="w-4 h-4" />
                </div>
                <span v-if="sidebarOpen" class="text-sm font-semibold truncate flex-1">{{
                  item.label
                }}</span>
                <span
                  v-if="sidebarOpen && item.badge"
                  class="ml-auto flex-shrink-0 rounded-md bg-gradient-to-r from-amber-400 to-orange-400 px-1.5 py-0.5 text-[10px] font-bold text-white whitespace-nowrap shadow-sm"
                >
                  {{ item.badge }}
                </span>
              </div>
            </NuxtLink>
          </template>
        </template>
      </nav>

      <button
        type="button"
        @click="sidebarOpen = !sidebarOpen"
        class="absolute -right-3 bottom-20 z-10 grid h-6 w-6 place-items-center rounded-full border border-surface-200 bg-white text-gray-500 shadow-[0_4px_12px_rgba(0,0,0,.1)] transition-all hover:border-brand-300 hover:text-brand-600 dark:border-dark-50 dark:bg-dark-100 dark:text-gray-400"
      >
        <ChevronLeftIcon v-if="sidebarOpen" class="w-3.5 h-3.5" />
        <ChevronRightIcon v-else class="w-3.5 h-3.5" />
      </button>

      <!-- User -->
      <div class="border-t border-surface-200 dark:border-dark-50 p-2.5">
        <div class="relative" ref="userMenuRef">
          <button
            @click="userMenuOpen = !userMenuOpen"
            class="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,.05)] dark:hover:bg-dark-50 transition-all"
          >
            <div class="relative flex-shrink-0">
              <div class="absolute -inset-0.5 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 opacity-70" />
              <UserAvatar :user="authStore.user" size="sm" class="relative" />
            </div>
            <div v-if="sidebarOpen" class="flex-1 text-left min-w-0">
              <div
                class="text-xs font-semibold text-gray-900 dark:text-white truncate"
              >
                {{ authStore.user?.fullname }}
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
              class="absolute bottom-full left-0 mb-2 w-48 rounded-2xl border border-surface-200 bg-white shadow-[0_16px_40px_rgba(0,0,0,.12)] z-50 py-1.5 animate-scale-in dark:border-dark-50 dark:bg-dark-100"
            >
              <NuxtLink
                to="/settings/profile"
                class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-950/40 dark:hover:text-brand-300"
              >
                <UserCircleIcon class="w-4 h-4" /> Hồ sơ
              </NuxtLink>
              <NuxtLink
                to="/settings"
                class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-950/40 dark:hover:text-brand-300"
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
        class="flex-shrink-0 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 bg-white/80 backdrop-blur-xl dark:bg-dark-100/80 border-b border-surface-200 dark:border-dark-50"
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

        <!-- Dark mode -->
        <button
          @click="toggleDark()"
          class="btn-icon rounded-xl text-gray-500 hover:bg-brand-50 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-brand-950/40 dark:hover:text-brand-300 transition-colors"
        >
          <SunIcon v-if="isDark" class="w-4 h-4" />
          <MoonIcon v-else class="w-4 h-4" />
        </button>

        <!-- Notifications -->
        <div class="relative" ref="notifRef">
          <button
            @click="notifOpen = !notifOpen"
            class="btn-icon relative rounded-xl text-gray-500 hover:bg-brand-50 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-brand-950/40 dark:hover:text-brand-300 transition-colors"
            :class="notifOpen ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300' : ''"
          >
            <BellIcon class="w-4 h-4" />
            <span
              v-if="unreadCount > 0"
              class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-gradient-to-br from-red-500 to-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none shadow-sm ring-2 ring-white dark:ring-dark-100"
            >
              {{ unreadCount > 9 ? "9+" : unreadCount }}
            </span>
          </button>
          <NotificationsPanel v-if="notifOpen" @close="notifOpen = false" />
        </div>
      </header>

      <!-- Page content -->
      <main
        class="flex-1 min-h-0 pt-0"
        :class="mainScrollLocked ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'"
      >
        <slot />
      </main>
    </div>

    <!-- Modals -->
    <ToastContainer />
    <ImageLightbox />
  </div>
</template>

<script setup lang="ts">
import {
  HomeIcon,
  CubeIcon,
  HandThumbUpIcon,
  TicketIcon,
  BellIcon,
  WalletIcon,
  UserGroupIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  SunIcon,
  MoonIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ShieldCheckIcon,
} from "@heroicons/vue/24/outline";
import { useDark, useToggle, onClickOutside, useMediaQuery } from "@vueuse/core";

defineOptions({ middleware: "auth" });

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

/** Nếu trang nào cần tự cuộn bên trong thay vì cuộn cả layout, thêm path vào đây. */
const mainScrollLocked = computed(() => false);

const isDark = useDark();
const toggleDark = useToggle(isDark);
const isMobile = useMediaQuery('(max-width: 1023px)'); // < lg breakpoint
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
const unreadCount = computed(() => notificationsStore.unreadCount);

const notificationsStore = useNotificationsStore();

const userMenuRef = ref(null);
const notifRef = ref(null);
onClickOutside(userMenuRef, () => (userMenuOpen.value = false));
onClickOutside(notifRef, () => (notifOpen.value = false));

// Menu sidebar: 2 nhóm "Hệ thống" và "Giải trí & phụ", khớp thiết kế
// + nhóm "Quản trị" chỉ hiện với admin (is_staff)
const navSections = computed(() => [
  {
    title: "Hệ thống",
    items: [
      // { to: "/", label: "Trang chủ", icon: HomeIcon },
      { to: "/dashboard", label: "Trang chủ", icon: HomeIcon },
      { to: "/purchase-history", label: "Lịch sử mua hàng", icon: CubeIcon },
      { to: "/shopping", label: "Tích MOON, rinh Money", icon: HomeIcon },
      { to: "/whats-new", label: "Hôm nay có gì?", icon: HandThumbUpIcon },
    ],
  },
  {
    title: "Giải trí & phụ",
    items: [
      { to: "/vouchers", label: "Mã Voucher", icon: TicketIcon, badge: "Đang thử nghiệm" },
      { to: "/notifications", label: "Thông báo", icon: BellIcon },
      { to: "/wallet", label: "Ví MOON", icon: WalletIcon },
      { to: "/invite", label: "Mời bạn bè", icon: UserGroupIcon },
      { to: "/lucky-spin", label: "Vòng quay may mắn", icon: ArrowPathIcon },
      { to: "/aboutus", label: "Về chúng tôi", icon: InformationCircleIcon },
    ],
  },
  ...(authStore.isAdmin
    ? [
        {
          title: "Quản trị",
          items: [
            { to: "/admin", label: "Tổng quan", icon: ShieldCheckIcon },
            { to: "/admin/withdrawals", label: "Xử lý rút tiền", icon: WalletIcon },
          ],
        },
      ]
    : []),
]);

async function handleLogout() {
  notificationsStore.disconnectWebSocket();
  await authStore.logout();
  router.push("/login");
}

onMounted(() => {
  notificationsStore.fetchUnreadCount();
  notificationsStore.connectWebSocket();
  onUnmounted(() => {
    notificationsStore.disconnectWebSocket();
  });
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
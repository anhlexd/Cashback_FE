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
        class="flex items-center justify-center px-3 py-4 border-b border-surface-200 dark:border-dark-50"
      >
        <AppLogo :compact="!sidebarOpen" />
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto p-2 space-y-0.5">
        <template v-for="(section, sIdx) in navSections" :key="section.title">
          <div
            v-if="sidebarOpen"
            class="px-3 pt-3 pb-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase"
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
                :class="isActive ? 'nav-item-active' : 'nav-item'"
                :title="!sidebarOpen ? item.label : ''"
              >
                <div class="relative flex-shrink-0">
                  <component :is="item.icon" class="w-4 h-4" />
                </div>
                <span v-if="sidebarOpen" class="truncate flex-1">{{
                  item.label
                }}</span>
                <span
                  v-if="sidebarOpen && item.badge"
                  class="ml-auto flex-shrink-0 px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-semibold whitespace-nowrap"
                >
                  {{ item.badge }}
                </span>
              </div>
            </NuxtLink>
          </template>
        </template>
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
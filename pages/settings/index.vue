<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Cài đặt</h1>

    <div class="grid md:grid-cols-4 gap-6">
      <!-- Sidebar nav -->
      <nav class="space-y-1">
        <NuxtLink
          v-for="item in navItems" :key="item.to"
          :to="item.to"
          custom v-slot="{ isActive, navigate }"
        >
          <button
            @click="navigate"
            class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left"
            :class="isActive
              ? 'bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300 font-medium'
              : 'text-gray-600 dark:text-gray-400 hover:bg-surface-100 dark:hover:bg-dark-50'"
          >
            <component :is="item.icon" class="w-4 h-4 flex-shrink-0" />
            {{ item.label }}
          </button>
        </NuxtLink>
      </nav>

      <!-- Content -->
      <div class="md:col-span-3">
        <NuxtPage />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  BuildingOffice2Icon,
  CpuChipIcon,
  IdentificationIcon,
} from '@heroicons/vue/24/outline'

definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()

const navItems = computed(() => {
  const items = [
    { to: '/settings/profile', label: 'Hồ sơ', icon: UserCircleIcon },
    { to: '/settings/notifications', label: 'Thông báo', icon: BellIcon },
    { to: '/settings/security', label: 'Bảo mật', icon: ShieldCheckIcon },
    { to: '/settings/appearance', label: 'Giao diện', icon: PaintBrushIcon },
  ]
  if (authStore.user?.role === 'admin') {
    items.push(
      { to: '/settings/org', label: 'Phòng ban & Vị trí', icon: IdentificationIcon },
      { to: '/settings/company', label: 'Công ty', icon: BuildingOffice2Icon },
      { to: '/settings/cursor', label: 'Cursor', icon: CpuChipIcon },
    )
  }
  return items
})
</script>

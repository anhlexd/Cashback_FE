<!-- components/UserAvatar.vue -->
<template>
  <div
    :class="sizeClasses"
    class="rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center font-medium text-white"
    :style="!user?.avatar_url ? { backgroundColor: avatarColor } : {}"
    :title="tooltip && user ? user.fullname : undefined"
  >
    <img v-if="user?.avatar_url" :src="user.avatar_url" :alt="user?.fullname" class="w-full h-full object-cover" />
    <span v-else>{{ initials }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  user?: any
  size?: 'xs' | 'sm' | 'md' | 'lg'
  tooltip?: boolean
}>()

const sizeClasses = computed(() => ({
  'w-5 h-5 text-[9px]': props.size === 'xs',
  'w-7 h-7 text-xs': props.size === 'sm' || !props.size,
  'w-9 h-9 text-sm': props.size === 'md',
  'w-12 h-12 text-base': props.size === 'lg',
}))

const initials = computed(() => {
  const name = props.user?.fullname || props.user?.username || '?'
  return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
})

import { CHART_AVATAR_COLORS } from '~/utils/brandColors'

const avatarColor = computed(() => {
  const id = props.user?.id || 0
  return CHART_AVATAR_COLORS[id % CHART_AVATAR_COLORS.length]
})
</script>

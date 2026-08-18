<template>
  <span
    v-if="meta"
    class="inline-flex items-center gap-1 font-semibold tracking-tight whitespace-nowrap"
    :class="[meta.pill, sizeClass, { 'shadow-sm': role === 'admin' }]"
    :title="meta.title"
  >
    <component :is="iconComponent" class="shrink-0 opacity-90" :class="iconSizeClass" />
    <span>{{ meta.shortLabel }}</span>
  </span>
</template>

<script setup lang="ts">
import {
  ShieldCheckIcon,
  StarIcon,
  BriefcaseIcon,
  CodeBracketIcon,
  BeakerIcon,
  EyeIcon,
  UserIcon,
} from '@heroicons/vue/24/solid'
import { getRoleMeta } from '~/composables/useProjectRole'

const props = withDefaults(defineProps<{
  role: string | null | undefined
  size?: 'sm' | 'md'
}>(), {
  size: 'sm',
})

const icons: Record<string, any> = {
  ShieldCheckIcon,
  StarIcon,
  BriefcaseIcon,
  CodeBracketIcon,
  BeakerIcon,
  EyeIcon,
  UserIcon,
}

const meta = computed(() => getRoleMeta(props.role))
const iconComponent = computed(() => icons[meta.value?.icon || 'UserIcon'] || UserIcon)

const sizeClass = computed(() =>
  props.size === 'md'
    ? 'px-2.5 py-1 rounded-lg text-xs'
    : 'px-2 py-0.5 rounded-md text-[10px]',
)

const iconSizeClass = computed(() =>
  props.size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3',
)
</script>

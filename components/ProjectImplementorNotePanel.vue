<template>
  <!-- Chỉ dùng khi cần embed nhỏ; mặc định dùng trang /projects/:id/implementor-note -->
  <ProjectImplementorNoteTeaser v-if="teaserOnly" :project-id="projectId" />
  <div
    v-else
    class="rounded-xl border border-surface-200 dark:border-dark-50 overflow-hidden"
    @contextmenu.prevent
  >
    <div class="px-4 py-3 border-b border-surface-100 dark:border-dark-50 flex items-center gap-2">
      <span class="text-sm font-semibold text-gray-900 dark:text-white">Implementor Note</span>
      <NuxtLink
        :to="`/projects/${projectId}/implementor-note`"
        class="text-xs text-brand-600 hover:underline ml-auto"
      >
        Mở trang đầy đủ →
      </NuxtLink>
    </div>
    <div
      ref="viewerRef"
      class="implementor-note-viewer p-4 max-h-96 overflow-y-auto text-sm"
    />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    projectId: number
    teaserOnly?: boolean
    canRefresh?: boolean
  }>(),
  { teaserOnly: true, canRefresh: false },
)

const viewerRef = ref<HTMLElement>()
const { contentHtml, load } = useProjectImplementorNote(() => props.projectId, {
  canRefresh: props.canRefresh,
})

function renderHtml() {
  const el = viewerRef.value
  if (!el || !contentHtml.value) return
  el.innerHTML = contentHtml.value
}

onMounted(async () => {
  if (!props.teaserOnly) {
    await load()
    nextTick(renderHtml)
  }
})

watch(contentHtml, () => nextTick(renderHtml))
</script>

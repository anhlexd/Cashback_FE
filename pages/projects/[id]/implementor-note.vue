<template>
  <div class="min-h-[calc(100vh-4rem)] flex flex-col bg-surface-50 dark:bg-dark-200" @contextmenu.prevent>
    <!-- Top bar -->
    <header
      class="sticky top-0 z-20 border-b border-surface-200 dark:border-dark-50 bg-white/95 dark:bg-dark-100/95 backdrop-blur"
    >
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
        <NuxtLink
          :to="`/projects/${projectId}`"
          class="btn-ghost btn-sm text-gray-600 dark:text-gray-300 shrink-0"
        >
          <ArrowLeftIcon class="w-4 h-4" />
          {{ project?.key || 'Dự án' }}
        </NuxtLink>
        <div class="h-5 w-px bg-surface-200 dark:bg-dark-50 hidden sm:block" />
        <div class="flex-1 min-w-0">
          <h1 class="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">
            Implementor Note
          </h1>
          <p class="text-[11px] text-gray-500 truncate">
            <span v-if="project?.name">{{ project.name }} · </span>
            Chỉ xem trên DevFlow
            <span v-if="githubRepos.length"> · {{ githubRepos.join(', ') }}</span>
            <span v-if="cursorPublishedRepos.length">
              · Cursor: {{ cursorPublishedRepos.join(', ') }}
            </span>
          </p>
        </div>
        <span
          v-if="status === 'ready'"
          class="text-[10px] font-medium text-green-700 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded"
        >
          Đã đồng bộ
        </span>
        <span
          v-else-if="status === 'building' || refreshing"
          class="text-[10px] font-medium text-amber-700 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded"
        >
          Đang cập nhật…
        </span>
        <button
          v-if="showRefresh"
          type="button"
          class="btn-primary btn-sm"
          :disabled="refreshing"
          @click="refreshNote"
        >
          <ArrowPathIcon class="w-4 h-4" :class="refreshing && 'animate-spin'" />
          {{ refreshing ? 'Đang cập nhật…' : 'Cập nhật' }}
        </button>
      </div>
      <p
        v-if="generatedAt"
        class="max-w-6xl mx-auto px-4 sm:px-6 pb-2 text-[11px] text-gray-400"
      >
        Lần cập nhật: {{ formatGeneratedAt(generatedAt) }}
      </p>
    </header>

    <div v-if="!available" class="flex-1 flex items-center justify-center p-8">
      <div class="card p-8 max-w-md text-center text-sm text-gray-500">
        {{ message || 'Dự án cần gắn repository GitHub.' }}
        <div class="mt-4 flex flex-wrap gap-2 justify-center">
          <NuxtLink :to="`/projects/${projectId}`" class="btn-secondary btn-sm">Về dự án</NuxtLink>
          <NuxtLink to="/github" class="btn-primary btn-sm">Quản lý GitHub</NuxtLink>
        </div>
      </div>
    </div>

    <div
      v-else-if="loading && !contentHtml"
      class="flex-1 flex items-center justify-center text-sm text-gray-400"
    >
      <div class="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mr-3" />
      Đang tải tài liệu…
    </div>

    <div v-else class="flex-1 flex max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 gap-6 lg:gap-8">
      <!-- Mục lục -->
      <aside
        v-if="tocItems.length"
        class="hidden lg:block w-52 shrink-0"
      >
        <nav class="sticky top-28 card p-3 text-xs">
          <div class="font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
            Mục lục
          </div>
          <ul class="space-y-1 max-h-[calc(100vh-10rem)] overflow-y-auto">
            <li v-for="item in tocItems" :key="item.id">
              <button
                type="button"
                class="w-full text-left px-2 py-1.5 rounded-md transition-colors truncate"
                :class="
                  activeSection === item.id
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 font-medium'
                    : 'text-gray-500 hover:bg-surface-50 dark:hover:bg-dark-50'
                "
                @click="scrollToSection(item.id)"
              >
                {{ item.label }}
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Nội dung -->
      <article class="flex-1 min-w-0">
        <div
          v-if="tocItems.length"
          class="lg:hidden mb-4 flex gap-2 overflow-x-auto pb-1"
        >
          <button
            v-for="item in tocItems"
            :key="item.id"
            type="button"
            class="shrink-0 px-3 py-1 text-xs rounded-full border border-surface-200 dark:border-dark-50"
            :class="
              activeSection === item.id
                ? 'bg-brand-600 text-white border-brand-600'
                : 'text-gray-600 dark:text-gray-400'
            "
            @click="scrollToSection(item.id)"
          >
            {{ item.shortLabel }}
          </button>
        </div>

        <div
          ref="viewerRef"
          class="implementor-note-viewer implementor-note-viewer--page card p-6 sm:p-8 lg:p-10 text-[15px] leading-relaxed select-text"
        />
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

definePageMeta({ middleware: ['auth', 'project-member'] })

const route = useRoute()
const projectId = computed(() => Number(route.params.id))
const projectsStore = useProjectsStore()

const project = computed(() => projectsStore.currentProject)

const viewerRef = ref<HTMLElement>()
const tocItems = ref<{ id: string; label: string; shortLabel: string }[]>([])
const activeSection = ref('')

const {
  loading,
  refreshing,
  available,
  message,
  contentHtml,
  status,
  generatedAt,
  githubRepos,
  cursorPublishedRepos,
  showRefresh,
  load,
  refreshNote,
  formatGeneratedAt,
} = useProjectImplementorNote(projectId)

function renderHtml() {
  const el = viewerRef.value
  if (!el || !contentHtml.value) return
  el.innerHTML = contentHtml.value
  buildToc()
}

function buildToc() {
  const el = viewerRef.value
  if (!el) return
  const h2s = el.querySelectorAll('h2')
  tocItems.value = Array.from(h2s).map((h, i) => {
    const id = `impl-section-${i}`
    h.id = id
    const label = (h.textContent || '').replace(/^\d+\.\s*/, '').trim()
    return {
      id,
      label: label || `Mục ${i + 1}`,
      shortLabel: (label || `${i + 1}`).slice(0, 28),
    }
  })
  if (tocItems.value.length && !activeSection.value) {
    activeSection.value = tocItems.value[0].id
  }
}

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeSection.value = id
  }
}

onMounted(async () => {
  await projectsStore.fetchProject(projectId.value)
  await load()
  nextTick(renderHtml)
})

watch(contentHtml, () => nextTick(renderHtml))
watch(refreshing, () => {
  if (!refreshing.value) nextTick(renderHtml)
})
</script>

<style scoped>
.implementor-note-viewer--page {
  max-height: none;
  overflow: visible;
}

.implementor-note-viewer--page :deep(.implementor-note-doc) {
  max-width: 42rem;
  margin: 0 auto;
}

.implementor-note-viewer--page :deep(.implementor-note-doc h2) {
  scroll-margin-top: 6rem;
  margin-top: 2rem;
  padding-top: 0.5rem;
}

.implementor-note-viewer--page :deep(.implementor-note-doc h2:first-of-type) {
  margin-top: 0;
}

.implementor-note-viewer--page :deep(ul.compact) {
  max-height: none;
}
</style>

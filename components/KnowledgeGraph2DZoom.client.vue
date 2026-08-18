<template>
  <div class="relative rounded-lg border border-surface-200 dark:border-dark-50 bg-slate-50 dark:bg-slate-900 overflow-hidden">
    <div class="absolute top-2 left-2 z-10 flex flex-wrap gap-1.5">
      <button type="button" class="btn-secondary btn-sm !py-1 !text-[10px]" @click="zoomIn">+</button>
      <button type="button" class="btn-secondary btn-sm !py-1 !text-[10px]" @click="zoomOut">−</button>
      <button type="button" class="btn-secondary btn-sm !py-1 !text-[10px]" @click="fitView">Vừa khung</button>
      <span class="text-[10px] text-gray-400 self-center">{{ Math.round(scale * 100) }}%</span>
    </div>
    <p class="absolute top-2 right-2 text-[10px] text-gray-400 z-10 pointer-events-none">
      Scroll zoom · Kéo pan · Click node
    </p>
    <div
      ref="viewportRef"
      class="w-full cursor-grab active:cursor-grabbing"
      :style="{ height: height + 'px' }"
      @wheel.prevent="onWheel"
      @mousedown="onPanStart"
      @mousemove="onPanMove"
      @mouseup="onPanEnd"
      @mouseleave="onPanEnd"
    >
      <svg ref="svgRef" class="w-full h-full block">
        <g :transform="`translate(${tx} ${ty}) scale(${scale})`">
          <line
            v-for="edge in graphData.edges"
            :key="edge.id"
            :x1="layout[edge.source]?.x"
            :y1="layout[edge.source]?.y"
            :x2="layout[edge.target]?.x"
            :y2="layout[edge.target]?.y"
            stroke="#94a3b8"
            stroke-width="1.5"
            :opacity="edgeOpacity(edge)"
          />
          <g
            v-for="node in graphData.nodes"
            :key="node.id"
            class="cursor-pointer"
            @click.stop="selectNode(node)"
          >
            <circle
              :cx="layout[node.id]?.x"
              :cy="layout[node.id]?.y"
              :r="nodeR(node)"
              :fill="node.color || '#94a3b8'"
              :stroke="selectedId === node.id ? '#C41230' : '#fff'"
              :stroke-width="selectedId === node.id ? 3 : 2"
            />
            <text
              :x="layout[node.id]?.x"
              :y="(layout[node.id]?.y || 0) + nodeR(node) + 11"
              text-anchor="middle"
              class="text-[9px] fill-gray-500 pointer-events-none select-none"
            >
              {{ node.label }}
            </text>
          </g>
        </g>
      </svg>
    </div>

    <Transition name="fade">
      <div
        v-if="selectedNode"
        class="absolute bottom-0 left-0 right-0 z-20 bg-white/95 dark:bg-dark-100/95 border-t border-surface-200 dark:border-dark-50 p-4 max-h-[42%] overflow-y-auto shadow-lg"
      >
        <div class="flex items-start justify-between gap-2 mb-1">
          <div>
            <span class="badge text-[10px] mb-1">{{ typeLabel(selectedNode.type) }}</span>
            <h4 class="font-bold font-mono text-gray-900 dark:text-white">{{ selectedNode.label }}</h4>
          </div>
          <button type="button" class="btn-ghost btn-icon shrink-0" @click="selectedId = null">
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
        <p v-if="selectedNode.title" class="text-sm text-gray-500 dark:text-gray-300 mb-2">{{ selectedNode.title }}</p>
        <div v-if="selectedNode.meta && Object.keys(selectedNode.meta).length" class="grid sm:grid-cols-2 gap-2 mb-2">
          <div
            v-for="(val, key) in selectedNode.meta"
            :key="String(key)"
            class="text-xs px-2 py-1 rounded bg-surface-50 dark:bg-dark-50"
          >
            <span class="text-[10px] text-gray-400 uppercase">{{ key }}</span>
            <div class="font-medium truncate text-gray-800 dark:text-gray-200">{{ val }}</div>
          </div>
        </div>
        <ul v-if="relatedEdges.length" class="text-xs text-gray-600 dark:text-gray-300 mb-2 max-h-20 overflow-y-auto space-y-0.5">
          <li v-for="(e, i) in relatedEdges.slice(0, 8)" :key="i">
            <span class="text-brand-600">{{ e.type }}</span> → {{ e.otherLabel }}
          </li>
        </ul>
        <div class="flex flex-wrap gap-2">
          <a
            v-if="selectedNode.meta?.url"
            :href="selectedNode.meta.url"
            target="_blank"
            rel="noopener"
            class="btn-secondary btn-sm text-xs"
          >GitHub</a>
          <button
            v-if="selectedNode.type === 'issue'"
            type="button"
            class="btn-primary btn-sm text-xs"
            @click="emit('ask-about', selectedNode.label)"
          >Hỏi AI</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = withDefaults(defineProps<{
  graphData: { nodes: any[]; edges: any[] }
  height?: number
  forceLayout?: boolean
}>(), {
  height: 520,
  forceLayout: true,
})

const emit = defineEmits<{ 'ask-about': [issueKey: string] }>()

const viewportRef = ref<HTMLElement>()
const svgRef = ref<SVGSVGElement>()
const selectedId = ref<string | null>(null)
const scale = ref(1)
const tx = ref(0)
const ty = ref(0)
const pan = reactive({ on: false, sx: 0, sy: 0, tx0: 0, ty0: 0 })
const layout = ref<Record<string, { x: number; y: number }>>({})

const selectedNode = computed(() =>
  props.graphData.nodes.find((n: any) => n.id === selectedId.value),
)

const nodeById = computed(() => {
  const m = new Map<string, any>()
  props.graphData.nodes.forEach((n: any) => m.set(n.id, n))
  return m
})

const relatedEdges = computed(() => {
  if (!selectedId.value) return []
  const id = selectedId.value
  return props.graphData.edges
    .filter((e: any) => e.source === id || e.target === id)
    .map((e: any) => {
      const other = e.source === id ? e.target : e.source
      return { type: e.type, otherLabel: nodeById.value.get(other)?.label || other }
    })
})

function typeLabel(t: string) {
  const m: Record<string, string> = {
    project: 'Dự án', repository: 'Repo', commit: 'Commit',
    pull_request: 'PR', issue: 'Issue', developer: 'Dev', member: 'Member',
  }
  return m[t] || t
}

function nodeR(n: any) {
  return ({ project: 22, repository: 16, issue: 14, commit: 10, pull_request: 12 } as Record<string, number>)[n.type] || 10
}

function edgeOpacity(e: any) {
  if (!selectedId.value) return 0.55
  return e.source === selectedId.value || e.target === selectedId.value ? 1 : 0.1
}

function selectNode(n: any) { selectedId.value = n.id }

function runForceLayout(w: number, h: number) {
  const nodes = props.graphData.nodes.map((n: any) => ({
    id: n.id,
    x: w / 2 + (Math.random() - 0.5) * w * 0.5,
    y: h / 2 + (Math.random() - 0.5) * h * 0.5,
    vx: 0,
    vy: 0,
    mass: nodeR(n),
  }))
  const idx = new Map(nodes.map((n, i) => [n.id, i]))
  const links = props.graphData.edges
    .filter((e: any) => idx.has(e.source) && idx.has(e.target))
    .map((e: any) => ({ s: idx.get(e.source)!, t: idx.get(e.target)! }))

  const cx = w / 2
  const cy = h / 2
  const ticks = props.forceLayout ? 120 : 0
  for (let t = 0; t < ticks; t++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]
        const b = nodes[j]
        let dx = b.x - a.x
        let dy = b.y - a.y
        let dist = Math.hypot(dx, dy) || 1
        const rep = (800 + a.mass * b.mass * 8) / (dist * dist)
        dx /= dist
        dy /= dist
        a.vx -= dx * rep
        a.vy -= dy * rep
        b.vx += dx * rep
        b.vy += dy * rep
      }
    }
    for (const { s, t } of links) {
      const a = nodes[s]
      const b = nodes[t]
      let dx = b.x - a.x
      let dy = b.y - a.y
      const dist = Math.hypot(dx, dy) || 1
      const pull = (dist - 90) * 0.04
      dx /= dist
      dy /= dist
      a.vx += dx * pull
      a.vy += dy * pull
      b.vx -= dx * pull
      b.vy -= dy * pull
    }
    for (const n of nodes) {
      n.vx += (cx - n.x) * 0.002
      n.vy += (cy - n.y) * 0.002
      n.vx *= 0.85
      n.vy *= 0.85
      n.x += n.vx
      n.y += n.vy
      n.x = Math.max(40, Math.min(w - 40, n.x))
      n.y = Math.max(40, Math.min(h - 40, n.y))
    }
  }

  const out: Record<string, { x: number; y: number }> = {}
  nodes.forEach((n) => { out[n.id] = { x: n.x, y: n.y } })
  layout.value = out
}

function fitView() {
  const el = viewportRef.value
  if (!el || !Object.keys(layout.value).length) return
  const pts = Object.values(layout.value)
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const p of pts) {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x)
    maxY = Math.max(maxY, p.y)
  }
  const pad = 48
  const gw = maxX - minX + pad * 2
  const gh = maxY - minY + pad * 2
  const vw = el.clientWidth
  const vh = props.height
  const s = Math.min(3, Math.max(0.2, Math.min(vw / gw, vh / gh)))
  scale.value = s
  tx.value = (vw - (minX + maxX) * s) / 2
  ty.value = (vh - (minY + maxY) * s) / 2
}

function relayout() {
  const w = viewportRef.value?.clientWidth || 800
  runForceLayout(w, props.height)
  nextTick(() => fitView())
}

function onWheel(e: WheelEvent) {
  const f = e.deltaY > 0 ? 0.9 : 1.1
  const r = viewportRef.value?.getBoundingClientRect()
  if (!r) return
  const mx = e.clientX - r.left
  const my = e.clientY - r.top
  const ns = Math.min(4, Math.max(0.12, scale.value * f))
  const ratio = ns / scale.value
  tx.value = mx - (mx - tx.value) * ratio
  ty.value = my - (my - ty.value) * ratio
  scale.value = ns
}

function onPanStart(e: MouseEvent) {
  pan.on = true
  pan.sx = e.clientX
  pan.sy = e.clientY
  pan.tx0 = tx.value
  pan.ty0 = ty.value
}
function onPanMove(e: MouseEvent) {
  if (!pan.on) return
  tx.value = pan.tx0 + e.clientX - pan.sx
  ty.value = pan.ty0 + e.clientY - pan.sy
}
function onPanEnd() { pan.on = false }
function zoomIn() { scale.value = Math.min(4, scale.value * 1.2) }
function zoomOut() { scale.value = Math.max(0.12, scale.value / 1.2) }

watch(() => props.graphData, () => {
  selectedId.value = null
  nextTick(relayout)
}, { deep: true, immediate: true })
watch(() => props.height, () => nextTick(relayout))

let resizeObs: ResizeObserver | null = null
onMounted(() => {
  nextTick(relayout)
  if (viewportRef.value) {
    resizeObs = new ResizeObserver(() => relayout())
    resizeObs.observe(viewportRef.value)
  }
})
onUnmounted(() => resizeObs?.disconnect())
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

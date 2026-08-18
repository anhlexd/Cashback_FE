<template>
  <div class="relative rounded-lg border border-surface-200 dark:border-dark-50 bg-[#0b1220] overflow-hidden">
    <div class="absolute top-2 left-2 right-2 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
      <div class="pointer-events-auto flex flex-wrap gap-1.5">
        <button type="button" class="btn-secondary btn-sm !py-1 !text-[10px] bg-white/90 dark:bg-dark-100/90" @click="fitView">
          Vừa khung
        </button>
        <button type="button" class="btn-secondary btn-sm !py-1 !text-[10px] bg-white/90 dark:bg-dark-100/90" @click="resetCamera">
          Reset góc
        </button>
        <button
          type="button"
          class="btn-secondary btn-sm !py-1 !text-[10px] bg-white/90 dark:bg-dark-100/90"
          :class="showLabels && '!bg-brand-50 !text-brand-700'"
          @click="showLabels = !showLabels"
        >
          Nhãn
        </button>
      </div>
      <p class="text-[10px] text-slate-400 hidden sm:block">Kéo xoay · Scroll zoom · Click node</p>
    </div>

    <canvas
      ref="canvasRef"
      class="w-full block cursor-grab active:cursor-grabbing"
      :style="{ height: `${height}px` }"
      @mousedown="onDown"
      @mousemove="onMove"
      @mouseup="onUp"
      @mouseleave="onUp"
      @wheel.prevent="onWheel"
      @click="onClick"
    />

    <Transition name="fade">
      <div
        v-if="selectedNode"
        class="absolute bottom-0 left-0 right-0 z-20 max-h-[42%] overflow-y-auto bg-white/95 dark:bg-dark-100/95 border-t p-4 shadow-lg"
      >
        <div class="flex items-start justify-between gap-2 mb-1">
          <div>
            <span class="badge text-[10px] mb-1">{{ typeLabel(selectedNode.type) }}</span>
            <h4 class="font-bold font-mono text-gray-900 dark:text-white">{{ selectedNode.label }}</h4>
          </div>
          <button type="button" class="btn-ghost btn-icon shrink-0" @click="selected = null">
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
        <p v-if="selectedNode.title" class="text-sm text-gray-500 mb-2">{{ selectedNode.title }}</p>
        <div v-if="selectedNode.meta && Object.keys(selectedNode.meta).length" class="grid sm:grid-cols-2 gap-2 mb-2">
          <div v-for="(val, key) in selectedNode.meta" :key="String(key)" class="text-xs px-2 py-1 rounded bg-surface-50 dark:bg-dark-50">
            <span class="text-[10px] text-gray-400 uppercase">{{ key }}</span>
            <div class="font-medium truncate">{{ val }}</div>
          </div>
        </div>
        <div class="flex gap-2">
          <a v-if="selectedNode.meta?.url" :href="selectedNode.meta.url" target="_blank" rel="noopener" class="btn-secondary btn-sm text-xs">GitHub</a>
          <button v-if="selectedNode.type === 'issue'" type="button" class="btn-primary btn-sm text-xs" @click="emit('ask-about', selectedNode.label)">
            Hỏi AI
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'

type GNode = {
  id: string
  type: string
  label: string
  title?: string
  color?: string
  meta?: Record<string, unknown>
}

type SimNode = GNode & { x: number; y: number; z: number; vx: number; vy: number; vz: number; r: number }

const props = withDefaults(defineProps<{
  graphData: { nodes: GNode[]; edges: { id: string; source: string; target: string; type: string }[] } | null
  height?: number
}>(), { height: 520 })

const emit = defineEmits<{ 'ask-about': [issueKey: string] }>()

const canvasRef = ref<HTMLCanvasElement>()
const selected = ref<string | null>(null)
const showLabels = ref(true)

const cam = reactive({ yaw: 0.55, pitch: 0.35, zoom: 1, drag: false, lx: 0, ly: 0, yaw0: 0, pitch0: 0 })

let simNodes: SimNode[] = []
let raf = 0
let drawPending = false
let projected: Array<SimNode & { sx: number; sy: number; depth: number; pr: number }> = []

const selectedNode = computed(() => simNodes.find((n) => n.id === selected.value))

const NODE_R: Record<string, number> = {
  project: 14, repository: 10, issue: 8, pull_request: 7, commit: 5, developer: 6, member: 6,
}

function typeLabel(t: string) {
  const m: Record<string, string> = {
    project: 'Dự án', repository: 'Repo', commit: 'Commit', pull_request: 'PR',
    issue: 'Issue', developer: 'Dev', member: 'Member',
  }
  return m[t] || t
}

function buildSim() {
  const nodes = props.graphData?.nodes || []
  const edges = props.graphData?.edges || []
  simNodes = nodes.map((n) => ({
    ...n,
    x: (Math.random() - 0.5) * 200,
    y: (Math.random() - 0.5) * 200,
    z: (Math.random() - 0.5) * 200,
    vx: 0, vy: 0, vz: 0,
    r: NODE_R[n.type] || 6,
    color: n.color || '#64748b',
  }))
  const idx = new Map(simNodes.map((n, i) => [n.id, i]))
  const links = edges
    .filter((e) => idx.has(e.source) && idx.has(e.target))
    .map((e) => ({ s: idx.get(e.source)!, t: idx.get(e.target)! }))

  for (let tick = 0; tick < 100; tick++) {
    for (let i = 0; i < simNodes.length; i++) {
      for (let j = i + 1; j < simNodes.length; j++) {
        const a = simNodes[i]
        const b = simNodes[j]
        let dx = b.x - a.x
        let dy = b.y - a.y
        let dz = b.z - a.z
        const d2 = dx * dx + dy * dy + dz * dz || 1
        const d = Math.sqrt(d2)
        const f = 4200 / d2
        dx = (dx / d) * f
        dy = (dy / d) * f
        dz = (dz / d) * f
        a.vx -= dx
        a.vy -= dy
        a.vz -= dz
        b.vx += dx
        b.vy += dy
        b.vz += dz
      }
    }
    for (const { s, t } of links) {
      const a = simNodes[s]
      const b = simNodes[t]
      let dx = b.x - a.x
      let dy = b.y - a.y
      let dz = b.z - a.z
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1
      const pull = (d - 70) * 0.035
      dx = (dx / d) * pull
      dy = (dy / d) * pull
      dz = (dz / d) * pull
      a.vx += dx
      a.vy += dy
      a.vz += dz
      b.vx -= dx
      b.vy -= dy
      b.vz -= dz
    }
    for (const n of simNodes) {
      n.vx += -n.x * 0.004
      n.vy += -n.y * 0.004
      n.vz += -n.z * 0.004
      n.vx *= 0.82
      n.vy *= 0.82
      n.vz *= 0.82
      n.x += n.vx
      n.y += n.vy
      n.z += n.vz
    }
  }
}

function project(n: SimNode, cx: number, cy: number) {
  const cyaw = Math.cos(cam.yaw)
  const syaw = Math.sin(cam.yaw)
  let x = n.x * cyaw - n.z * syaw
  let z = n.x * syaw + n.z * cyaw
  let y = n.y
  const cp = Math.cos(cam.pitch)
  const sp = Math.sin(cam.pitch)
  const y2 = y * cp - z * sp
  z = y * sp + z * cp
  const dist = z + 280
  const s = (cam.zoom * 420) / dist
  return { sx: cx + x * s, sy: cy + y2 * s, depth: z, pr: Math.max(3, n.r * s * 0.12) }
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const w = canvas.clientWidth
  const h = props.height
  canvas.width = w * dpr
  canvas.height = h * dpr
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.fillStyle = '#0b1220'
  ctx.fillRect(0, 0, w, h)

  const cx = w / 2
  const cy = h / 2
  projected = simNodes.map((n) => ({ ...n, ...project(n, cx, cy) }))
  projected.sort((a, b) => a.depth - b.depth)

  const sel = selected.value
  for (const edge of props.graphData?.edges || []) {
    const a = projected.find((p) => p.id === edge.source)
    const b = projected.find((p) => p.id === edge.target)
    if (!a || !b) continue
    const hl = sel && (edge.source === sel || edge.target === sel)
    ctx.strokeStyle = hl ? 'rgba(196, 18, 48, 0.7)' : 'rgba(100, 116, 139, 0.25)'
    ctx.lineWidth = hl ? 1.8 : 0.8
    ctx.beginPath()
    ctx.moveTo(a.sx, a.sy)
    ctx.lineTo(b.sx, b.sy)
    ctx.stroke()
  }

  for (const n of projected) {
    const isSel = n.id === sel
    const glow = ctx.createRadialGradient(n.sx, n.sy, 0, n.sx, n.sy, n.pr * 2.2)
    glow.addColorStop(0, isSel ? 'rgba(196,18,48,0.35)' : `${n.color}44`)
    glow.addColorStop(1, 'transparent')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(n.sx, n.sy, n.pr * 2.2, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = n.color || '#64748b'
    ctx.strokeStyle = isSel ? '#fff' : 'rgba(255,255,255,0.35)'
    ctx.lineWidth = isSel ? 2.5 : 1
    ctx.beginPath()
    ctx.arc(n.sx, n.sy, n.pr, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    if (showLabels.value && (isSel || n.pr > 5)) {
      ctx.fillStyle = 'rgba(226, 232, 240, 0.9)'
      ctx.font = '10px ui-sans-serif, system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(n.label, n.sx, n.sy + n.pr + 11)
    }
  }
}

function scheduleDraw() {
  if (drawPending) return
  drawPending = true
  raf = requestAnimationFrame(() => {
    drawPending = false
    draw()
  })
}

function fitView() {
  if (!simNodes.length) return
  let maxR = 0
  for (const n of simNodes) {
    maxR = Math.max(maxR, Math.hypot(n.x, n.y, n.z))
  }
  cam.zoom = maxR > 0 ? Math.min(2.5, Math.max(0.4, 120 / maxR)) : 1
  scheduleDraw()
}

function resetCamera() {
  cam.yaw = 0.55
  cam.pitch = 0.35
  cam.zoom = 1
  fitView()
}

function pick(mx: number, my: number) {
  for (let i = projected.length - 1; i >= 0; i--) {
    const n = projected[i]
    if (Math.hypot(mx - n.sx, my - n.sy) <= n.pr + 4) return n.id
  }
  return null
}

function onDown(e: MouseEvent) {
  cam.drag = true
  cam.lx = e.clientX
  cam.ly = e.clientY
  cam.yaw0 = cam.yaw
  cam.pitch0 = cam.pitch
}
function onMove(e: MouseEvent) {
  if (!cam.drag) return
  cam.yaw = cam.yaw0 + (e.clientX - cam.lx) * 0.008
  cam.pitch = Math.max(-1.2, Math.min(1.2, cam.pitch0 + (e.clientY - cam.ly) * 0.008))
  scheduleDraw()
}
function onUp() { cam.drag = false }
function onWheel(e: WheelEvent) {
  cam.zoom = Math.min(3, Math.max(0.25, cam.zoom * (e.deltaY > 0 ? 0.92 : 1.08)))
  scheduleDraw()
}
function onClick(e: MouseEvent) {
  const r = canvasRef.value?.getBoundingClientRect()
  if (!r) return
  selected.value = pick(e.clientX - r.left, e.clientY - r.top)
  scheduleDraw()
}

function restart() {
  selected.value = null
  buildSim()
  nextTick(() => {
    fitView()
    scheduleDraw()
  })
}

watch(() => props.graphData, restart, { deep: true })
watch(() => props.height, () => nextTick(scheduleDraw))
watch(showLabels, scheduleDraw)

let resizeObs: ResizeObserver | null = null
onMounted(() => {
  restart()
  if (canvasRef.value) {
    resizeObs = new ResizeObserver(scheduleDraw)
    resizeObs.observe(canvasRef.value)
  }
})
onUnmounted(() => {
  if (raf) cancelAnimationFrame(raf)
  resizeObs?.disconnect()
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

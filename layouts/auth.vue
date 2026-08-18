<template>
  <div class="auth-page min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">
    <!-- Nền sáng + gradient tech -->
    <div class="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-brand-50/80 pointer-events-none" aria-hidden="true" />
    <div
      class="absolute inset-0 opacity-[0.35] pointer-events-none"
      style="background-image: linear-gradient(rgba(148, 163, 184, 0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.18) 1px, transparent 1px); background-size: 48px 48px;"
      aria-hidden="true"
    />
    <div class="absolute -top-32 -right-32 w-[28rem] h-[28rem] bg-brand-500/12 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
    <div class="absolute -bottom-40 -left-24 w-[24rem] h-[24rem] bg-slate-300/25 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
    <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-brand-400/8 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

    <div class="relative w-full max-w-md z-10">
      <!-- Logo (nền đen của PNG nổi trên layout sáng) -->
      <div class="flex justify-center mb-8">
        <div class="rounded-2xl p-3 shadow-xl shadow-brand-900/10 ring-1 ring-black/5 bg-white/60 backdrop-blur-sm">
          <img
            src="/idt-logo.png"
            alt="Integrated Development Technologies"
            class="h-28 w-auto max-w-[min(100%,360px)] object-contain"
            draggable="false"
          />
        </div>
      </div>

      <!-- Card đăng nhập -->
      <div class="bg-white/95 backdrop-blur-md border border-surface-200/80 rounded-2xl p-8 shadow-xl shadow-slate-300/40 ring-1 ring-white/80">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  background-color: #f8fafc;
}
</style>

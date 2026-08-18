// composables/useLightbox.ts — popup xem ảnh to (singleton).
// Bất kỳ component nào cũng gọi openLightbox(src, opts) để mở.

const isOpen = ref(false)
const src = ref('')
const alt = ref('')
const downloadUrl = ref('')

export const useLightbox = () => {
  function openLightbox(url: string, opts?: { alt?: string; download?: string }) {
    if (!url) return
    src.value = url
    alt.value = opts?.alt || ''
    downloadUrl.value = opts?.download || url
    isOpen.value = true
  }
  function closeLightbox() {
    isOpen.value = false
    // giữ src để tránh nháy khi đóng; reset nhẹ sau
    src.value = ''
  }
  return { isOpen, src, alt, downloadUrl, openLightbox, closeLightbox }
}

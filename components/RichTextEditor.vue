<template>
  <div class="rich-editor border border-surface-200 dark:border-dark-50 rounded-lg overflow-hidden bg-white dark:bg-dark-100">
    <!-- Toolbar -->
    <div v-if="editor" class="flex items-center gap-0.5 p-1.5 border-b border-surface-200 dark:border-dark-50 bg-surface-50 dark:bg-dark-50/50 flex-wrap">
      <button
        type="button"
        @click="editor.chain().focus().toggleBold().run()"
        :class="['toolbar-btn', editor.isActive('bold') ? 'is-active' : '']"
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleItalic().run()"
        :class="['toolbar-btn italic', editor.isActive('italic') ? 'is-active' : '']"
        title="Italic (Ctrl+I)"
      >
        I
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleStrike().run()"
        :class="['toolbar-btn line-through', editor.isActive('strike') ? 'is-active' : '']"
        title="Strikethrough"
      >
        S
      </button>
      <div class="w-px h-4 bg-surface-200 dark:bg-dark-50 mx-1"></div>
      <button
        type="button"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="['toolbar-btn', editor.isActive('heading', { level: 1 }) ? 'is-active' : '']"
        title="Heading 1"
      >
        H1
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="['toolbar-btn', editor.isActive('heading', { level: 2 }) ? 'is-active' : '']"
        title="Heading 2"
      >
        H2
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="['toolbar-btn', editor.isActive('heading', { level: 3 }) ? 'is-active' : '']"
        title="Heading 3"
      >
        H3
      </button>
      <div class="w-px h-4 bg-surface-200 dark:bg-dark-50 mx-1"></div>
      <button
        type="button"
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="['toolbar-btn', editor.isActive('bulletList') ? 'is-active' : '']"
        title="Bullet list"
      >
        •
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="['toolbar-btn', editor.isActive('orderedList') ? 'is-active' : '']"
        title="Numbered list"
      >
        1.
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleBlockquote().run()"
        :class="['toolbar-btn', editor.isActive('blockquote') ? 'is-active' : '']"
        title="Quote"
      >
        ❝
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleCode().run()"
        :class="['toolbar-btn font-mono', editor.isActive('code') ? 'is-active' : '']"
        title="Inline code"
      >
        &lt;/&gt;
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleCodeBlock().run()"
        :class="['toolbar-btn', editor.isActive('codeBlock') ? 'is-active' : '']"
        title="Code block"
      >
        { }
      </button>
      <div class="w-px h-4 bg-surface-200 dark:bg-dark-50 mx-1"></div>
      <button
        type="button"
        @click="editor.chain().focus().undo().run()"
        :disabled="!editor.can().undo()"
        class="toolbar-btn"
        title="Undo (Ctrl+Z)"
      >
        ↶
      </button>
      <button
        type="button"
        @click="editor.chain().focus().redo().run()"
        :disabled="!editor.can().redo()"
        class="toolbar-btn"
        title="Redo (Ctrl+Y)"
      >
        ↷
      </button>
    </div>

    <EditorContent :editor="editor" class="rich-editor-content" />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import { Plugin } from '@tiptap/pm/state'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  minHeight?: string
}>()
const emit = defineEmits(['update:modelValue', 'paste-images'])

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute('data-width') || element.style.width || null,
        renderHTML: (attributes) => {
          if (!attributes.width) return {}
          return {
            'data-width': attributes.width,
            style: `width: ${attributes.width}; height: auto;`,
          }
        },
      },
    }
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            mousedown(view, event) {
              const mouseEvent = event as MouseEvent
              const target = mouseEvent.target as HTMLElement | null
              if (!target || target.tagName !== 'IMG') return false

              const img = target as HTMLImageElement
              const rect = img.getBoundingClientRect()
              const handleSize = 18
              const nearRightEdge = mouseEvent.clientX >= rect.right - handleSize
              const nearBottomEdge = mouseEvent.clientY >= rect.bottom - handleSize

              if (!nearRightEdge || !nearBottomEdge) return false

              const startX = mouseEvent.clientX
              const startWidth = rect.width
              const minWidth = 120
              const maxWidth = Math.max(240, view.dom.clientWidth - 24)
              const pos = view.posAtDOM(img, 0)
              if (pos < 0) return false

              mouseEvent.preventDefault()
              img.classList.add('is-resizing')

              const onMove = (moveEvent: MouseEvent) => {
                const delta = moveEvent.clientX - startX
                const width = Math.max(minWidth, Math.min(maxWidth, startWidth + delta))
                img.style.width = `${Math.round(width)}px`
                img.style.height = 'auto'
              }

              const onUp = () => {
                window.removeEventListener('mousemove', onMove)
                window.removeEventListener('mouseup', onUp)
                img.classList.remove('is-resizing')

                const node = view.state.doc.nodeAt(pos)
                if (!node || !img.style.width) return

                const tr = view.state.tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  width: img.style.width,
                })
                view.dispatch(tr)
              }

              window.addEventListener('mousemove', onMove)
              window.addEventListener('mouseup', onUp)
              return true
            },
          },
        },
      }),
    ]
  },
})

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error(`Cannot read file: ${file.name}`))
    reader.readAsDataURL(file)
  })
}

async function insertPastedImages(files: File[]) {
  if (!editor.value) return
  for (const file of files) {
    try {
      const dataUrl = await fileToDataUrl(file)
      editor.value.chain().focus().setImage({ src: dataUrl, alt: file.name }).insertContent('<p></p>').run()
    } catch {
      // Skip invalid clipboard image data, keep editor stable.
    }
  }
}

const editor = useEditor({
  content: props.modelValue || '',
  extensions: [
    StarterKit,
    ResizableImage.configure({
      allowBase64: true,
    }),
    Placeholder.configure({
      placeholder: props.placeholder || 'Nhập nội dung...',
    }),
  ],
  onUpdate: ({ editor }) => {
    const html = editor.getHTML()
    emit('update:modelValue', html === '<p></p>' ? '' : html)
  },
  editorProps: {
    handlePaste: (_view, event) => {
      const items = Array.from(event.clipboardData?.items || [])
      const imageFiles = items
        .filter((item) => item.type.startsWith('image/'))
        .map((item) => item.getAsFile())
        .filter((file): file is File => !!file)

      if (imageFiles.length > 0) {
        event.preventDefault()
        emit('paste-images', imageFiles)
        void insertPastedImages(imageFiles)
        return true
      }
      return false
    },
    handleDrop: (_view, event) => {
      const files = Array.from(event.dataTransfer?.files || [])
      const imageFiles = files.filter((file) => file.type.startsWith('image/'))

      if (imageFiles.length > 0) {
        event.preventDefault()
        emit('paste-images', imageFiles)
        void insertPastedImages(imageFiles)
        return true
      }
      return false
    },
  },
})

watch(() => props.modelValue, (newValue) => {
  if (!editor.value) return
  const current = editor.value.getHTML()
  if (newValue !== current && !(newValue === '' && current === '<p></p>')) {
    editor.value.commands.setContent(newValue || '', false)
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
.toolbar-btn {
  @apply inline-flex items-center justify-center min-w-[28px] h-7 px-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 rounded hover:bg-surface-200 dark:hover:bg-dark-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed;
}

.toolbar-btn.is-active {
  @apply bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300;
}

.rich-editor-content {
  min-height: v-bind('props.minHeight || "120px"');
}

:deep(.ProseMirror) {
  @apply p-3 text-sm text-gray-800 dark:text-gray-100 outline-none;
  min-height: v-bind('props.minHeight || "120px"');
}

:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  @apply text-gray-400;
  content: attr(data-placeholder);
  float: left;
  pointer-events: none;
  height: 0;
}

:deep(.ProseMirror p) {
  @apply my-1 leading-relaxed;
}

:deep(.ProseMirror h1) {
  @apply text-xl font-bold my-2;
}

:deep(.ProseMirror h2) {
  @apply text-lg font-bold my-2;
}

:deep(.ProseMirror h3) {
  @apply text-base font-bold my-1.5;
}

:deep(.ProseMirror ul) {
  @apply list-disc list-inside my-1;
}

:deep(.ProseMirror ol) {
  @apply list-decimal list-inside my-1;
}

:deep(.ProseMirror blockquote) {
  @apply border-l-4 border-surface-200 dark:border-dark-50 pl-3 italic text-gray-600 dark:text-gray-300 my-2;
}

:deep(.ProseMirror code) {
  @apply bg-surface-100 dark:bg-dark-50 text-pink-600 dark:text-pink-300 px-1 py-0.5 rounded text-xs font-mono;
}

:deep(.ProseMirror pre) {
  @apply bg-gray-900 text-gray-100 p-3 rounded-lg my-2 overflow-x-auto;
}

:deep(.ProseMirror pre code) {
  @apply bg-transparent text-gray-100 p-0;
}
::deep(.ProseMirror img) {
  @apply max-w-full h-auto rounded-lg border border-transparent my-2;
  cursor: nwse-resize;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

::deep(.ProseMirror img.ProseMirror-selectednode),
::deep(.ProseMirror img.is-resizing) {
  border-color: rgb(196 18 48 / 0.9);
  box-shadow: 0 0 0 2px rgb(196 18 48 / 0.25);
}
</style>

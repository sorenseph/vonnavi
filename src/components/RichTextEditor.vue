<script setup>
import { watch } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Escribe aquí...' }
})
const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue || '',
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] }
    }),
    Underline,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Image.configure({ inline: false, allowBase64: true }),
    Placeholder.configure({ placeholder: props.placeholder })
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
  editorProps: {
    attributes: { class: 'prose prose-sm max-w-none min-h-[200px] p-4 focus:outline-none' },
    // Conservar el formato HTML al pegar (negrita, cursiva, listas, etc.)
    transformPastedHTML: (html) => html
  }
})

watch(() => props.modelValue, (val) => {
  const ed = editor.value
  if (ed && val !== undefined && val !== ed.getHTML()) {
    ed.commands.setContent(val || '', false)
  }
})

const addImage = () => {
  const url = prompt('URL de la imagen:')
  if (url) editor.value?.chain().focus().setImage({ src: url }).run()
}
</script>

<template>
  <div class="rich-editor border rounded-xl overflow-hidden border-stone-200">
    <!-- Toolbar -->
    <div v-if="editor" class="flex flex-wrap gap-1 p-2 bg-stone-50 border-b border-stone-200">
      <button type="button" @click="editor.chain().focus().toggleBold().run()" class="p-2 rounded hover:bg-stone-200" :class="{ 'bg-stone-300': editor.isActive('bold') }" title="Negrita"><strong>B</strong></button>
      <button type="button" @click="editor.chain().focus().toggleItalic().run()" class="p-2 rounded hover:bg-stone-200" :class="{ 'bg-stone-300': editor.isActive('italic') }" title="Cursiva"><em>I</em></button>
      <button type="button" @click="editor.chain().focus().toggleUnderline().run()" class="p-2 rounded hover:bg-stone-200" :class="{ 'bg-stone-300': editor.isActive('underline') }" title="Subrayado"><u>U</u></button>
      <span class="w-px bg-stone-300 self-stretch mx-1" />
      <button type="button" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" class="p-2 rounded hover:bg-stone-200 text-sm" :class="{ 'bg-stone-300': editor.isActive('heading', { level: 1 }) }" title="Título 1">H1</button>
      <button type="button" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" class="p-2 rounded hover:bg-stone-200 text-sm" :class="{ 'bg-stone-300': editor.isActive('heading', { level: 2 }) }" title="Título 2">H2</button>
      <button type="button" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" class="p-2 rounded hover:bg-stone-200 text-sm" :class="{ 'bg-stone-300': editor.isActive('heading', { level: 3 }) }" title="Título 3">H3</button>
      <span class="w-px bg-stone-300 self-stretch mx-1" />
      <button type="button" @click="editor.chain().focus().setParagraph().run()" class="p-2 rounded hover:bg-stone-200 text-sm" :class="{ 'bg-stone-300': editor.isActive('paragraph') }" title="Párrafo">P</button>
      <button type="button" @click="editor.chain().focus().toggleBulletList().run()" class="p-2 rounded hover:bg-stone-200" :class="{ 'bg-stone-300': editor.isActive('bulletList') }" title="Viñetas">•</button>
      <button type="button" @click="editor.chain().focus().toggleOrderedList().run()" class="p-2 rounded hover:bg-stone-200" :class="{ 'bg-stone-300': editor.isActive('orderedList') }" title="Lista numerada">1.</button>
      <span class="w-px bg-stone-300 self-stretch mx-1" />
      <button type="button" @click="editor.chain().focus().setTextAlign('left').run()" class="p-2 rounded hover:bg-stone-200" :class="{ 'bg-stone-300': editor.isActive({ textAlign: 'left' }) }" title="Izquierda">←</button>
      <button type="button" @click="editor.chain().focus().setTextAlign('center').run()" class="p-2 rounded hover:bg-stone-200" :class="{ 'bg-stone-300': editor.isActive({ textAlign: 'center' }) }" title="Centro">↔</button>
      <button type="button" @click="editor.chain().focus().setTextAlign('right').run()" class="p-2 rounded hover:bg-stone-200" :class="{ 'bg-stone-300': editor.isActive({ textAlign: 'right' }) }" title="Derecha">→</button>
      <span class="w-px bg-stone-300 self-stretch mx-1" />
      <button type="button" @click="addImage" class="p-2 rounded hover:bg-stone-200" title="Insertar imagen">🖼</button>
    </div>
    <EditorContent :editor="editor" />
  </div>
</template>

<style scoped>
.rich-editor :deep(.tiptap) {
  min-height: 200px;
}
.rich-editor :deep(.tiptap p.is-editor-empty:first-child::before) {
  color: #94a3b8;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
</style>

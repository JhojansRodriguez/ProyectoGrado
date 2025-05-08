<!-- Componente de editor markdown -->
<template>
  <div 
    :class="[
      'markdown-editor',
      {
        'has-error': !!error,
        'has-success': success,
        'is-disabled': disabled,
        'is-readonly': readonly,
        'is-focused': isFocused,
        'is-preview': showPreview,
        'is-split': mode === 'split'
      }
    ]"
  >
    <!-- Barra de herramientas -->
    <div class="editor-toolbar">
      <!-- Modo de visualización -->
      <div class="toolbar-group">
        <button
          v-for="viewMode in viewModes"
          :key="viewMode.value"
          type="button"
          :class="[
            'toolbar-button',
            { active: mode === viewMode.value }
          ]"
          :title="viewMode.label"
          :disabled="disabled"
          @click="mode = viewMode.value"
        >
          <i :class="viewMode.icon"></i>
        </button>
      </div>

      <!-- Formato de texto -->
      <div v-if="!readonly && mode !== 'preview'" class="toolbar-group">
        <button
          v-for="format in textFormats"
          :key="format.key"
          type="button"
          class="toolbar-button"
          :title="format.label"
          :disabled="disabled"
          @click="insertFormat(format)"
        >
          <i :class="format.icon"></i>
        </button>
      </div>

      <!-- Acciones -->
      <div class="toolbar-actions">
        <!-- Copiar -->
        <button
          type="button"
          class="toolbar-button"
          :title="copied ? 'Copiado!' : 'Copiar contenido'"
          :disabled="disabled || !modelValue"
          @click="copyContent"
        >
          <i :class="copied ? 'fas fa-check' : 'fas fa-copy'"></i>
        </button>

        <!-- Pantalla completa -->
        <button
          v-if="fullscreenable"
          type="button"
          class="toolbar-button"
          :title="isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'"
          :disabled="disabled"
          @click="toggleFullscreen"
        >
          <i :class="isFullscreen ? 'fas fa-compress-alt' : 'fas fa-expand-alt'"></i>
        </button>
      </div>
    </div>

    <!-- Contenedor principal -->
    <div class="editor-container">
      <!-- Editor -->
      <div 
        v-show="mode !== 'preview'"
        class="editor-section"
      >
        <textarea
          ref="textarea"
          v-model="content"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          class="markdown-textarea"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
        ></textarea>
      </div>

      <!-- Vista previa -->
      <div 
        v-show="mode !== 'edit'"
        class="preview-section"
      >
        <div 
          class="markdown-preview"
          v-html="renderedContent"
        ></div>
      </div>
    </div>

    <!-- Mensaje de error -->
    <p v-if="error" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const props = defineProps({
  // Modelo
  modelValue: {
    type: String,
    default: ''
  },
  // Placeholder
  placeholder: {
    type: String,
    default: 'Escribe contenido en markdown...'
  },
  // Si permite pantalla completa
  fullscreenable: {
    type: Boolean,
    default: true
  },
  // Si está deshabilitado
  disabled: {
    type: Boolean,
    default: false
  },
  // Si es de solo lectura
  readonly: {
    type: Boolean,
    default: false
  },
  // Mensaje de error
  error: {
    type: String,
    default: ''
  },
  // Si tiene estado de éxito
  success: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur']);

// Referencias
const textarea = ref(null);

// Estado
const content = ref(props.modelValue);
const mode = ref('edit');
const isFocused = ref(false);
const isFullscreen = ref(false);
const copied = ref(false);

// Configuración
const viewModes = [
  { value: 'edit', label: 'Editor', icon: 'fas fa-edit' },
  { value: 'split', label: 'Vista dividida', icon: 'fas fa-columns' },
  { value: 'preview', label: 'Vista previa', icon: 'fas fa-eye' }
];

const textFormats = [
  { key: 'bold', label: 'Negrita', icon: 'fas fa-bold', before: '**', after: '**' },
  { key: 'italic', label: 'Cursiva', icon: 'fas fa-italic', before: '_', after: '_' },
  { key: 'heading', label: 'Encabezado', icon: 'fas fa-heading', before: '## ' },
  { key: 'link', label: 'Enlace', icon: 'fas fa-link', before: '[', after: '](url)' },
  { key: 'list', label: 'Lista', icon: 'fas fa-list-ul', before: '- ' },
  { key: 'quote', label: 'Cita', icon: 'fas fa-quote-right', before: '> ' },
  { key: 'code', label: 'Código', icon: 'fas fa-code', before: '`', after: '`' },
  { key: 'codeblock', label: 'Bloque de código', icon: 'fas fa-file-code', before: '```\n', after: '\n```' }
];

// Computed
const renderedContent = computed(() => {
  if (!content.value) return '';
  
  const html = marked(content.value, {
    breaks: true,
    gfm: true
  });

  return DOMPurify.sanitize(html);
});

// Métodos
const handleInput = () => {
  emit('update:modelValue', content.value);
  emit('change', content.value);
};

const handleFocus = (event) => {
  isFocused.value = true;
  emit('focus', event);
};

const handleBlur = (event) => {
  isFocused.value = false;
  emit('blur', event);
};

const insertFormat = (format) => {
  const textarea = document.querySelector('.markdown-textarea');
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = content.value;
  const selection = text.substring(start, end);

  let replacement = '';
  if (selection) {
    replacement = `${format.before}${selection}${format.after || ''}`;
  } else {
    replacement = `${format.before}texto${format.after || ''}`;
  }

  content.value = text.substring(0, start) + replacement + text.substring(end);
  handleInput();

  // Restaurar foco y selección
  textarea.focus();
  const newCursorPos = start + replacement.length;
  textarea.setSelectionRange(newCursorPos, newCursorPos);
};

const copyContent = async () => {
  try {
    const textToCopy = mode.value === 'preview' 
      ? textarea.value.innerText 
      : content.value;
    
    await navigator.clipboard.writeText(textToCopy);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Error al copiar:', error);
  }
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  
  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

// Lifecycle hooks
onMounted(() => {
  // Configurar marked
  marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: false,
    mangle: false
  });
});

onBeforeUnmount(() => {
  if (isFullscreen.value) {
    document.body.style.overflow = '';
  }
});

// Observadores
watch(() => props.modelValue, (newValue) => {
  if (newValue !== content.value) {
    content.value = newValue;
  }
});
</script>

<style scoped>
.markdown-editor {
  width: 100%;
  border: 2px solid var(--secondary-color);
  border-radius: var(--border-radius-lg);
  transition: all 0.3s ease;
}

/* Barra de herramientas */
.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  background: var(--secondary-color);
  border-top-left-radius: var(--border-radius-lg);
  border-top-right-radius: var(--border-radius-lg);
}

.toolbar-group {
  display: flex;
  gap: 0.25rem;
}

.toolbar-group:not(:last-child) {
  border-right: 1px solid var(--secondary-color);
  padding-right: 0.5rem;
}

.toolbar-button {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: white;
  color: var(--text-color);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all 0.3s ease;
}

.toolbar-button:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
}

.toolbar-button.active {
  background: var(--primary-color);
  color: white;
}

.toolbar-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Contenedor principal */
.editor-container {
  display: flex;
  height: 400px;
}

/* Editor */
.editor-section {
  flex: 1;
  min-width: 0;
}

.markdown-textarea {
  width: 100%;
  height: 100%;
  padding: 1rem;
  border: none;
  background: none;
  color: var(--text-color);
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: none;
}

.markdown-textarea:focus {
  outline: none;
}

/* Vista previa */
.preview-section {
  flex: 1;
  min-width: 0;
  padding: 1rem;
  overflow-y: auto;
  border-left: 1px solid var(--secondary-color);
}

.markdown-preview {
  font-size: 0.875rem;
  line-height: 1.6;
}

/* Mensaje de error */
.error-message {
  margin-top: 0.5rem;
  color: var(--error-color);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Estados */
.has-error {
  border-color: var(--error-color);
}

.has-success {
  border-color: var(--success-color);
}

.is-focused {
  border-color: var(--primary-color);
}

.is-disabled {
  opacity: 0.7;
  pointer-events: none;
}

/* Modos */
.is-preview .editor-section {
  display: none;
}

.is-preview .preview-section {
  border-left: none;
}

/* Pantalla completa */
.markdown-editor:fullscreen,
.markdown-editor[data-fullscreen="true"] {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  width: 100vw;
  height: 100vh;
  border-radius: 0;
}

.markdown-editor:fullscreen .editor-container,
.markdown-editor[data-fullscreen="true"] .editor-container {
  height: calc(100vh - 50px);
}

/* Estilos de la vista previa */
.markdown-preview :deep(h1),
.markdown-preview :deep(h2),
.markdown-preview :deep(h3),
.markdown-preview :deep(h4),
.markdown-preview :deep(h5),
.markdown-preview :deep(h6) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  line-height: 1.2;
}

.markdown-preview :deep(p) {
  margin: 1em 0;
}

.markdown-preview :deep(a) {
  color: var(--primary-color);
  text-decoration: none;
}

.markdown-preview :deep(a:hover) {
  text-decoration: underline;
}

.markdown-preview :deep(ul),
.markdown-preview :deep(ol) {
  margin: 1em 0;
  padding-left: 2em;
}

.markdown-preview :deep(blockquote) {
  margin: 1em 0;
  padding-left: 1em;
  border-left: 4px solid var(--secondary-color);
  color: var(--text-light);
}

.markdown-preview :deep(code) {
  padding: 0.2em 0.4em;
  background: var(--secondary-color);
  border-radius: var(--border-radius-sm);
  font-family: 'Fira Code', monospace;
}

.markdown-preview :deep(pre) {
  margin: 1em 0;
  padding: 1em;
  background: var(--secondary-color);
  border-radius: var(--border-radius-md);
  overflow-x: auto;
}

.markdown-preview :deep(pre code) {
  padding: 0;
  background: none;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .markdown-editor {
    background: #2d3748;
  }

  .editor-toolbar {
    background: #4a5568;
  }

  .toolbar-button {
    background: #2d3748;
    color: #E2E8F0;
  }

  .toolbar-button:hover:not(:disabled) {
    background: var(--primary-light);
  }

  .toolbar-button.active {
    background: var(--primary-light);
  }

  .markdown-textarea {
    color: #E2E8F0;
  }

  .preview-section {
    border-color: #4a5568;
  }

  .markdown-preview :deep(a) {
    color: var(--primary-light);
  }

  .markdown-preview :deep(blockquote) {
    border-color: #4a5568;
    color: #A0AEC0;
  }

  .markdown-preview :deep(code) {
    background: #4a5568;
  }

  .markdown-preview :deep(pre) {
    background: #1a202c;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .markdown-editor,
  .toolbar-button {
    transition: none;
  }
}

/* Soporte para navegación con teclado */
.toolbar-button:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

@media (prefers-color-scheme: dark) {
  .toolbar-button:focus {
    outline-color: var(--primary-light);
  }
}

/* Soporte para pantallas pequeñas */
@media (max-width: 640px) {
  .editor-toolbar {
    flex-wrap: wrap;
  }

  .is-split .editor-container {
    flex-direction: column;
  }

  .is-split .preview-section {
    border-left: none;
    border-top: 1px solid var(--secondary-color);
  }
}
</style>

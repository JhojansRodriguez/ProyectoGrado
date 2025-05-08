<!-- Componente de editor de código -->
<template>
  <div 
    :class="[
      'code-editor',
      {
        'has-error': !!error,
        'has-success': success,
        'is-disabled': disabled,
        'is-readonly': readonly,
        'is-focused': isFocused,
        'with-line-numbers': showLineNumbers
      }
    ]"
  >
    <!-- Barra de herramientas -->
    <div class="editor-toolbar">
      <!-- Selector de lenguaje -->
      <BaseSelect
        v-if="showLanguageSelect"
        v-model="selectedLanguage"
        :options="languageOptions"
        size="sm"
        :disabled="disabled || readonly"
      />

      <!-- Acciones -->
      <div class="toolbar-actions">
        <!-- Copiar -->
        <button
          type="button"
          class="toolbar-button"
          :title="copied ? 'Copiado!' : 'Copiar código'"
          :disabled="disabled || !modelValue"
          @click="copyCode"
        >
          <i :class="copied ? 'fas fa-check' : 'fas fa-copy'"></i>
        </button>

        <!-- Formatear -->
        <button
          v-if="formattable"
          type="button"
          class="toolbar-button"
          title="Formatear código"
          :disabled="disabled || readonly || !modelValue"
          @click="formatCode"
        >
          <i class="fas fa-indent"></i>
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

    <!-- Editor -->
    <div class="editor-container">
      <!-- Números de línea -->
      <div v-if="showLineNumbers" class="line-numbers">
        <div 
          v-for="n in lineCount"
          :key="n"
          class="line-number"
        >
          {{ n }}
        </div>
      </div>

      <!-- Área de código -->
      <textarea
        ref="textarea"
        v-model="code"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :spellcheck="false"
        class="code-area"
        @input="handleInput"
        @keydown="handleKeydown"
        @focus="handleFocus"
        @blur="handleBlur"
      ></textarea>

      <!-- Resaltado de sintaxis -->
      <pre 
        ref="highlight"
        class="highlight-area"
        aria-hidden="true"
      ><code :class="languageClass" v-html="highlightedCode"></code></pre>
    </div>

    <!-- Mensaje de error -->
    <p v-if="error" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import BaseSelect from './BaseSelect.vue';
import hljs from 'highlight.js';

const props = defineProps({
  // Modelo
  modelValue: {
    type: String,
    default: ''
  },
  // Lenguaje
  language: {
    type: String,
    default: 'plaintext'
  },
  // Placeholder
  placeholder: {
    type: String,
    default: 'Escribe o pega tu código aquí'
  },
  // Si muestra selector de lenguaje
  showLanguageSelect: {
    type: Boolean,
    default: true
  },
  // Si muestra números de línea
  showLineNumbers: {
    type: Boolean,
    default: true
  },
  // Si permite formatear
  formattable: {
    type: Boolean,
    default: true
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
const highlight = ref(null);

// Estado
const code = ref(props.modelValue);
const selectedLanguage = ref(props.language);
const isFocused = ref(false);
const isFullscreen = ref(false);
const copied = ref(false);

// Lenguajes disponibles
const languageOptions = [
  { value: 'plaintext', label: 'Texto plano' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'sql', label: 'SQL' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'markdown', label: 'Markdown' }
];

// Computed
const languageClass = computed(() => {
  return `language-${selectedLanguage.value}`;
});

const highlightedCode = computed(() => {
  if (!code.value) return '';
  
  const highlighted = hljs.highlight(code.value, {
    language: selectedLanguage.value
  }).value;

  return highlighted + '\n';
});

const lineCount = computed(() => {
  return (code.value.match(/\n/g) || []).length + 1;
});

// Métodos
const handleInput = () => {
  syncScroll();
  emit('update:modelValue', code.value);
  emit('change', code.value);
};

const handleKeydown = (event) => {
  // Soporte para tabulación
  if (event.key === 'Tab') {
    event.preventDefault();
    const start = textarea.value.selectionStart;
    const end = textarea.value.selectionEnd;
    
    code.value = code.value.substring(0, start) + '  ' + code.value.substring(end);
    textarea.value.selectionStart = textarea.value.selectionEnd = start + 2;
    handleInput();
  }
};

const handleFocus = (event) => {
  isFocused.value = true;
  emit('focus', event);
};

const handleBlur = (event) => {
  isFocused.value = false;
  emit('blur', event);
};

const syncScroll = () => {
  highlight.value.scrollTop = textarea.value.scrollTop;
  highlight.value.scrollLeft = textarea.value.scrollLeft;
};

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(code.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Error al copiar:', error);
  }
};

const formatCode = () => {
  try {
    // Aquí podrías integrar un formateador como prettier
    // Por ahora solo hacemos un formato básico de indentación
    const formatted = code.value
      .split('\n')
      .map(line => line.trim())
      .join('\n');
    
    code.value = formatted;
    handleInput();
  } catch (error) {
    console.error('Error al formatear:', error);
  }
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  
  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }

  nextTick(() => {
    syncScroll();
  });
};

// Lifecycle hooks
onMounted(() => {
  textarea.value.addEventListener('scroll', syncScroll);
});

onBeforeUnmount(() => {
  textarea.value?.removeEventListener('scroll', syncScroll);
  if (isFullscreen.value) {
    document.body.style.overflow = '';
  }
});

// Observadores
watch(() => props.modelValue, (newValue) => {
  if (newValue !== code.value) {
    code.value = newValue;
  }
});

watch(() => props.language, (newValue) => {
  selectedLanguage.value = newValue;
});
</script>

<style scoped>
.code-editor {
  width: 100%;
  border: 2px solid var(--secondary-color);
  border-radius: var(--border-radius-lg);
  transition: all 0.3s ease;
}

/* Barra de herramientas */
.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem;
  background: var(--secondary-color);
  border-top-left-radius: var(--border-radius-lg);
  border-top-right-radius: var(--border-radius-lg);
}

.toolbar-actions {
  display: flex;
  gap: 0.5rem;
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

.toolbar-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Contenedor del editor */
.editor-container {
  position: relative;
  height: 300px;
  overflow: hidden;
}

/* Números de línea */
.line-numbers {
  position: absolute;
  top: 0;
  left: 0;
  width: 3rem;
  height: 100%;
  padding: 1rem 0;
  background: var(--secondary-color);
  border-right: 1px solid var(--secondary-color);
  user-select: none;
  z-index: 1;
}

.line-number {
  padding: 0 0.5rem;
  color: var(--text-light);
  font-size: 0.875rem;
  text-align: right;
  line-height: 1.5;
}

/* Área de código */
.code-area {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 1rem;
  padding-left: calc(3rem + 1rem);
  border: none;
  background: none;
  color: transparent;
  caret-color: var(--text-color);
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  tab-size: 2;
  resize: none;
  z-index: 2;
}

.code-area:focus {
  outline: none;
}

/* Área de resaltado */
.highlight-area {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 1rem;
  padding-left: calc(3rem + 1rem);
  margin: 0;
  background: none;
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  pointer-events: none;
  white-space: pre;
  word-wrap: normal;
  overflow-x: auto;
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

/* Pantalla completa */
.code-editor:fullscreen,
.code-editor[data-fullscreen="true"] {
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

.code-editor:fullscreen .editor-container,
.code-editor[data-fullscreen="true"] .editor-container {
  height: calc(100vh - 50px);
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .code-editor {
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

  .line-numbers {
    background: #1a202c;
    border-color: #4a5568;
  }

  .line-number {
    color: #A0AEC0;
  }

  .code-area {
    caret-color: #E2E8F0;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .code-editor,
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
</style>

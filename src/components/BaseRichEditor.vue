<!-- Componente de editor de texto enriquecido -->
<template>
  <div 
    :class="[
      'rich-editor',
      {
        'has-error': !!error,
        'has-success': success,
        'is-disabled': disabled,
        'is-readonly': readonly,
        'is-focused': isFocused
      }
    ]"
  >
    <!-- Barra de herramientas -->
    <div 
      v-if="!readonly"
      class="editor-toolbar"
    >
      <!-- Formato de texto -->
      <div class="toolbar-group">
        <button
          v-for="format in textFormats"
          :key="format.command"
          type="button"
          :class="[
            'toolbar-button',
            { active: isFormatActive(format.command) }
          ]"
          :title="format.label"
          :disabled="disabled"
          @click="execCommand(format.command)"
        >
          <i :class="format.icon"></i>
        </button>
      </div>

      <!-- Alineación -->
      <div class="toolbar-group">
        <button
          v-for="align in alignments"
          :key="align.command"
          type="button"
          :class="[
            'toolbar-button',
            { active: isFormatActive(align.command) }
          ]"
          :title="align.label"
          :disabled="disabled"
          @click="execCommand(align.command)"
        >
          <i :class="align.icon"></i>
        </button>
      </div>

      <!-- Listas -->
      <div class="toolbar-group">
        <button
          v-for="list in lists"
          :key="list.command"
          type="button"
          :class="[
            'toolbar-button',
            { active: isFormatActive(list.command) }
          ]"
          :title="list.label"
          :disabled="disabled"
          @click="execCommand(list.command)"
        >
          <i :class="list.icon"></i>
        </button>
      </div>

      <!-- Enlaces -->
      <div class="toolbar-group">
        <button
          type="button"
          :class="[
            'toolbar-button',
            { active: isFormatActive('createLink') }
          ]"
          title="Insertar enlace"
          :disabled="disabled"
          @click="handleLink"
        >
          <i class="fas fa-link"></i>
        </button>
        <button
          type="button"
          class="toolbar-button"
          title="Eliminar enlace"
          :disabled="disabled || !isFormatActive('createLink')"
          @click="execCommand('unlink')"
        >
          <i class="fas fa-unlink"></i>
        </button>
      </div>

      <!-- Limpiar formato -->
      <div class="toolbar-group">
        <button
          type="button"
          class="toolbar-button"
          title="Limpiar formato"
          :disabled="disabled"
          @click="execCommand('removeFormat')"
        >
          <i class="fas fa-eraser"></i>
        </button>
      </div>
    </div>

    <!-- Área editable -->
    <div
      ref="editor"
      class="editor-content"
      contenteditable="true"
      :disabled="disabled"
      :readonly="readonly"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @paste="handlePaste"
      @keydown="handleKeydown"
      v-html="modelValue"
    ></div>

    <!-- Mensaje de error -->
    <p v-if="error" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </p>

    <!-- Modal de enlace -->
    <BaseModal
      v-model="showLinkModal"
      title="Insertar enlace"
      size="sm"
    >
      <BaseForm @submit="insertLink">
        <BaseFormGroup>
          <BaseInput
            v-model="linkUrl"
            label="URL"
            placeholder="https://ejemplo.com"
            required
          />
        </BaseFormGroup>
        <BaseFormGroup>
          <BaseInput
            v-model="linkText"
            label="Texto"
            placeholder="Texto del enlace"
            required
          />
        </BaseFormGroup>
        <template #actions>
          <BaseButton
            variant="secondary"
            @click="showLinkModal = false"
          >
            Cancelar
          </BaseButton>
          <BaseButton
            type="submit"
            variant="primary"
          >
            Insertar
          </BaseButton>
        </template>
      </BaseForm>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import BaseModal from './BaseModal.vue';
import BaseForm from './BaseForm.vue';
import BaseFormGroup from './BaseFormGroup.vue';
import BaseInput from './BaseInput.vue';
import BaseButton from './BaseButton.vue';

const props = defineProps({
  // Modelo
  modelValue: {
    type: String,
    default: ''
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
const editor = ref(null);

// Estado
const isFocused = ref(false);
const showLinkModal = ref(false);
const linkUrl = ref('');
const linkText = ref('');
const selectedRange = ref(null);

// Configuración
const textFormats = [
  { command: 'bold', label: 'Negrita', icon: 'fas fa-bold' },
  { command: 'italic', label: 'Cursiva', icon: 'fas fa-italic' },
  { command: 'underline', label: 'Subrayado', icon: 'fas fa-underline' },
  { command: 'strikeThrough', label: 'Tachado', icon: 'fas fa-strikethrough' }
];

const alignments = [
  { command: 'justifyLeft', label: 'Alinear a la izquierda', icon: 'fas fa-align-left' },
  { command: 'justifyCenter', label: 'Centrar', icon: 'fas fa-align-center' },
  { command: 'justifyRight', label: 'Alinear a la derecha', icon: 'fas fa-align-right' },
  { command: 'justifyFull', label: 'Justificar', icon: 'fas fa-align-justify' }
];

const lists = [
  { command: 'insertUnorderedList', label: 'Lista con viñetas', icon: 'fas fa-list-ul' },
  { command: 'insertOrderedList', label: 'Lista numerada', icon: 'fas fa-list-ol' }
];

// Métodos
const execCommand = (command, value = null) => {
  document.execCommand(command, false, value);
  emit('update:modelValue', editor.value.innerHTML);
  emit('change', editor.value.innerHTML);
};

const isFormatActive = (command) => {
  return document.queryCommandState(command);
};

const handleInput = () => {
  emit('update:modelValue', editor.value.innerHTML);
  emit('change', editor.value.innerHTML);
};

const handleFocus = (event) => {
  isFocused.value = true;
  emit('focus', event);
};

const handleBlur = (event) => {
  isFocused.value = false;
  emit('blur', event);
};

const handlePaste = (event) => {
  event.preventDefault();
  const text = event.clipboardData.getData('text/plain');
  document.execCommand('insertText', false, text);
};

const handleKeydown = (event) => {
  if (event.key === 'Tab') {
    event.preventDefault();
    document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
  }
};

const handleLink = () => {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    selectedRange.value = selection.getRangeAt(0);
    linkText.value = selectedRange.value.toString();
    showLinkModal.value = true;
  }
};

const insertLink = () => {
  if (selectedRange.value) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(selectedRange.value);
    
    if (linkText.value !== selectedRange.value.toString()) {
      document.execCommand('insertText', false, linkText.value);
    }
    
    document.execCommand('createLink', false, linkUrl.value);
  }
  
  showLinkModal.value = false;
  linkUrl.value = '';
  linkText.value = '';
  selectedRange.value = null;
};

// Lifecycle hooks
onMounted(() => {
  if (props.modelValue) {
    editor.value.innerHTML = props.modelValue;
  }
});

onBeforeUnmount(() => {
  selectedRange.value = null;
});
</script>

<style scoped>
.rich-editor {
  border: 2px solid var(--secondary-color);
  border-radius: var(--border-radius-lg);
  transition: border-color 0.3s ease;
}

.rich-editor.is-focused {
  border-color: var(--primary-color);
}

/* Barra de herramientas */
.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
  border-bottom: 1px solid var(--secondary-color);
  background: var(--secondary-color);
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

/* Área editable */
.editor-content {
  min-height: 200px;
  padding: 1rem;
  outline: none;
  overflow-y: auto;
}

.editor-content[contenteditable="false"] {
  background: var(--secondary-color);
  cursor: not-allowed;
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

.is-disabled {
  opacity: 0.7;
  pointer-events: none;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .editor-toolbar {
    background: #4a5568;
    border-color: #4a5568;
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

  .editor-content {
    color: #E2E8F0;
    background: #2d3748;
  }

  .editor-content[contenteditable="false"] {
    background: #4a5568;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .rich-editor,
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

/* Estilos del contenido del editor */
.editor-content :deep(a) {
  color: var(--primary-color);
  text-decoration: none;
}

.editor-content :deep(a):hover {
  text-decoration: underline;
}

.editor-content :deep(ul),
.editor-content :deep(ol) {
  padding-left: 2rem;
}

.editor-content :deep(blockquote) {
  margin: 1rem 0;
  padding-left: 1rem;
  border-left: 4px solid var(--secondary-color);
  color: var(--text-light);
}

@media (prefers-color-scheme: dark) {
  .editor-content :deep(a) {
    color: var(--primary-light);
  }

  .editor-content :deep(blockquote) {
    border-color: #4a5568;
    color: #A0AEC0;
  }
}
</style>

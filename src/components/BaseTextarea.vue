<!-- Componente de área de texto base -->
<template>
  <div 
    :class="[
      'base-textarea',
      { 
        'has-error': !!error,
        'has-success': success,
        'is-disabled': disabled,
        'is-readonly': readonly,
        'auto-height': autoHeight
      }
    ]"
  >
    <!-- Etiqueta -->
    <label v-if="label" :for="id" class="textarea-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>

    <!-- Contenedor del textarea -->
    <div class="textarea-container">
      <textarea
        :id="id"
        :value="modelValue"
        :placeholder="placeholder"
        :rows="rows"
        :maxlength="maxlength"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        ref="textareaRef"
      ></textarea>

      <!-- Botón de redimensionar -->
      <button 
        v-if="resizable && !autoHeight" 
        type="button"
        class="resize-handle"
        title="Redimensionar"
      >
        <i class="fas fa-grip-lines"></i>
      </button>
    </div>

    <!-- Contador de caracteres -->
    <div v-if="maxlength" class="char-counter">
      {{ modelValue?.length || 0 }}/{{ maxlength }}
    </div>

    <!-- Mensaje de error -->
    <p v-if="error" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </p>

    <!-- Texto de ayuda -->
    <p v-else-if="helpText" class="help-text">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  // Modelo
  modelValue: {
    type: String,
    default: ''
  },
  // ID único
  id: {
    type: String,
    required: true
  },
  // Etiqueta
  label: {
    type: String,
    default: ''
  },
  // Placeholder
  placeholder: {
    type: String,
    default: ''
  },
  // Número de filas
  rows: {
    type: Number,
    default: 3
  },
  // Si es requerido
  required: {
    type: Boolean,
    default: false
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
  // Si se puede redimensionar
  resizable: {
    type: Boolean,
    default: true
  },
  // Si ajusta altura automáticamente
  autoHeight: {
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
  },
  // Texto de ayuda
  helpText: {
    type: String,
    default: ''
  },
  // Longitud máxima
  maxlength: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus']);

const textareaRef = ref(null);

// Métodos
const handleInput = (event) => {
  emit('update:modelValue', event.target.value);
  if (props.autoHeight) {
    adjustHeight();
  }
};

const handleBlur = (event) => {
  emit('blur', event);
};

const handleFocus = (event) => {
  emit('focus', event);
};

const adjustHeight = () => {
  if (!textareaRef.value) return;
  
  // Resetear altura
  textareaRef.value.style.height = 'auto';
  // Establecer nueva altura basada en el contenido
  textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px';
};

// Observar cambios en el valor para ajustar altura
watch(() => props.modelValue, () => {
  if (props.autoHeight) {
    // Usar nextTick para asegurar que el DOM se ha actualizado
    nextTick(adjustHeight);
  }
});

// Ajustar altura inicial
onMounted(() => {
  if (props.autoHeight && props.modelValue) {
    adjustHeight();
  }
});
</script>

<style scoped>
.base-textarea {
  margin-bottom: 1rem;
}

.textarea-label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-color);
  font-weight: 500;
  font-size: 0.9rem;
}

.required-mark {
  color: var(--error-color);
  margin-left: 0.25rem;
}

.textarea-container {
  position: relative;
  display: flex;
}

textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--secondary-color);
  border-radius: 8px;
  font-size: 1rem;
  color: var(--text-color);
  background: white;
  transition: all 0.3s ease;
  font-family: inherit;
  line-height: 1.5;
  resize: vertical;
}

/* Deshabilitar resize si autoHeight está activo */
.auto-height textarea {
  resize: none;
  overflow-y: hidden;
}

/* Botón de redimensionar */
.resize-handle {
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #666;
  cursor: se-resize;
  opacity: 0.5;
  transition: opacity 0.3s;
}

.resize-handle:hover {
  opacity: 1;
}

/* Estados */
textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.has-error textarea {
  border-color: var(--error-color);
}

.has-success textarea {
  border-color: var(--success-color);
}

.is-disabled textarea {
  background-color: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.7;
}

.is-readonly textarea {
  background-color: #f8f9fa;
  cursor: default;
}

/* Mensajes */
.error-message,
.help-text {
  font-size: 0.85rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-message {
  color: var(--error-color);
}

.help-text {
  color: #666;
}

/* Contador de caracteres */
.char-counter {
  font-size: 0.75rem;
  color: #666;
  text-align: right;
  margin-top: 0.25rem;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  textarea {
    background: #2d3748;
    color: white;
    border-color: #4a5568;
  }

  textarea:focus {
    border-color: var(--primary-light);
  }

  .textarea-label {
    color: #E2E8F0;
  }

  .help-text,
  .char-counter {
    color: #A0AEC0;
  }

  .is-disabled textarea,
  .is-readonly textarea {
    background-color: #1a202c;
  }

  .resize-handle {
    color: #A0AEC0;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  textarea,
  .resize-handle {
    transition: none;
  }
}
</style>

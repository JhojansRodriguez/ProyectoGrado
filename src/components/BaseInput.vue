<!-- Componente de entrada de texto base -->
<template>
  <div 
    :class="[
      'base-input',
      { 
        'has-error': !!error,
        'has-success': success,
        'is-disabled': disabled,
        'is-readonly': readonly
      }
    ]"
  >
    <!-- Etiqueta -->
    <label v-if="label" :for="id" class="input-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>

    <!-- Contenedor del input -->
    <div class="input-container">
      <!-- Icono izquierdo -->
      <i v-if="iconLeft" :class="['input-icon left', iconLeft]"></i>

      <!-- Input -->
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :maxlength="maxlength"
        :min="min"
        :max="max"
        :step="step"
        :pattern="pattern"
        :autocomplete="autocomplete"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      >

      <!-- Icono derecho o botón de limpiar -->
      <template v-if="iconRight || clearable">
        <i 
          v-if="iconRight && !shouldShowClear" 
          :class="['input-icon right', iconRight]"
        ></i>
        <button
          v-else-if="shouldShowClear"
          type="button"
          class="clear-button"
          @click="clearInput"
          title="Limpiar"
        >
          <i class="fas fa-times"></i>
        </button>
      </template>
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
import { computed } from 'vue';

const props = defineProps({
  // Modelo
  modelValue: {
    type: [String, Number],
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
  // Tipo de input
  type: {
    type: String,
    default: 'text'
  },
  // Placeholder
  placeholder: {
    type: String,
    default: ''
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
  // Icono izquierdo
  iconLeft: {
    type: String,
    default: ''
  },
  // Icono derecho
  iconRight: {
    type: String,
    default: ''
  },
  // Si se puede limpiar
  clearable: {
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
  },
  // Valor mínimo (para inputs numéricos)
  min: {
    type: [Number, String],
    default: null
  },
  // Valor máximo (para inputs numéricos)
  max: {
    type: [Number, String],
    default: null
  },
  // Paso (para inputs numéricos)
  step: {
    type: [Number, String],
    default: null
  },
  // Patrón de validación
  pattern: {
    type: String,
    default: null
  },
  // Autocompletado
  autocomplete: {
    type: String,
    default: 'off'
  }
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'clear']);

// Computed
const shouldShowClear = computed(() => {
  return props.clearable && props.modelValue && !props.disabled && !props.readonly;
});

// Métodos
const handleInput = (event) => {
  emit('update:modelValue', event.target.value);
};

const handleBlur = (event) => {
  emit('blur', event);
};

const handleFocus = (event) => {
  emit('focus', event);
};

const clearInput = () => {
  emit('update:modelValue', '');
  emit('clear');
};
</script>

<style scoped>
.base-input {
  margin-bottom: 1rem;
}

.input-label {
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

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--secondary-color);
  border-radius: 8px;
  font-size: 1rem;
  color: var(--text-color);
  background: white;
  transition: all 0.3s ease;
}

/* Input con iconos */
input.has-icon-left {
  padding-left: 2.5rem;
}

input.has-icon-right {
  padding-right: 2.5rem;
}

.input-icon {
  position: absolute;
  color: #666;
  font-size: 1rem;
}

.input-icon.left {
  left: 1rem;
}

.input-icon.right {
  right: 1rem;
}

/* Botón de limpiar */
.clear-button {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.clear-button:hover {
  opacity: 1;
}

/* Estados */
input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.has-error input {
  border-color: var(--error-color);
}

.has-success input {
  border-color: var(--success-color);
}

.is-disabled input {
  background-color: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.7;
}

.is-readonly input {
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
  input {
    background: #2d3748;
    color: white;
    border-color: #4a5568;
  }

  input:focus {
    border-color: var(--primary-light);
  }

  .input-label {
    color: #E2E8F0;
  }

  .help-text,
  .char-counter {
    color: #A0AEC0;
  }

  .is-disabled input,
  .is-readonly input {
    background-color: #1a202c;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  input,
  .clear-button {
    transition: none;
  }
}
</style>

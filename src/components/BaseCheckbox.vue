<!-- Componente de checkbox base -->
<template>
  <div 
    :class="[
      'base-checkbox',
      {
        'is-checked': modelValue,
        'is-disabled': disabled,
        'has-error': !!error,
        'has-success': success
      }
    ]"
  >
    <label :class="['checkbox-label', { 'reverse': labelPosition === 'left' }]">
      <!-- Input real (oculto) -->
      <input
        type="checkbox"
        :id="id"
        :checked="modelValue"
        :disabled="disabled"
        :required="required"
        :name="name"
        :value="value"
        @change="handleChange"
        @blur="handleBlur"
        @focus="handleFocus"
      >

      <!-- Checkbox personalizado -->
      <span class="checkbox-custom">
        <i class="fas fa-check check-icon"></i>
      </span>

      <!-- Contenido del label -->
      <span class="label-content">
        <slot>{{ label }}</slot>
        <span v-if="required" class="required-mark">*</span>
      </span>
    </label>

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
const props = defineProps({
  // Modelo
  modelValue: {
    type: Boolean,
    default: false
  },
  // ID único
  id: {
    type: String,
    required: true
  },
  // Label
  label: {
    type: String,
    default: ''
  },
  // Posición del label (left o right)
  labelPosition: {
    type: String,
    default: 'right',
    validator: (value) => ['left', 'right'].includes(value)
  },
  // Si está deshabilitado
  disabled: {
    type: Boolean,
    default: false
  },
  // Si es requerido
  required: {
    type: Boolean,
    default: false
  },
  // Nombre del campo
  name: {
    type: String,
    default: ''
  },
  // Valor del checkbox
  value: {
    type: [String, Number, Boolean, Object],
    default: true
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
  }
});

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus']);

// Métodos
const handleChange = (event) => {
  emit('update:modelValue', event.target.checked);
  emit('change', event.target.checked);
};

const handleBlur = (event) => {
  emit('blur', event);
};

const handleFocus = (event) => {
  emit('focus', event);
};
</script>

<style scoped>
.base-checkbox {
  margin-bottom: 1rem;
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}

.checkbox-label.reverse {
  flex-direction: row-reverse;
}

/* Input real (oculto) */
input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

/* Checkbox personalizado */
.checkbox-custom {
  position: relative;
  width: 20px;
  height: 20px;
  border: 2px solid var(--secondary-color);
  border-radius: 4px;
  background: white;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

/* Icono de check */
.check-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  color: white;
  font-size: 12px;
  transition: transform 0.2s ease;
}

/* Label */
.label-content {
  color: var(--text-color);
  font-size: 0.9rem;
  line-height: 1.4;
}

.required-mark {
  color: var(--error-color);
  margin-left: 0.25rem;
}

/* Estados */
input:checked + .checkbox-custom {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

input:checked + .checkbox-custom .check-icon {
  transform: translate(-50%, -50%) scale(1);
}

input:focus + .checkbox-custom {
  box-shadow: 0 0 0 3px rgba(95, 127, 121, 0.2);
}

.is-disabled .checkbox-label {
  cursor: not-allowed;
  opacity: 0.7;
}

.has-error .checkbox-custom {
  border-color: var(--error-color);
}

.has-error input:checked + .checkbox-custom {
  background: var(--error-color);
  border-color: var(--error-color);
}

.has-success .checkbox-custom {
  border-color: var(--success-color);
}

.has-success input:checked + .checkbox-custom {
  background: var(--success-color);
  border-color: var(--success-color);
}

/* Mensajes */
.error-message,
.help-text {
  font-size: 0.85rem;
  margin-top: 0.5rem;
  margin-left: 2.75rem;
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

/* Hover */
.checkbox-label:hover .checkbox-custom {
  border-color: var(--primary-color);
}

.is-disabled .checkbox-label:hover .checkbox-custom {
  border-color: var(--secondary-color);
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .checkbox-custom {
    background: #2d3748;
    border-color: #4a5568;
  }

  .label-content {
    color: #E2E8F0;
  }

  .help-text {
    color: #A0AEC0;
  }

  input:checked + .checkbox-custom {
    background: var(--primary-light);
    border-color: var(--primary-light);
  }

  .checkbox-label:hover .checkbox-custom {
    border-color: var(--primary-light);
  }

  input:focus + .checkbox-custom {
    box-shadow: 0 0 0 3px rgba(184, 216, 208, 0.2);
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .checkbox-custom,
  .check-icon {
    transition: none;
  }
}
</style>

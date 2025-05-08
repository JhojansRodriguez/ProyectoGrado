<!-- Componente de radio button base -->
<template>
  <div 
    :class="[
      'base-radio',
      {
        'is-checked': isChecked,
        'is-disabled': disabled,
        'has-error': !!error,
        'has-success': success
      }
    ]"
  >
    <label :class="['radio-label', { 'reverse': labelPosition === 'left' }]">
      <!-- Input real (oculto) -->
      <input
        type="radio"
        :id="id"
        :name="name"
        :value="value"
        :checked="isChecked"
        :disabled="disabled"
        :required="required"
        @change="handleChange"
        @blur="handleBlur"
        @focus="handleFocus"
      >

      <!-- Radio personalizado -->
      <span class="radio-custom">
        <span class="radio-dot"></span>
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
import { computed } from 'vue';

const props = defineProps({
  // Modelo
  modelValue: {
    type: [String, Number, Boolean, Object],
    required: true
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
  // Valor del radio
  value: {
    type: [String, Number, Boolean, Object],
    required: true
  },
  // Posición del label (left o right)
  labelPosition: {
    type: String,
    default: 'right',
    validator: (value) => ['left', 'right'].includes(value)
  },
  // Nombre del grupo de radios
  name: {
    type: String,
    required: true
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

// Computed
const isChecked = computed(() => {
  return props.modelValue === props.value;
});

// Métodos
const handleChange = (event) => {
  if (event.target.checked) {
    emit('update:modelValue', props.value);
    emit('change', props.value);
  }
};

const handleBlur = (event) => {
  emit('blur', event);
};

const handleFocus = (event) => {
  emit('focus', event);
};
</script>

<style scoped>
.base-radio {
  margin-bottom: 1rem;
}

.radio-label {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}

.radio-label.reverse {
  flex-direction: row-reverse;
}

/* Input real (oculto) */
input[type="radio"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

/* Radio personalizado */
.radio-custom {
  position: relative;
  width: 20px;
  height: 20px;
  border: 2px solid var(--secondary-color);
  border-radius: 50%;
  background: white;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

/* Punto central */
.radio-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
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
input:checked + .radio-custom {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

input:checked + .radio-custom .radio-dot {
  transform: translate(-50%, -50%) scale(1);
}

input:focus + .radio-custom {
  box-shadow: 0 0 0 3px rgba(95, 127, 121, 0.2);
}

.is-disabled .radio-label {
  cursor: not-allowed;
  opacity: 0.7;
}

.has-error .radio-custom {
  border-color: var(--error-color);
}

.has-error input:checked + .radio-custom {
  background: var(--error-color);
  border-color: var(--error-color);
}

.has-success .radio-custom {
  border-color: var(--success-color);
}

.has-success input:checked + .radio-custom {
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
.radio-label:hover .radio-custom {
  border-color: var(--primary-color);
}

.is-disabled .radio-label:hover .radio-custom {
  border-color: var(--secondary-color);
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .radio-custom {
    background: #2d3748;
    border-color: #4a5568;
  }

  .label-content {
    color: #E2E8F0;
  }

  .help-text {
    color: #A0AEC0;
  }

  input:checked + .radio-custom {
    background: var(--primary-light);
    border-color: var(--primary-light);
  }

  .radio-label:hover .radio-custom {
    border-color: var(--primary-light);
  }

  input:focus + .radio-custom {
    box-shadow: 0 0 0 3px rgba(184, 216, 208, 0.2);
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .radio-custom,
  .radio-dot {
    transition: none;
  }
}
</style>

<!-- Componente de grupo de radio buttons -->
<template>
  <div 
    :class="[
      'base-radio-group',
      {
        'has-error': !!error,
        'has-success': success,
        'is-disabled': disabled,
        'is-inline': inline
      }
    ]"
  >
    <!-- Etiqueta del grupo -->
    <label v-if="label" class="group-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>

    <!-- Lista de opciones -->
    <div :class="['options-list', { 'inline': inline }]">
      <BaseRadio
        v-for="option in normalizedOptions"
        :key="getOptionValue(option)"
        :id="`${id}-${getOptionValue(option)}`"
        :name="name"
        :label="getOptionLabel(option)"
        :value="getOptionValue(option)"
        :model-value="modelValue"
        :disabled="disabled || option.disabled"
        :required="required"
        @update:model-value="handleChange"
        @blur="handleBlur"
        @focus="handleFocus"
      />
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
import BaseRadio from './BaseRadio.vue';

const props = defineProps({
  // Modelo
  modelValue: {
    type: [String, Number, Boolean, Object],
    required: true
  },
  // ID base para los radios
  id: {
    type: String,
    required: true
  },
  // Etiqueta del grupo
  label: {
    type: String,
    default: ''
  },
  // Nombre del grupo
  name: {
    type: String,
    required: true
  },
  // Opciones
  options: {
    type: Array,
    required: true,
    validator: (options) => {
      return options.every(option => {
        if (typeof option === 'object') {
          return option.hasOwnProperty('value') || option.hasOwnProperty('label');
        }
        return typeof option === 'string' || typeof option === 'number';
      });
    }
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
  // Si se muestra en línea
  inline: {
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
const normalizedOptions = computed(() => {
  return props.options.map(option => {
    if (typeof option === 'object') {
      return option;
    }
    return {
      label: option.toString(),
      value: option
    };
  });
});

// Métodos
const getOptionValue = (option) => {
  return option.value !== undefined ? option.value : option.label;
};

const getOptionLabel = (option) => {
  return option.label || option.value;
};

const handleChange = (value) => {
  emit('update:modelValue', value);
  emit('change', value);
};

const handleBlur = (event) => {
  emit('blur', event);
};

const handleFocus = (event) => {
  emit('focus', event);
};
</script>

<style scoped>
.base-radio-group {
  margin-bottom: 1rem;
}

.group-label {
  display: block;
  margin-bottom: 0.75rem;
  color: var(--text-color);
  font-weight: 500;
  font-size: 0.9rem;
}

.required-mark {
  color: var(--error-color);
  margin-left: 0.25rem;
}

/* Lista de opciones */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.options-list.inline {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1.5rem;
}

/* Estados */
.is-disabled .group-label {
  opacity: 0.7;
}

/* Mensajes */
.error-message,
.help-text {
  font-size: 0.85rem;
  margin-top: 0.75rem;
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

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .group-label {
    color: #E2E8F0;
  }

  .help-text {
    color: #A0AEC0;
  }
}

/* Soporte para pantallas pequeñas */
@media (max-width: 480px) {
  .options-list.inline {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>

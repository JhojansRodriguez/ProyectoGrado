<!-- Componente de selección base -->
<template>
  <div 
    :class="[
      'base-select',
      { 
        'has-error': !!error,
        'has-success': success,
        'is-disabled': disabled,
        'is-readonly': readonly,
        'is-multiple': multiple
      }
    ]"
  >
    <!-- Etiqueta -->
    <label v-if="label" :for="id" class="select-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>

    <!-- Contenedor del select -->
    <div class="select-container">
      <!-- Icono izquierdo -->
      <i v-if="iconLeft" :class="['select-icon left', iconLeft]"></i>

      <!-- Select -->
      <select
        :id="id"
        :value="modelValue"
        :multiple="multiple"
        :disabled="disabled"
        :required="required"
        @change="handleChange"
        @blur="handleBlur"
        @focus="handleFocus"
      >
        <!-- Opción placeholder -->
        <option v-if="placeholder && !multiple" value="" disabled selected>
          {{ placeholder }}
        </option>

        <!-- Grupos de opciones -->
        <template v-if="hasOptionGroups">
          <optgroup 
            v-for="group in options" 
            :key="group.label" 
            :label="group.label"
          >
            <option
              v-for="option in group.options"
              :key="getOptionValue(option)"
              :value="getOptionValue(option)"
              :disabled="option.disabled"
            >
              {{ getOptionLabel(option) }}
            </option>
          </optgroup>
        </template>

        <!-- Opciones simples -->
        <template v-else>
          <option
            v-for="option in options"
            :key="getOptionValue(option)"
            :value="getOptionValue(option)"
            :disabled="option.disabled"
          >
            {{ getOptionLabel(option) }}
          </option>
        </template>
      </select>

      <!-- Icono de flecha -->
      <i class="fas fa-chevron-down select-arrow"></i>
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
    type: [String, Number, Array],
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
    default: 'Selecciona una opción'
  },
  // Opciones
  options: {
    type: Array,
    required: true,
    validator: (options) => {
      // Validar que todas las opciones tengan el formato correcto
      return options.every(option => {
        if (typeof option === 'object' && option !== null) {
          // Si es un grupo de opciones
          if ('label' in option && 'options' in option) {
            return option.options.every(opt => 
              typeof opt === 'object' && opt !== null && ('value' in opt || 'label' in opt)
            );
          }
          // Si es una opción simple
          return 'value' in option || 'label' in option;
        }
        // Si es un valor primitivo
        return typeof option === 'string' || typeof option === 'number';
      });
    }
  },
  // Si es múltiple
  multiple: {
    type: Boolean,
    default: false
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
const hasOptionGroups = computed(() => {
  return props.options.some(option => 
    typeof option === 'object' && option !== null && 'label' in option && 'options' in option
  );
});

// Métodos
const handleChange = (event) => {
  const value = props.multiple
    ? Array.from(event.target.selectedOptions).map(option => option.value)
    : event.target.value;
  
  emit('update:modelValue', value);
  emit('change', value);
};

const handleBlur = (event) => {
  emit('blur', event);
};

const handleFocus = (event) => {
  emit('focus', event);
};

const getOptionValue = (option) => {
  if (typeof option === 'object' && option !== null) {
    return 'value' in option ? option.value : option.label;
  }
  return option;
};

const getOptionLabel = (option) => {
  if (typeof option === 'object' && option !== null) {
    return option.label || option.value;
  }
  return option;
};
</script>

<style scoped>
.base-select {
  margin-bottom: 1rem;
}

.select-label {
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

.select-container {
  position: relative;
  display: flex;
  align-items: center;
}

select {
  width: 100%;
  padding: 0.75rem;
  padding-right: 2.5rem;
  border: 2px solid var(--secondary-color);
  border-radius: 8px;
  font-size: 1rem;
  color: var(--text-color);
  background: white;
  transition: all 0.3s ease;
  appearance: none;
  cursor: pointer;
}

/* Select múltiple */
select[multiple] {
  padding-right: 0.75rem;
  min-height: 120px;
}

/* Iconos */
.select-icon.left {
  position: absolute;
  left: 1rem;
  color: #666;
}

.select-icon.left + select {
  padding-left: 2.5rem;
}

.select-arrow {
  position: absolute;
  right: 1rem;
  color: #666;
  pointer-events: none;
}

select[multiple] + .select-arrow {
  display: none;
}

/* Estados */
select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.has-error select {
  border-color: var(--error-color);
}

.has-success select {
  border-color: var(--success-color);
}

.is-disabled select {
  background-color: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.7;
}

.is-readonly select {
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

/* Estilos para las opciones */
option {
  padding: 0.5rem;
}

option:disabled {
  color: #999;
}

optgroup {
  font-weight: 600;
  color: #2D4739;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  select {
    background: #2d3748;
    color: white;
    border-color: #4a5568;
  }

  select:focus {
    border-color: var(--primary-light);
  }

  .select-label {
    color: #E2E8F0;
  }

  .help-text {
    color: #A0AEC0;
  }

  .is-disabled select,
  .is-readonly select {
    background-color: #1a202c;
  }

  optgroup {
    color: #E2E8F0;
  }

  option {
    background-color: #2d3748;
  }

  option:checked {
    background-color: var(--primary-color);
    color: white;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  select {
    transition: none;
  }
}
</style>

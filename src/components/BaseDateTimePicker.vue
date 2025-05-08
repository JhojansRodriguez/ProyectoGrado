<!-- Componente de selector de fecha y hora -->
<template>
  <div 
    :class="[
      'datetime-picker',
      {
        'has-error': !!error,
        'has-success': success,
        'is-disabled': disabled,
        'is-readonly': readonly,
        'is-inline': inline
      }
    ]"
  >
    <div class="datetime-inputs">
      <!-- Selector de fecha -->
      <BaseDatePicker
        :id="`${id}-date`"
        v-model="dateValue"
        :placeholder="datePlaceholder"
        :min-date="minDate"
        :max-date="maxDate"
        :disabled="disabled"
        :readonly="readonly"
        :error="error"
        :success="success"
        :show-footer="false"
        @change="handleDateChange"
      />

      <!-- Selector de hora -->
      <BaseTimePicker
        :id="`${id}-time`"
        v-model="timeValue"
        :placeholder="timePlaceholder"
        :use12Hours="use12Hours"
        :minute-step="minuteStep"
        :disabled="disabled || !dateValue"
        :readonly="readonly"
        :error="error"
        :success="success"
        :show-footer="false"
        @change="handleTimeChange"
      />
    </div>

    <!-- Mensaje de error -->
    <p v-if="error" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </p>

    <!-- Acciones -->
    <div v-if="showFooter" class="datetime-actions">
      <button
        type="button"
        class="now-button"
        :disabled="disabled || readonly"
        @click="selectNow"
      >
        Ahora
      </button>
      <button
        type="button"
        class="clear-button"
        :disabled="disabled || readonly"
        @click="clearDateTime"
      >
        Limpiar
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import BaseDatePicker from './BaseDatePicker.vue';
import BaseTimePicker from './BaseTimePicker.vue';

const props = defineProps({
  // ID único
  id: {
    type: String,
    required: true
  },
  // Modelo (puede ser Date o string ISO)
  modelValue: {
    type: [Date, String],
    default: null
  },
  // Placeholder para fecha
  datePlaceholder: {
    type: String,
    default: 'Selecciona fecha'
  },
  // Placeholder para hora
  timePlaceholder: {
    type: String,
    default: 'Selecciona hora'
  },
  // Fecha mínima
  minDate: {
    type: [Date, String],
    default: null
  },
  // Fecha máxima
  maxDate: {
    type: [Date, String],
    default: null
  },
  // Si usa formato 12 horas
  use12Hours: {
    type: Boolean,
    default: false
  },
  // Intervalo de minutos
  minuteStep: {
    type: Number,
    default: 1
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
  // Si es inline
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
  // Si muestra el footer
  showFooter: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

// Estado
const dateValue = ref(null);
const timeValue = ref(null);

// Métodos
const parseDateTime = (value) => {
  if (!value) return { date: null, time: null };

  const date = new Date(value);
  if (isNaN(date)) return { date: null, time: null };

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return {
    date: date.toISOString().split('T')[0],
    time: `${hours}:${minutes}`
  };
};

const formatDateTime = () => {
  if (!dateValue.value || !timeValue.value) return null;

  const [hours, minutes] = timeValue.value.split(':').map(Number);
  const date = new Date(dateValue.value);
  date.setHours(hours, minutes, 0, 0);

  return date;
};

const handleDateChange = () => {
  updateValue();
};

const handleTimeChange = () => {
  updateValue();
};

const updateValue = () => {
  const datetime = formatDateTime();
  emit('update:modelValue', datetime);
  emit('change', datetime);
};

const selectNow = () => {
  const now = new Date();
  dateValue.value = now.toISOString().split('T')[0];
  
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  timeValue.value = `${hours}:${minutes}`;

  updateValue();
};

const clearDateTime = () => {
  dateValue.value = null;
  timeValue.value = null;
  emit('update:modelValue', null);
  emit('change', null);
};

// Inicialización
const initializeValue = () => {
  const { date, time } = parseDateTime(props.modelValue);
  dateValue.value = date;
  timeValue.value = time;
};

// Observadores
watch(() => props.modelValue, initializeValue, { immediate: true });
</script>

<style scoped>
.datetime-picker {
  width: 100%;
}

/* Contenedor de inputs */
.datetime-inputs {
  display: flex;
  gap: 1rem;
}

.datetime-inputs > * {
  flex: 1;
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

/* Acciones */
.datetime-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.now-button,
.clear-button {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 0.875rem;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.now-button:hover:not(:disabled),
.clear-button:hover:not(:disabled) {
  opacity: 0.8;
}

.now-button:disabled,
.clear-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Variante inline */
.datetime-picker.is-inline .datetime-inputs {
  flex-direction: row;
}

/* Estados */
.datetime-picker.is-disabled {
  opacity: 0.7;
  pointer-events: none;
}

.datetime-picker.is-readonly {
  opacity: 0.7;
  pointer-events: none;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .now-button,
  .clear-button {
    color: var(--primary-light);
  }
}

/* Soporte para pantallas pequeñas */
@media (max-width: 640px) {
  .datetime-inputs {
    flex-direction: column;
  }

  .datetime-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .now-button,
  .clear-button {
    padding: 0.5rem;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .now-button,
  .clear-button {
    transition: none;
  }
}

/* Soporte para navegación con teclado */
.now-button:focus,
.clear-button:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

@media (prefers-color-scheme: dark) {
  .now-button:focus,
  .clear-button:focus {
    outline-color: var(--primary-light);
  }
}
</style>

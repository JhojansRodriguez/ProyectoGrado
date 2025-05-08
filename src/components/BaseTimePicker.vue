<!-- Componente de selector de hora -->
<template>
  <div 
    :class="[
      'time-picker',
      {
        'has-error': !!error,
        'has-success': success,
        'is-disabled': disabled,
        'is-readonly': readonly,
        'is-open': isOpen
      }
    ]"
  >
    <!-- Campo de entrada -->
    <div class="input-wrapper">
      <BaseInput
        :id="id"
        v-model="inputValue"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="true"
        :error="error"
        :success="success"
        :icon-right="'fas fa-clock'"
        @click="togglePicker"
      />
    </div>

    <!-- Selector de hora -->
    <Transition name="picker">
      <div 
        v-if="isOpen"
        ref="picker"
        class="picker"
        @click.stop
      >
        <!-- Horas -->
        <div class="time-column">
          <button
            type="button"
            class="scroll-button"
            @click="scrollHours('up')"
          >
            <i class="fas fa-chevron-up"></i>
          </button>
          
          <div 
            ref="hoursContainer"
            class="time-values"
            @wheel="handleHoursWheel"
          >
            <button
              v-for="hour in hours"
              :key="hour"
              type="button"
              :class="[
                'time-value',
                { 'selected': selectedHour === hour }
              ]"
              @click="selectHour(hour)"
            >
              {{ formatNumber(hour) }}
            </button>
          </div>

          <button
            type="button"
            class="scroll-button"
            @click="scrollHours('down')"
          >
            <i class="fas fa-chevron-down"></i>
          </button>
        </div>

        <!-- Separador -->
        <div class="separator">:</div>

        <!-- Minutos -->
        <div class="time-column">
          <button
            type="button"
            class="scroll-button"
            @click="scrollMinutes('up')"
          >
            <i class="fas fa-chevron-up"></i>
          </button>
          
          <div 
            ref="minutesContainer"
            class="time-values"
            @wheel="handleMinutesWheel"
          >
            <button
              v-for="minute in minutes"
              :key="minute"
              type="button"
              :class="[
                'time-value',
                { 'selected': selectedMinute === minute }
              ]"
              @click="selectMinute(minute)"
            >
              {{ formatNumber(minute) }}
            </button>
          </div>

          <button
            type="button"
            class="scroll-button"
            @click="scrollMinutes('down')"
          >
            <i class="fas fa-chevron-down"></i>
          </button>
        </div>

        <!-- Formato AM/PM -->
        <div v-if="use12Hours" class="time-column">
          <button
            type="button"
            :class="[
              'period-button',
              { 'selected': period === 'AM' }
            ]"
            @click="togglePeriod"
          >
            AM
          </button>
          <button
            type="button"
            :class="[
              'period-button',
              { 'selected': period === 'PM' }
            ]"
            @click="togglePeriod"
          >
            PM
          </button>
        </div>

        <!-- Footer -->
        <div v-if="showFooter" class="picker-footer">
          <button
            type="button"
            class="now-button"
            @click="selectNow"
          >
            Ahora
          </button>
          <button
            type="button"
            class="clear-button"
            @click="clearTime"
          >
            Limpiar
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import BaseInput from './BaseInput.vue';

const props = defineProps({
  // ID único
  id: {
    type: String,
    required: true
  },
  // Modelo
  modelValue: {
    type: String,
    default: null
  },
  // Placeholder
  placeholder: {
    type: String,
    default: 'Selecciona una hora'
  },
  // Si usa formato 12 horas
  use12Hours: {
    type: Boolean,
    default: false
  },
  // Intervalo de minutos
  minuteStep: {
    type: Number,
    default: 1,
    validator: (value) => value > 0 && value <= 60
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
  },
  // Si muestra el footer
  showFooter: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

// Estado
const isOpen = ref(false);
const selectedHour = ref(null);
const selectedMinute = ref(null);
const period = ref('AM');

// Referencias
const picker = ref(null);
const hoursContainer = ref(null);
const minutesContainer = ref(null);

// Computed
const hours = computed(() => {
  const range = props.use12Hours ? 12 : 24;
  return Array.from({ length: range }, (_, i) => props.use12Hours ? (i + 1) : i);
});

const minutes = computed(() => {
  return Array.from({ length: 60 / props.minuteStep }, (_, i) => i * props.minuteStep);
});

const inputValue = computed({
  get() {
    if (!selectedHour.value || !selectedMinute.value) return '';
    
    let hour = selectedHour.value;
    if (props.use12Hours && period.value === 'PM' && hour !== 12) {
      hour += 12;
    } else if (props.use12Hours && period.value === 'AM' && hour === 12) {
      hour = 0;
    }
    
    return `${formatNumber(hour)}:${formatNumber(selectedMinute.value)}`;
  },
  set() {
    // La entrada es de solo lectura
  }
});

// Métodos
const togglePicker = () => {
  if (props.disabled || props.readonly) return;
  isOpen.value = !isOpen.value;
};

const closePicker = () => {
  isOpen.value = false;
};

const formatNumber = (num) => {
  return num.toString().padStart(2, '0');
};

const selectHour = (hour) => {
  selectedHour.value = hour;
  updateValue();
};

const selectMinute = (minute) => {
  selectedMinute.value = minute;
  updateValue();
};

const togglePeriod = () => {
  period.value = period.value === 'AM' ? 'PM' : 'AM';
  updateValue();
};

const updateValue = () => {
  if (selectedHour.value !== null && selectedMinute.value !== null) {
    const value = inputValue.value;
    emit('update:modelValue', value);
    emit('change', value);
  }
};

const selectNow = () => {
  const now = new Date();
  let hour = now.getHours();
  const minute = Math.floor(now.getMinutes() / props.minuteStep) * props.minuteStep;

  if (props.use12Hours) {
    period.value = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
  }

  selectedHour.value = hour;
  selectedMinute.value = minute;
  updateValue();
  closePicker();
};

const clearTime = () => {
  selectedHour.value = null;
  selectedMinute.value = null;
  period.value = 'AM';
  emit('update:modelValue', null);
  emit('change', null);
  closePicker();
};

const scrollHours = (direction) => {
  if (!hoursContainer.value) return;
  const scrollAmount = direction === 'up' ? -40 : 40;
  hoursContainer.value.scrollTop += scrollAmount;
};

const scrollMinutes = (direction) => {
  if (!minutesContainer.value) return;
  const scrollAmount = direction === 'up' ? -40 : 40;
  minutesContainer.value.scrollTop += scrollAmount;
};

const handleHoursWheel = (event) => {
  event.preventDefault();
  scrollHours(event.deltaY > 0 ? 'down' : 'up');
};

const handleMinutesWheel = (event) => {
  event.preventDefault();
  scrollMinutes(event.deltaY > 0 ? 'down' : 'up');
};

const handleClickOutside = (event) => {
  if (picker.value && !picker.value.contains(event.target)) {
    closePicker();
  }
};

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', handleClickOutside);

  // Inicializar valores si hay un valor inicial
  if (props.modelValue) {
    const [hours, minutes] = props.modelValue.split(':').map(Number);
    if (props.use12Hours) {
      period.value = hours >= 12 ? 'PM' : 'AM';
      selectedHour.value = hours % 12 || 12;
    } else {
      selectedHour.value = hours;
    }
    selectedMinute.value = minutes;
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Observadores
watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    selectedHour.value = null;
    selectedMinute.value = null;
    period.value = 'AM';
    return;
  }

  const [hours, minutes] = newValue.split(':').map(Number);
  if (props.use12Hours) {
    period.value = hours >= 12 ? 'PM' : 'AM';
    selectedHour.value = hours % 12 || 12;
  } else {
    selectedHour.value = hours;
  }
  selectedMinute.value = minutes;
});
</script>

<style scoped>
.time-picker {
  position: relative;
  width: 100%;
}

/* Selector */
.picker {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 100;
  width: 220px;
  margin-top: 0.5rem;
  padding: 1rem;
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  gap: 0.5rem;
}

/* Columnas de tiempo */
.time-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

/* Valores de tiempo */
.time-values {
  height: 120px;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.time-values::-webkit-scrollbar {
  display: none;
}

.time-value {
  width: 100%;
  padding: 0.5rem;
  border: none;
  background: none;
  color: var(--text-color);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.time-value:hover {
  background: var(--secondary-color);
}

.time-value.selected {
  background: var(--primary-color);
  color: white;
}

/* Botones de scroll */
.scroll-button {
  background: none;
  border: none;
  color: var(--text-light);
  padding: 0.25rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.scroll-button:hover {
  color: var(--primary-color);
}

/* Separador */
.separator {
  display: flex;
  align-items: center;
  color: var(--text-color);
  font-weight: bold;
  padding: 0 0.25rem;
}

/* Botones AM/PM */
.period-button {
  width: 100%;
  padding: 0.5rem;
  border: none;
  background: none;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.period-button:hover {
  background: var(--secondary-color);
}

.period-button.selected {
  background: var(--primary-color);
  color: white;
}

/* Footer */
.picker-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.75rem;
  border-top: 1px solid var(--secondary-color);
  display: flex;
  justify-content: space-between;
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

.now-button:hover,
.clear-button:hover {
  opacity: 0.8;
}

/* Animaciones */
.picker-enter-active,
.picker-leave-active {
  transition: all 0.3s ease;
}

.picker-enter-from,
.picker-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .picker {
    background: #2d3748;
  }

  .time-value {
    color: #E2E8F0;
  }

  .time-value:hover {
    background: #4a5568;
  }

  .separator {
    color: #E2E8F0;
  }

  .period-button {
    color: #E2E8F0;
  }

  .period-button:hover {
    background: #4a5568;
  }

  .picker-footer {
    border-color: #4a5568;
  }

  .now-button,
  .clear-button {
    color: var(--primary-light);
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .time-value,
  .scroll-button,
  .period-button,
  .now-button,
  .clear-button,
  .picker-enter-active,
  .picker-leave-active {
    transition: none;
  }
}

/* Soporte para navegación con teclado */
.time-value:focus,
.scroll-button:focus,
.period-button:focus,
.now-button:focus,
.clear-button:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

@media (prefers-color-scheme: dark) {
  .time-value:focus,
  .scroll-button:focus,
  .period-button:focus,
  .now-button:focus,
  .clear-button:focus {
    outline-color: var(--primary-light);
  }
}
</style>

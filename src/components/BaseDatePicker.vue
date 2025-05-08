<!-- Componente de selector de fecha -->
<template>
  <div 
    :class="[
      'date-picker',
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
        :icon-right="'fas fa-calendar'"
        @click="toggleCalendar"
      />
    </div>

    <!-- Calendario -->
    <Transition name="calendar">
      <div 
        v-if="isOpen"
        ref="calendar"
        class="calendar"
        @click.stop
      >
        <!-- Header -->
        <div class="calendar-header">
          <button
            type="button"
            class="nav-button"
            @click="previousMonth"
          >
            <i class="fas fa-chevron-left"></i>
          </button>

          <div class="current-month">
            {{ currentMonthLabel }}
          </div>

          <button
            type="button"
            class="nav-button"
            @click="nextMonth"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <!-- Días de la semana -->
        <div class="weekdays">
          <span v-for="day in weekDays" :key="day">{{ day }}</span>
        </div>

        <!-- Días del mes -->
        <div class="days">
          <button
            v-for="day in calendarDays"
            :key="day.date"
            type="button"
            :class="[
              'day',
              {
                'other-month': !day.currentMonth,
                'today': day.isToday,
                'selected': isSelected(day.date),
                'disabled': isDisabled(day.date)
              }
            ]"
            :disabled="isDisabled(day.date)"
            @click="selectDate(day.date)"
          >
            {{ day.dayOfMonth }}
          </button>
        </div>

        <!-- Footer -->
        <div v-if="showFooter" class="calendar-footer">
          <button
            type="button"
            class="today-button"
            @click="selectToday"
          >
            Hoy
          </button>
          <button
            type="button"
            class="clear-button"
            @click="clearDate"
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
    type: [Date, String],
    default: null
  },
  // Placeholder
  placeholder: {
    type: String,
    default: 'Selecciona una fecha'
  },
  // Formato de fecha
  format: {
    type: String,
    default: 'dd/MM/yyyy'
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
const currentDate = ref(new Date());
const selectedDate = ref(props.modelValue ? new Date(props.modelValue) : null);

// Referencias
const calendar = ref(null);

// Constantes
const weekDays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Computed
const currentMonthLabel = computed(() => {
  return `${months[currentDate.value.getMonth()]} ${currentDate.value.getFullYear()}`;
});

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  
  // Primer día del mes actual
  const firstDay = new Date(year, month, 1);
  const startingDay = firstDay.getDay();
  
  // Último día del mes actual
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();
  
  // Días del mes anterior
  const previousMonth = new Date(year, month, 0);
  const previousMonthDays = previousMonth.getDate();
  
  const days = [];
  
  // Días del mes anterior
  for (let i = startingDay - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, previousMonthDays - i);
    days.push({
      date,
      dayOfMonth: date.getDate(),
      currentMonth: false,
      isToday: isToday(date)
    });
  }
  
  // Días del mes actual
  for (let i = 1; i <= totalDays; i++) {
    const date = new Date(year, month, i);
    days.push({
      date,
      dayOfMonth: i,
      currentMonth: true,
      isToday: isToday(date)
    });
  }
  
  // Días del mes siguiente
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      date,
      dayOfMonth: i,
      currentMonth: false,
      isToday: isToday(date)
    });
  }
  
  return days;
});

const inputValue = computed({
  get() {
    return selectedDate.value ? formatDate(selectedDate.value) : '';
  },
  set() {
    // La entrada es de solo lectura
  }
});

// Métodos
const toggleCalendar = () => {
  if (props.disabled || props.readonly) return;
  isOpen.value = !isOpen.value;
};

const closeCalendar = () => {
  isOpen.value = false;
};

const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  );
};

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  );
};

const selectDate = (date) => {
  selectedDate.value = date;
  emit('update:modelValue', date);
  emit('change', date);
  closeCalendar();
};

const selectToday = () => {
  const today = new Date();
  if (!isDisabled(today)) {
    selectDate(today);
  }
};

const clearDate = () => {
  selectedDate.value = null;
  emit('update:modelValue', null);
  emit('change', null);
  closeCalendar();
};

const isSelected = (date) => {
  if (!selectedDate.value) return false;
  return date.toDateString() === selectedDate.value.toDateString();
};

const isToday = (date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const isDisabled = (date) => {
  if (props.minDate && date < new Date(props.minDate)) return true;
  if (props.maxDate && date > new Date(props.maxDate)) return true;
  return false;
};

const formatDate = (date) => {
  if (!date) return '';
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return props.format
    .replace('dd', day)
    .replace('MM', month)
    .replace('yyyy', year);
};

const handleClickOutside = (event) => {
  if (calendar.value && !calendar.value.contains(event.target)) {
    closeCalendar();
  }
};

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Observadores
watch(() => props.modelValue, (newValue) => {
  selectedDate.value = newValue ? new Date(newValue) : null;
  if (selectedDate.value) {
    currentDate.value = new Date(selectedDate.value);
  }
});
</script>

<style scoped>
.date-picker {
  position: relative;
  width: 100%;
}

/* Calendario */
.calendar {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 100;
  width: 280px;
  margin-top: 0.5rem;
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

/* Header */
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--primary-color);
  color: white;
}

.nav-button {
  background: none;
  border: none;
  color: white;
  padding: 0.5rem;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.nav-button:hover {
  opacity: 0.8;
}

.current-month {
  font-weight: 500;
}

/* Días de la semana */
.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 0.5rem;
  background: var(--secondary-color);
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-light);
}

/* Días */
.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 0.5rem;
}

.day {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin: 1px;
  border: none;
  background: none;
  border-radius: 50%;
  font-size: 0.875rem;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.day:hover:not(:disabled) {
  background: var(--secondary-color);
}

.day.other-month {
  color: var(--text-light);
}

.day.today {
  font-weight: 600;
}

.day.selected {
  background: var(--primary-color);
  color: white;
}

.day:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Footer */
.calendar-footer {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  border-top: 1px solid var(--secondary-color);
}

.today-button,
.clear-button {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 0.875rem;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.today-button:hover,
.clear-button:hover {
  opacity: 0.8;
}

/* Animaciones */
.calendar-enter-active,
.calendar-leave-active {
  transition: all 0.3s ease;
}

.calendar-enter-from,
.calendar-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .calendar {
    background: #2d3748;
  }

  .weekdays {
    background: #4a5568;
    color: #A0AEC0;
  }

  .day {
    color: #E2E8F0;
  }

  .day.other-month {
    color: #A0AEC0;
  }

  .day:hover:not(:disabled) {
    background: #4a5568;
  }

  .calendar-footer {
    border-color: #4a5568;
  }

  .today-button,
  .clear-button {
    color: var(--primary-light);
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .nav-button,
  .day,
  .today-button,
  .clear-button,
  .calendar-enter-active,
  .calendar-leave-active {
    transition: none;
  }
}

/* Soporte para navegación con teclado */
.day:focus,
.nav-button:focus,
.today-button:focus,
.clear-button:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

@media (prefers-color-scheme: dark) {
  .day:focus,
  .nav-button:focus,
  .today-button:focus,
  .clear-button:focus {
    outline-color: var(--primary-light);
  }
}
</style>

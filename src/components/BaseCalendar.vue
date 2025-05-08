<!-- Componente de calendario -->
<template>
  <div 
    :class="[
      'calendar',
      view,
      {
        'has-error': !!error,
        'has-success': success,
        'is-disabled': disabled,
        'is-readonly': readonly
      }
    ]"
  >
    <!-- Barra de herramientas -->
    <div class="calendar-toolbar">
      <!-- Navegación -->
      <div class="toolbar-group">
        <button
          type="button"
          class="toolbar-button"
          title="Mes anterior"
          :disabled="disabled"
          @click="previousMonth"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <button
          type="button"
          class="toolbar-button today"
          title="Hoy"
          :disabled="disabled"
          @click="goToToday"
        >
          Hoy
        </button>
        
        <button
          type="button"
          class="toolbar-button"
          title="Mes siguiente"
          :disabled="disabled"
          @click="nextMonth"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>

      <!-- Título -->
      <h2 class="calendar-title">
        {{ currentMonthLabel }}
      </h2>

      <!-- Vistas -->
      <div class="toolbar-group">
        <button
          v-for="viewOption in viewOptions"
          :key="viewOption.value"
          type="button"
          :class="[
            'toolbar-button',
            { active: view === viewOption.value }
          ]"
          :title="viewOption.label"
          :disabled="disabled"
          @click="view = viewOption.value"
        >
          <i :class="viewOption.icon"></i>
        </button>
      </div>
    </div>

    <!-- Vista de mes -->
    <div v-if="view === 'month'" class="calendar-grid">
      <!-- Días de la semana -->
      <div class="weekdays">
        <div 
          v-for="day in weekDays"
          :key="day"
          class="weekday"
        >
          {{ day }}
        </div>
      </div>

      <!-- Días del mes -->
      <div class="days">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          :class="[
            'day',
            {
              'other-month': !day.currentMonth,
              'today': isToday(day.date),
              'selected': isSelected(day.date),
              'has-events': hasEvents(day.date)
            }
          ]"
          @click="selectDate(day.date)"
        >
          <!-- Número del día -->
          <span class="day-number">{{ day.dayOfMonth }}</span>

          <!-- Eventos -->
          <div class="day-events">
            <template v-for="event in getEventsForDay(day.date)" :key="event.id">
              <!-- Evento completo -->
              <div
                v-if="shouldShowFullEvent(event, day.date)"
                :class="[
                  'event',
                  'full-event',
                  `event-${event.type || 'default'}`
                ]"
                :style="getEventStyle(event)"
                @click.stop="handleEventClick(event)"
              >
                {{ event.title }}
              </div>

              <!-- Indicador de evento -->
              <div
                v-else
                :class="[
                  'event-dot',
                  `event-${event.type || 'default'}`
                ]"
              ></div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista de semana -->
    <div v-else-if="view === 'week'" class="calendar-week">
      <!-- Implementar vista de semana -->
    </div>

    <!-- Vista de día -->
    <div v-else-if="view === 'day'" class="calendar-day">
      <!-- Implementar vista de día -->
    </div>

    <!-- Vista de agenda -->
    <div v-else class="calendar-agenda">
      <!-- Implementar vista de agenda -->
    </div>

    <!-- Mensaje de error -->
    <p v-if="error" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  // Eventos
  events: {
    type: Array,
    default: () => []
  },
  // Fecha seleccionada
  modelValue: {
    type: Date,
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
  }
});

const emit = defineEmits(['update:modelValue', 'select-date', 'select-event']);

// Estado
const currentDate = ref(new Date());
const view = ref('month');

// Configuración
const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const viewOptions = [
  { value: 'month', label: 'Mes', icon: 'fas fa-calendar-alt' },
  { value: 'week', label: 'Semana', icon: 'fas fa-calendar-week' },
  { value: 'day', label: 'Día', icon: 'fas fa-calendar-day' },
  { value: 'agenda', label: 'Agenda', icon: 'fas fa-list' }
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
      currentMonth: false
    });
  }
  
  // Días del mes actual
  for (let i = 1; i <= totalDays; i++) {
    const date = new Date(year, month, i);
    days.push({
      date,
      dayOfMonth: i,
      currentMonth: true
    });
  }
  
  // Días del mes siguiente
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      date,
      dayOfMonth: i,
      currentMonth: false
    });
  }
  
  return days;
});

// Métodos
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

const goToToday = () => {
  currentDate.value = new Date();
};

const isToday = (date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const isSelected = (date) => {
  if (!props.modelValue) return false;
  return date.toDateString() === props.modelValue.toDateString();
};

const selectDate = (date) => {
  if (props.disabled || props.readonly) return;
  emit('update:modelValue', date);
  emit('select-date', date);
};

const hasEvents = (date) => {
  return getEventsForDay(date).length > 0;
};

const getEventsForDay = (date) => {
  return props.events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.toDateString() === date.toDateString();
  });
};

const shouldShowFullEvent = (event, date) => {
  // Lógica para determinar si mostrar el evento completo o solo un punto
  // Por ejemplo, basado en la posición del evento en el día
  return true;
};

const getEventStyle = (event) => {
  return {
    backgroundColor: event.color,
    borderColor: event.color
  };
};

const handleEventClick = (event) => {
  emit('select-event', event);
};
</script>

<style scoped>
.calendar {
  width: 100%;
  border: 2px solid var(--secondary-color);
  border-radius: var(--border-radius-lg);
}

/* Barra de herramientas */
.calendar-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--secondary-color);
  border-top-left-radius: var(--border-radius-lg);
  border-top-right-radius: var(--border-radius-lg);
}

.toolbar-group {
  display: flex;
  gap: 0.5rem;
}

.toolbar-button {
  padding: 0.5rem;
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

.calendar-title {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-color);
}

/* Vista de mes */
.calendar-grid {
  padding: 1rem;
}

/* Días de la semana */
.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.weekday {
  padding: 0.5rem;
  text-align: center;
  font-weight: 500;
  color: var(--text-light);
}

/* Días */
.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.day {
  position: relative;
  min-height: 100px;
  padding: 0.5rem;
  background: white;
  border: 1px solid var(--secondary-color);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all 0.3s ease;
}

.day:hover:not(.other-month) {
  background: var(--secondary-color);
}

.day.other-month {
  opacity: 0.5;
}

.day.today {
  background: var(--primary-color);
  color: white;
}

.day.selected {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color);
}

.day-number {
  font-weight: 500;
}

/* Eventos */
.day-events {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.event {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: var(--border-radius-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* Tipos de eventos */
.event-default {
  background: var(--primary-color);
  color: white;
}

.event-success {
  background: var(--success-color);
  color: white;
}

.event-warning {
  background: var(--warning-color);
  color: var(--text-color);
}

.event-danger {
  background: var(--error-color);
  color: white;
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
  .calendar {
    background: #2d3748;
  }

  .calendar-toolbar {
    background: #4a5568;
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

  .calendar-title {
    color: #E2E8F0;
  }

  .weekday {
    color: #A0AEC0;
  }

  .day {
    background: #2d3748;
    border-color: #4a5568;
  }

  .day:hover:not(.other-month) {
    background: #4a5568;
  }

  .day.today {
    background: var(--primary-light);
  }

  .day.selected {
    border-color: var(--primary-light);
    box-shadow: 0 0 0 2px var(--primary-light);
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .toolbar-button,
  .day {
    transition: none;
  }
}

/* Soporte para navegación con teclado */
.toolbar-button:focus,
.day:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

@media (prefers-color-scheme: dark) {
  .toolbar-button:focus,
  .day:focus {
    outline-color: var(--primary-light);
  }
}

/* Soporte para pantallas pequeñas */
@media (max-width: 640px) {
  .calendar-toolbar {
    flex-direction: column;
    gap: 1rem;
  }

  .day {
    min-height: 80px;
  }

  .event {
    font-size: 0.7rem;
  }
}
</style>

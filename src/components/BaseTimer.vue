<!-- Componente de cronómetro -->
<template>
  <div 
    :class="[
      'timer',
      {
        'has-error': !!error,
        'has-success': success,
        'is-disabled': disabled,
        'is-readonly': readonly,
        'is-running': isRunning,
        'is-paused': isPaused,
        'is-finished': isFinished
      }
    ]"
  >
    <!-- Display -->
    <div class="timer-display">
      <!-- Tiempo -->
      <div class="time-display">
        <span class="time-unit hours">{{ formatNumber(hours) }}</span>
        <span class="time-separator">:</span>
        <span class="time-unit minutes">{{ formatNumber(minutes) }}</span>
        <span class="time-separator">:</span>
        <span class="time-unit seconds">{{ formatNumber(seconds) }}</span>
        <span v-if="showMilliseconds" class="time-separator">.</span>
        <span v-if="showMilliseconds" class="time-unit milliseconds">{{ formatNumber(milliseconds, 3) }}</span>
      </div>

      <!-- Progreso -->
      <div v-if="duration" class="progress-bar">
        <div 
          class="progress"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </div>

    <!-- Controles -->
    <div v-if="!readonly" class="timer-controls">
      <!-- Iniciar/Pausar -->
      <BaseButton
        :variant="isRunning ? 'warning' : 'primary'"
        :disabled="disabled || isFinished"
        @click="toggleTimer"
      >
        <i :class="isRunning ? 'fas fa-pause' : 'fas fa-play'"></i>
        {{ isRunning ? 'Pausar' : isPaused ? 'Continuar' : 'Iniciar' }}
      </BaseButton>

      <!-- Detener -->
      <BaseButton
        variant="danger"
        :disabled="disabled || (!isRunning && !isPaused)"
        @click="stopTimer"
      >
        <i class="fas fa-stop"></i>
        Detener
      </BaseButton>

      <!-- Reiniciar -->
      <BaseButton
        variant="secondary"
        :disabled="disabled || (!isFinished && !isPaused)"
        @click="resetTimer"
      >
        <i class="fas fa-redo"></i>
        Reiniciar
      </BaseButton>
    </div>

    <!-- Mensaje de error -->
    <p v-if="error" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue';
import BaseButton from './BaseButton.vue';

const props = defineProps({
  // Duración en milisegundos (0 para cronómetro sin límite)
  duration: {
    type: Number,
    default: 0
  },
  // Si muestra milisegundos
  showMilliseconds: {
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

const emit = defineEmits([
  'start',
  'pause',
  'stop',
  'reset',
  'update:time',
  'finish'
]);

// Estado
const isRunning = ref(false);
const isPaused = ref(false);
const isFinished = ref(false);
const startTime = ref(0);
const elapsedTime = ref(0);
const intervalId = ref(null);

// Computed
const totalMilliseconds = computed(() => {
  return props.duration ? Math.min(elapsedTime.value, props.duration) : elapsedTime.value;
});

const hours = computed(() => {
  return Math.floor(totalMilliseconds.value / (1000 * 60 * 60));
});

const minutes = computed(() => {
  return Math.floor((totalMilliseconds.value % (1000 * 60 * 60)) / (1000 * 60));
});

const seconds = computed(() => {
  return Math.floor((totalMilliseconds.value % (1000 * 60)) / 1000);
});

const milliseconds = computed(() => {
  return totalMilliseconds.value % 1000;
});

const progress = computed(() => {
  if (!props.duration) return 0;
  return (totalMilliseconds.value / props.duration) * 100;
});

// Métodos
const formatNumber = (number, digits = 2) => {
  return number.toString().padStart(digits, '0');
};

const startTimer = () => {
  if (!startTime.value) {
    startTime.value = Date.now() - elapsedTime.value;
  } else {
    startTime.value = Date.now() - elapsedTime.value;
  }

  intervalId.value = setInterval(updateTimer, props.showMilliseconds ? 10 : 1000);
  isRunning.value = true;
  isPaused.value = false;
  emit('start');
};

const pauseTimer = () => {
  clearInterval(intervalId.value);
  isRunning.value = false;
  isPaused.value = true;
  emit('pause');
};

const stopTimer = () => {
  clearInterval(intervalId.value);
  isRunning.value = false;
  isPaused.value = false;
  isFinished.value = true;
  emit('stop', elapsedTime.value);
};

const resetTimer = () => {
  clearInterval(intervalId.value);
  isRunning.value = false;
  isPaused.value = false;
  isFinished.value = false;
  startTime.value = 0;
  elapsedTime.value = 0;
  emit('reset');
};

const toggleTimer = () => {
  if (isRunning.value) {
    pauseTimer();
  } else {
    startTimer();
  }
};

const updateTimer = () => {
  elapsedTime.value = Date.now() - startTime.value;
  emit('update:time', elapsedTime.value);

  if (props.duration && elapsedTime.value >= props.duration) {
    stopTimer();
    emit('finish');
  }
};

// Lifecycle hooks
onBeforeUnmount(() => {
  clearInterval(intervalId.value);
});
</script>

<style scoped>
.timer {
  width: 100%;
  max-width: 400px;
  padding: 1.5rem;
  border: 2px solid var(--secondary-color);
  border-radius: var(--border-radius-lg);
  transition: all 0.3s ease;
}

/* Display */
.timer-display {
  text-align: center;
  margin-bottom: 1.5rem;
}

.time-display {
  font-family: 'Fira Code', monospace;
  font-size: 2.5rem;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 1rem;
}

.time-unit {
  display: inline-block;
  min-width: 1.5em;
}

.time-separator {
  color: var(--text-light);
}

.milliseconds {
  font-size: 0.8em;
  color: var(--text-light);
}

/* Barra de progreso */
.progress-bar {
  width: 100%;
  height: 4px;
  background: var(--secondary-color);
  border-radius: 2px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

/* Controles */
.timer-controls {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

/* Mensaje de error */
.error-message {
  margin-top: 1rem;
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

.is-running .progress {
  background: var(--primary-color);
}

.is-paused .progress {
  background: var(--warning-color);
}

.is-finished .progress {
  background: var(--success-color);
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .timer {
    background: #2d3748;
  }

  .time-display {
    color: #E2E8F0;
  }

  .time-separator {
    color: #A0AEC0;
  }

  .milliseconds {
    color: #A0AEC0;
  }

  .progress-bar {
    background: #4a5568;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .timer,
  .progress {
    transition: none;
  }
}

/* Soporte para pantallas pequeñas */
@media (max-width: 480px) {
  .time-display {
    font-size: 2rem;
  }

  .timer-controls {
    flex-direction: column;
  }

  .timer-controls button {
    width: 100%;
  }
}

/* Soporte para alto contraste */
@media (forced-colors: active) {
  .progress-bar {
    border: 1px solid CanvasText;
  }

  .progress {
    background: Highlight;
  }
}
</style>

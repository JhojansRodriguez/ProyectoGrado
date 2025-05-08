<!-- Componente de slider -->
<template>
  <div 
    :class="[
      'slider',
      {
        'has-error': !!error,
        'has-success': success,
        'is-disabled': disabled,
        'is-readonly': readonly,
        'with-marks': showMarks,
        'with-tooltip': showTooltip,
        'with-input': showInput
      }
    ]"
  >
    <!-- Etiqueta -->
    <div v-if="label" class="slider-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </div>

    <!-- Contenedor principal -->
    <div class="slider-container">
      <!-- Slider -->
      <div 
        ref="track"
        class="slider-track"
        @click="handleTrackClick"
      >
        <!-- Riel -->
        <div class="track-rail"></div>

        <!-- Barra de progreso -->
        <div 
          class="track-progress"
          :style="progressStyle"
        ></div>

        <!-- Marcas -->
        <div v-if="showMarks" class="track-marks">
          <div
            v-for="mark in marks"
            :key="mark.value"
            :class="[
              'mark',
              { active: isMarkActive(mark.value) }
            ]"
            :style="{ left: `${getMarkPosition(mark.value)}%` }"
          >
            <div class="mark-line"></div>
            <div v-if="mark.label" class="mark-label">
              {{ mark.label }}
            </div>
          </div>
        </div>

        <!-- Control(es) -->
        <template v-if="range">
          <div
            ref="startHandle"
            :class="[
              'slider-handle',
              'start',
              { focused: focusedHandle === 'start' }
            ]"
            :style="{ left: `${startPosition}%` }"
            tabindex="0"
            role="slider"
            :aria-valuemin="min"
            :aria-valuemax="max"
            :aria-valuenow="modelValue[0]"
            @mousedown="startDragging('start', $event)"
            @touchstart="startDragging('start', $event)"
            @focus="focusedHandle = 'start'"
            @blur="focusedHandle = null"
            @keydown="handleKeydown('start', $event)"
          >
            <div 
              v-if="showTooltip"
              :class="[
                'handle-tooltip',
                { visible: isDragging || focusedHandle === 'start' }
              ]"
            >
              {{ formatValue(modelValue[0]) }}
            </div>
          </div>

          <div
            ref="endHandle"
            :class="[
              'slider-handle',
              'end',
              { focused: focusedHandle === 'end' }
            ]"
            :style="{ left: `${endPosition}%` }"
            tabindex="0"
            role="slider"
            :aria-valuemin="min"
            :aria-valuemax="max"
            :aria-valuenow="modelValue[1]"
            @mousedown="startDragging('end', $event)"
            @touchstart="startDragging('end', $event)"
            @focus="focusedHandle = 'end'"
            @blur="focusedHandle = null"
            @keydown="handleKeydown('end', $event)"
          >
            <div 
              v-if="showTooltip"
              :class="[
                'handle-tooltip',
                { visible: isDragging || focusedHandle === 'end' }
              ]"
            >
              {{ formatValue(modelValue[1]) }}
            </div>
          </div>
        </template>
        <template v-else>
          <div
            ref="handle"
            :class="[
              'slider-handle',
              { focused: focusedHandle === 'single' }
            ]"
            :style="{ left: `${position}%` }"
            tabindex="0"
            role="slider"
            :aria-valuemin="min"
            :aria-valuemax="max"
            :aria-valuenow="modelValue"
            @mousedown="startDragging('single', $event)"
            @touchstart="startDragging('single', $event)"
            @focus="focusedHandle = 'single'"
            @blur="focusedHandle = null"
            @keydown="handleKeydown('single', $event)"
          >
            <div 
              v-if="showTooltip"
              :class="[
                'handle-tooltip',
                { visible: isDragging || focusedHandle === 'single' }
              ]"
            >
              {{ formatValue(modelValue) }}
            </div>
          </div>
        </template>
      </div>

      <!-- Campo de entrada -->
      <template v-if="showInput">
        <BaseInput
          v-if="range"
          v-model="startInput"
          type="number"
          :min="min"
          :max="max"
          :step="step"
          :disabled="disabled"
          :readonly="readonly"
          class="range-input start"
          @change="handleInputChange('start')"
        />
        <BaseInput
          v-if="range"
          v-model="endInput"
          type="number"
          :min="min"
          :max="max"
          :step="step"
          :disabled="disabled"
          :readonly="readonly"
          class="range-input end"
          @change="handleInputChange('end')"
        />
        <BaseInput
          v-else
          v-model="input"
          type="number"
          :min="min"
          :max="max"
          :step="step"
          :disabled="disabled"
          :readonly="readonly"
          class="slider-input"
          @change="handleInputChange('single')"
        />
      </template>
    </div>

    <!-- Mensaje de error -->
    <p v-if="error" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import BaseInput from './BaseInput.vue';

const props = defineProps({
  // Modelo
  modelValue: {
    type: [Number, Array],
    required: true
  },
  // Etiqueta
  label: {
    type: String,
    default: ''
  },
  // Si es requerido
  required: {
    type: Boolean,
    default: false
  },
  // Valor mínimo
  min: {
    type: Number,
    default: 0
  },
  // Valor máximo
  max: {
    type: Number,
    default: 100
  },
  // Paso
  step: {
    type: Number,
    default: 1
  },
  // Si es rango
  range: {
    type: Boolean,
    default: false
  },
  // Marcas
  marks: {
    type: Array,
    default: () => []
  },
  // Si muestra marcas
  showMarks: {
    type: Boolean,
    default: false
  },
  // Si muestra tooltip
  showTooltip: {
    type: Boolean,
    default: true
  },
  // Si muestra campo de entrada
  showInput: {
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

const emit = defineEmits(['update:modelValue', 'change']);

// Referencias
const track = ref(null);
const handle = ref(null);
const startHandle = ref(null);
const endHandle = ref(null);

// Estado
const isDragging = ref(false);
const activeHandle = ref(null);
const focusedHandle = ref(null);
const input = ref(props.modelValue);
const startInput = ref(props.range ? props.modelValue[0] : null);
const endInput = ref(props.range ? props.modelValue[1] : null);

// Computed
const position = computed(() => {
  return ((props.modelValue - props.min) / (props.max - props.min)) * 100;
});

const startPosition = computed(() => {
  if (!props.range) return 0;
  return ((props.modelValue[0] - props.min) / (props.max - props.min)) * 100;
});

const endPosition = computed(() => {
  if (!props.range) return 0;
  return ((props.modelValue[1] - props.min) / (props.max - props.min)) * 100;
});

const progressStyle = computed(() => {
  if (props.range) {
    return {
      left: `${startPosition.value}%`,
      width: `${endPosition.value - startPosition.value}%`
    };
  }
  return {
    width: `${position.value}%`
  };
});

// Métodos
const startDragging = (handle, event) => {
  if (props.disabled || props.readonly) return;
  
  event.preventDefault();
  isDragging.value = true;
  activeHandle.value = handle;
  
  window.addEventListener('mousemove', handleDrag);
  window.addEventListener('mouseup', stopDragging);
  window.addEventListener('touchmove', handleDrag);
  window.addEventListener('touchend', stopDragging);
};

const handleDrag = (event) => {
  if (!isDragging.value) return;

  const rect = track.value.getBoundingClientRect();
  const e = event.touches ? event.touches[0] : event;
  let percentage = ((e.clientX - rect.left) / rect.width) * 100;
  percentage = Math.max(0, Math.min(100, percentage));

  const value = props.min + (percentage / 100) * (props.max - props.min);
  const snappedValue = snapToStep(value);

  if (props.range) {
    const newValue = [...props.modelValue];
    if (activeHandle.value === 'start') {
      newValue[0] = Math.min(snappedValue, props.modelValue[1] - props.step);
    } else {
      newValue[1] = Math.max(snappedValue, props.modelValue[0] + props.step);
    }
    emit('update:modelValue', newValue);
  } else {
    emit('update:modelValue', snappedValue);
  }
};

const stopDragging = () => {
  if (!isDragging.value) return;
  
  isDragging.value = false;
  activeHandle.value = null;
  
  window.removeEventListener('mousemove', handleDrag);
  window.removeEventListener('mouseup', stopDragging);
  window.removeEventListener('touchmove', handleDrag);
  window.removeEventListener('touchend', stopDragging);
  
  emit('change', props.modelValue);
};

const handleTrackClick = (event) => {
  if (props.disabled || props.readonly) return;

  const rect = track.value.getBoundingClientRect();
  const percentage = ((event.clientX - rect.left) / rect.width) * 100;
  const value = props.min + (percentage / 100) * (props.max - props.min);
  const snappedValue = snapToStep(value);

  if (props.range) {
    // Encontrar el control más cercano
    const distanceToStart = Math.abs(snappedValue - props.modelValue[0]);
    const distanceToEnd = Math.abs(snappedValue - props.modelValue[1]);
    const newValue = [...props.modelValue];
    
    if (distanceToStart <= distanceToEnd) {
      newValue[0] = snappedValue;
    } else {
      newValue[1] = snappedValue;
    }
    
    emit('update:modelValue', newValue);
  } else {
    emit('update:modelValue', snappedValue);
  }
  
  emit('change', props.modelValue);
};

const handleKeydown = (handle, event) => {
  if (props.disabled || props.readonly) return;

  const step = event.shiftKey ? props.step * 10 : props.step;
  let newValue;

  if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
    newValue = (props.range ? props.modelValue[handle === 'start' ? 0 : 1] : props.modelValue) - step;
  }
  else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
    newValue = (props.range ? props.modelValue[handle === 'start' ? 0 : 1] : props.modelValue) + step;
  }
  else if (event.key === 'Home') {
    newValue = props.min;
  }
  else if (event.key === 'End') {
    newValue = props.max;
  }
  else {
    return;
  }

  event.preventDefault();
  newValue = snapToStep(newValue);

  if (props.range) {
    const values = [...props.modelValue];
    if (handle === 'start') {
      values[0] = Math.min(newValue, values[1] - props.step);
    } else {
      values[1] = Math.max(newValue, values[0] + props.step);
    }
    emit('update:modelValue', values);
  } else {
    emit('update:modelValue', newValue);
  }
  
  emit('change', props.modelValue);
};

const handleInputChange = (handle) => {
  let value;
  
  if (props.range) {
    if (handle === 'start') {
      value = Math.min(Number(startInput.value), props.modelValue[1] - props.step);
    } else {
      value = Math.max(Number(endInput.value), props.modelValue[0] + props.step);
    }
    
    const newValue = [...props.modelValue];
    newValue[handle === 'start' ? 0 : 1] = snapToStep(value);
    emit('update:modelValue', newValue);
  } else {
    value = snapToStep(Number(input.value));
    emit('update:modelValue', value);
  }
  
  emit('change', props.modelValue);
};

const snapToStep = (value) => {
  const normalized = Math.max(props.min, Math.min(props.max, value));
  const steps = Math.round((normalized - props.min) / props.step);
  return props.min + steps * props.step;
};

const formatValue = (value) => {
  return Number(value.toFixed(2));
};

const getMarkPosition = (value) => {
  return ((value - props.min) / (props.max - props.min)) * 100;
};

const isMarkActive = (value) => {
  if (props.range) {
    return value >= props.modelValue[0] && value <= props.modelValue[1];
  }
  return value <= props.modelValue;
};

// Lifecycle hooks
onMounted(() => {
  if (props.range) {
    startInput.value = props.modelValue[0];
    endInput.value = props.modelValue[1];
  } else {
    input.value = props.modelValue;
  }
});

onBeforeUnmount(() => {
  stopDragging();
});

// Observadores
watch(() => props.modelValue, (newValue) => {
  if (props.range) {
    startInput.value = newValue[0];
    endInput.value = newValue[1];
  } else {
    input.value = newValue;
  }
});
</script>

<style scoped>
.slider {
  width: 100%;
}

/* Etiqueta */
.slider-label {
  margin-bottom: 0.5rem;
  color: var(--text-color);
  font-weight: 500;
  font-size: 0.9rem;
}

.required-mark {
  color: var(--error-color);
  margin-left: 0.25rem;
}

/* Contenedor */
.slider-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Track */
.slider-track {
  position: relative;
  flex: 1;
  height: 40px;
  cursor: pointer;
}

/* Riel */
.track-rail {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--secondary-color);
  border-radius: 2px;
  transform: translateY(-50%);
}

/* Progreso */
.track-progress {
  position: absolute;
  top: 50%;
  height: 4px;
  background: var(--primary-color);
  border-radius: 2px;
  transform: translateY(-50%);
}

/* Control */
.slider-handle {
  position: absolute;
  top: 50%;
  width: 16px;
  height: 16px;
  background: white;
  border: 2px solid var(--primary-color);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
  transition: all 0.3s ease;
}

.slider-handle:hover,
.slider-handle.focused {
  transform: translate(-50%, -50%) scale(1.2);
  box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.2);
}

.slider-handle:active {
  cursor: grabbing;
}

/* Tooltip */
.handle-tooltip {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  padding: 0.25rem 0.5rem;
  background: var(--primary-color);
  color: white;
  font-size: 0.75rem;
  border-radius: var(--border-radius-sm);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.handle-tooltip.visible {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.handle-tooltip::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid var(--primary-color);
}

/* Marcas */
.track-marks {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
}

.mark {
  position: absolute;
  transform: translateX(-50%);
}

.mark-line {
  width: 2px;
  height: 8px;
  background: var(--secondary-color);
  margin: 0 auto;
}

.mark.active .mark-line {
  background: var(--primary-color);
}

.mark-label {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-light);
  text-align: center;
}

/* Campos de entrada */
.slider-input,
.range-input {
  width: 80px;
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
.has-error .track-progress {
  background: var(--error-color);
}

.has-error .slider-handle {
  border-color: var(--error-color);
}

.has-success .track-progress {
  background: var(--success-color);
}

.has-success .slider-handle {
  border-color: var(--success-color);
}

.is-disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.is-disabled .slider-track,
.is-disabled .slider-handle {
  cursor: not-allowed;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .slider-label {
    color: #E2E8F0;
  }

  .track-rail {
    background: #4a5568;
  }

  .slider-handle {
    background: #2d3748;
  }

  .mark-line {
    background: #4a5568;
  }

  .mark-label {
    color: #A0AEC0;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .slider-handle,
  .handle-tooltip {
    transition: none;
  }
}

/* Soporte para navegación con teclado */
.slider-handle:focus {
  outline: none;
  box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.2);
}

@media (prefers-color-scheme: dark) {
  .slider-handle:focus {
    box-shadow: 0 0 0 4px rgba(var(--primary-light-rgb), 0.2);
  }
}
</style>

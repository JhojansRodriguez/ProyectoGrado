<!-- Componente de selector de color -->
<template>
  <div 
    :class="[
      'color-picker',
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
        v-model="colorValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :error="error"
        :success="success"
        @focus="handleFocus"
        @blur="handleBlur"
      >
        <!-- Previsualización del color -->
        <template #prepend>
          <div 
            class="color-preview"
            :style="{ backgroundColor: colorValue || '#ffffff' }"
            @click="togglePicker"
          ></div>
        </template>
      </BaseInput>
    </div>

    <!-- Selector de color -->
    <Transition name="picker">
      <div 
        v-if="isOpen"
        ref="picker"
        class="picker-panel"
        @click.stop
      >
        <!-- Área de color -->
        <div 
          ref="colorArea"
          class="color-area"
          :style="{ backgroundColor: hueColor }"
          @mousedown="startPickingColor"
          @touchstart="startPickingColor"
        >
          <div class="color-overlay white"></div>
          <div class="color-overlay black"></div>
          <div 
            class="color-pointer"
            :style="{ 
              left: `${saturation}%`,
              top: `${100 - lightness}%`
            }"
          ></div>
        </div>

        <!-- Barra de tono -->
        <div 
          ref="hueBar"
          class="hue-bar"
          @mousedown="startPickingHue"
          @touchstart="startPickingHue"
        >
          <div 
            class="hue-pointer"
            :style="{ left: `${hue / 360 * 100}%` }"
          ></div>
        </div>

        <!-- Barra de opacidad -->
        <div 
          v-if="showAlpha"
          ref="alphaBar"
          class="alpha-bar"
          :style="{ 
            backgroundImage: `linear-gradient(to right, transparent, ${hueColor})` 
          }"
          @mousedown="startPickingAlpha"
          @touchstart="startPickingAlpha"
        >
          <div 
            class="alpha-pointer"
            :style="{ left: `${alpha * 100}%` }"
          ></div>
        </div>

        <!-- Colores predefinidos -->
        <div v-if="presetColors.length" class="preset-colors">
          <button
            v-for="color in presetColors"
            :key="color"
            type="button"
            class="preset-color"
            :style="{ backgroundColor: color }"
            :title="color"
            @click="selectPresetColor(color)"
          ></button>
        </div>

        <!-- Formatos de color -->
        <div class="color-formats">
          <button
            v-for="format in availableFormats"
            :key="format"
            type="button"
            :class="[
              'format-button',
              { active: currentFormat === format }
            ]"
            @click="currentFormat = format"
          >
            {{ format.toUpperCase() }}
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
    default: ''
  },
  // Placeholder
  placeholder: {
    type: String,
    default: 'Selecciona un color'
  },
  // Si muestra canal alfa
  showAlpha: {
    type: Boolean,
    default: true
  },
  // Colores predefinidos
  presetColors: {
    type: Array,
    default: () => [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7',
      '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
      '#009688', '#4caf50', '#8bc34a', '#cddc39',
      '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
    ]
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

// Estado
const isOpen = ref(false);
const colorValue = ref(props.modelValue);
const hue = ref(0);
const saturation = ref(100);
const lightness = ref(50);
const alpha = ref(1);
const currentFormat = ref('hex');
const isDragging = ref(false);
const dragTarget = ref(null);

// Referencias
const picker = ref(null);
const colorArea = ref(null);
const hueBar = ref(null);
const alphaBar = ref(null);

// Formatos disponibles
const availableFormats = ['hex', 'rgb', 'hsl'];

// Computed
const hueColor = computed(() => {
  return `hsl(${hue.value}, 100%, 50%)`;
});

// Métodos
const togglePicker = () => {
  if (props.disabled || props.readonly) return;
  isOpen.value = !isOpen.value;
};

const handleFocus = () => {
  if (!props.disabled && !props.readonly) {
    isOpen.value = true;
  }
};

const handleBlur = () => {
  // Pequeño delay para permitir la selección
  setTimeout(() => {
    if (!isDragging.value) {
      isOpen.value = false;
    }
  }, 200);
};

const startPickingColor = (event) => {
  event.preventDefault();
  isDragging.value = true;
  dragTarget.value = 'color';
  window.addEventListener('mousemove', handleDrag);
  window.addEventListener('mouseup', stopDragging);
  window.addEventListener('touchmove', handleDrag);
  window.addEventListener('touchend', stopDragging);
  handleDrag(event);
};

const startPickingHue = (event) => {
  event.preventDefault();
  isDragging.value = true;
  dragTarget.value = 'hue';
  window.addEventListener('mousemove', handleDrag);
  window.addEventListener('mouseup', stopDragging);
  window.addEventListener('touchmove', handleDrag);
  window.addEventListener('touchend', stopDragging);
  handleDrag(event);
};

const startPickingAlpha = (event) => {
  event.preventDefault();
  isDragging.value = true;
  dragTarget.value = 'alpha';
  window.addEventListener('mousemove', handleDrag);
  window.addEventListener('mouseup', stopDragging);
  window.addEventListener('touchmove', handleDrag);
  window.addEventListener('touchend', stopDragging);
  handleDrag(event);
};

const handleDrag = (event) => {
  const e = event.touches ? event.touches[0] : event;
  
  if (dragTarget.value === 'color') {
    const rect = colorArea.value.getBoundingClientRect();
    saturation.value = Math.round((e.clientX - rect.left) / rect.width * 100);
    lightness.value = Math.round((rect.bottom - e.clientY) / rect.height * 100);
  } 
  else if (dragTarget.value === 'hue') {
    const rect = hueBar.value.getBoundingClientRect();
    hue.value = Math.round((e.clientX - rect.left) / rect.width * 360);
  }
  else if (dragTarget.value === 'alpha') {
    const rect = alphaBar.value.getBoundingClientRect();
    alpha.value = Math.round((e.clientX - rect.left) / rect.width * 100) / 100;
  }

  // Limitar valores
  saturation.value = Math.max(0, Math.min(100, saturation.value));
  lightness.value = Math.max(0, Math.min(100, lightness.value));
  hue.value = Math.max(0, Math.min(360, hue.value));
  alpha.value = Math.max(0, Math.min(1, alpha.value));

  updateColor();
};

const stopDragging = () => {
  isDragging.value = false;
  dragTarget.value = null;
  window.removeEventListener('mousemove', handleDrag);
  window.removeEventListener('mouseup', stopDragging);
  window.removeEventListener('touchmove', handleDrag);
  window.removeEventListener('touchend', stopDragging);
};

const updateColor = () => {
  let color;
  
  if (currentFormat.value === 'hex') {
    color = hslToHex(hue.value, saturation.value, lightness.value);
    if (props.showAlpha && alpha.value < 1) {
      color += Math.round(alpha.value * 255).toString(16).padStart(2, '0');
    }
  }
  else if (currentFormat.value === 'rgb') {
    const rgb = hslToRgb(hue.value, saturation.value, lightness.value);
    color = props.showAlpha && alpha.value < 1
      ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha.value})`
      : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }
  else if (currentFormat.value === 'hsl') {
    color = props.showAlpha && alpha.value < 1
      ? `hsla(${hue.value}, ${saturation.value}%, ${lightness.value}%, ${alpha.value})`
      : `hsl(${hue.value}, ${saturation.value}%, ${lightness.value}%)`;
  }

  colorValue.value = color;
  emit('update:modelValue', color);
  emit('change', color);
};

const selectPresetColor = (color) => {
  const { h, s, l, a } = parseColor(color);
  hue.value = h;
  saturation.value = s;
  lightness.value = l;
  alpha.value = a;
  updateColor();
};

// Funciones de conversión de color
const hslToRgb = (h, s, l) => {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(255 * f(0)),
    g: Math.round(255 * f(8)),
    b: Math.round(255 * f(4))
  };
};

const hslToHex = (h, s, l) => {
  const rgb = hslToRgb(h, s, l);
  return '#' + [rgb.r, rgb.g, rgb.b]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
};

const parseColor = (color) => {
  // Implementar parser de color según el formato
  // Por ahora retornamos valores por defecto
  return { h: 0, s: 100, l: 50, a: 1 };
};

// Lifecycle hooks
onMounted(() => {
  if (props.modelValue) {
    const { h, s, l, a } = parseColor(props.modelValue);
    hue.value = h;
    saturation.value = s;
    lightness.value = l;
    alpha.value = a;
  }
});

onBeforeUnmount(() => {
  stopDragging();
});

// Observadores
watch(() => props.modelValue, (newValue) => {
  colorValue.value = newValue;
  if (newValue) {
    const { h, s, l, a } = parseColor(newValue);
    hue.value = h;
    saturation.value = s;
    lightness.value = l;
    alpha.value = a;
  }
});
</script>

<style scoped>
.color-picker {
  position: relative;
  width: 100%;
}

/* Previsualización del color */
.color-preview {
  width: 24px;
  height: 24px;
  border-radius: var(--border-radius-sm);
  border: 2px solid var(--secondary-color);
  cursor: pointer;
  background-image: linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 10px 10px;
  background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
}

/* Panel del selector */
.picker-panel {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.5rem;
  padding: 1rem;
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 100;
  width: 240px;
}

/* Área de color */
.color-area {
  position: relative;
  width: 100%;
  height: 150px;
  border-radius: var(--border-radius-md);
  margin-bottom: 1rem;
  cursor: crosshair;
}

.color-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
}

.color-overlay.white {
  background: linear-gradient(to right, white, transparent);
}

.color-overlay.black {
  background: linear-gradient(to bottom, transparent, black);
}

.color-pointer {
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

/* Barra de tono */
.hue-bar {
  position: relative;
  width: 100%;
  height: 12px;
  margin-bottom: 1rem;
  border-radius: var(--border-radius-sm);
  background: linear-gradient(to right,
    #f00 0%, #ff0 17%, #0f0 33%,
    #0ff 50%, #00f 67%, #f0f 83%, #f00 100%
  );
  cursor: pointer;
}

.hue-pointer {
  position: absolute;
  width: 12px;
  height: 18px;
  background: white;
  border-radius: 3px;
  transform: translateX(-50%);
  top: -3px;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

/* Barra de opacidad */
.alpha-bar {
  position: relative;
  width: 100%;
  height: 12px;
  margin-bottom: 1rem;
  border-radius: var(--border-radius-sm);
  background-image: linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 8px 8px;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
  cursor: pointer;
}

.alpha-pointer {
  position: absolute;
  width: 12px;
  height: 18px;
  background: white;
  border-radius: 3px;
  transform: translateX(-50%);
  top: -3px;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

/* Colores predefinidos */
.preset-colors {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.preset-color {
  width: 100%;
  padding-bottom: 100%;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  position: relative;
  transition: transform 0.3s ease;
}

.preset-color:hover {
  transform: scale(1.1);
}

/* Formatos de color */
.color-formats {
  display: flex;
  gap: 0.5rem;
}

.format-button {
  flex: 1;
  padding: 0.5rem;
  border: none;
  background: var(--secondary-color);
  color: var(--text-color);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all 0.3s ease;
}

.format-button:hover {
  background: var(--primary-color);
  color: white;
}

.format-button.active {
  background: var(--primary-color);
  color: white;
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
  .picker-panel {
    background: #2d3748;
  }

  .format-button {
    background: #4a5568;
    color: #E2E8F0;
  }

  .format-button:hover,
  .format-button.active {
    background: var(--primary-light);
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .preset-color,
  .format-button,
  .picker-enter-active,
  .picker-leave-active {
    transition: none;
  }
}

/* Soporte para navegación con teclado */
.preset-color:focus,
.format-button:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

@media (prefers-color-scheme: dark) {
  .preset-color:focus,
  .format-button:focus {
    outline-color: var(--primary-light);
  }
}
</style>

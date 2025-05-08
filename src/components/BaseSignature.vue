<!-- Componente de firma -->
<template>
  <div 
    :class="[
      'signature',
      {
        'has-error': !!error,
        'has-success': success,
        'is-disabled': disabled,
        'is-readonly': readonly,
        'has-signature': hasSignature
      }
    ]"
  >
    <!-- Canvas de firma -->
    <div class="signature-container">
      <canvas
        ref="canvas"
        class="signature-canvas"
        :width="width"
        :height="height"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="stopDrawing"
      ></canvas>

      <!-- Línea base -->
      <div class="signature-line"></div>

      <!-- Placeholder -->
      <div 
        v-if="!hasSignature && !disabled && !readonly"
        class="signature-placeholder"
      >
        {{ placeholder }}
      </div>
    </div>

    <!-- Acciones -->
    <div v-if="!readonly" class="signature-actions">
      <!-- Botón de limpiar -->
      <BaseButton
        variant="secondary"
        size="sm"
        :disabled="disabled || !hasSignature"
        @click="clear"
      >
        <i class="fas fa-eraser"></i>
        Limpiar
      </BaseButton>

      <!-- Botón de descargar -->
      <BaseButton
        v-if="downloadable"
        variant="secondary"
        size="sm"
        :disabled="disabled || !hasSignature"
        @click="download"
      >
        <i class="fas fa-download"></i>
        Descargar
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
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import BaseButton from './BaseButton.vue';

const props = defineProps({
  // Modelo (data URL de la firma)
  modelValue: {
    type: String,
    default: ''
  },
  // Ancho del canvas
  width: {
    type: Number,
    default: 400
  },
  // Alto del canvas
  height: {
    type: Number,
    default: 200
  },
  // Placeholder
  placeholder: {
    type: String,
    default: 'Firme aquí'
  },
  // Color de la línea
  lineColor: {
    type: String,
    default: '#000000'
  },
  // Grosor de la línea
  lineWidth: {
    type: Number,
    default: 2
  },
  // Si permite descargar
  downloadable: {
    type: Boolean,
    default: true
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

const emit = defineEmits(['update:modelValue', 'change', 'clear']);

// Referencias
const canvas = ref(null);
let ctx = null;

// Estado
const isDrawing = ref(false);
const hasSignature = ref(false);
const lastX = ref(0);
const lastY = ref(0);

// Métodos
const initCanvas = () => {
  ctx = canvas.value.getContext('2d');
  ctx.strokeStyle = props.lineColor;
  ctx.lineWidth = props.lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Escalar el canvas para pantallas de alta resolución
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.value.getBoundingClientRect();
  
  canvas.value.width = rect.width * dpr;
  canvas.value.height = rect.height * dpr;
  
  ctx.scale(dpr, dpr);
  canvas.value.style.width = `${rect.width}px`;
  canvas.value.style.height = `${rect.height}px`;

  // Cargar firma existente
  if (props.modelValue) {
    loadSignature(props.modelValue);
  }
};

const startDrawing = (event) => {
  if (props.disabled || props.readonly) return;

  isDrawing.value = true;
  const { x, y } = getCoordinates(event);
  lastX.value = x;
  lastY.value = y;
};

const draw = (event) => {
  if (!isDrawing.value || props.disabled || props.readonly) return;

  const { x, y } = getCoordinates(event);
  
  ctx.beginPath();
  ctx.moveTo(lastX.value, lastY.value);
  ctx.lineTo(x, y);
  ctx.stroke();

  lastX.value = x;
  lastY.value = y;
  hasSignature.value = true;
  
  updateModel();
};

const stopDrawing = () => {
  isDrawing.value = false;
};

const getCoordinates = (event) => {
  const rect = canvas.value.getBoundingClientRect();
  const scaleX = canvas.value.width / rect.width;
  const scaleY = canvas.value.height / rect.height;

  if (event.touches) {
    return {
      x: (event.touches[0].clientX - rect.left) * scaleX,
      y: (event.touches[0].clientY - rect.top) * scaleY
    };
  }

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
};

const handleTouchStart = (event) => {
  event.preventDefault();
  startDrawing(event);
};

const handleTouchMove = (event) => {
  event.preventDefault();
  draw(event);
};

const clear = () => {
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
  hasSignature.value = false;
  updateModel();
  emit('clear');
};

const updateModel = () => {
  const dataUrl = canvas.value.toDataURL();
  emit('update:modelValue', hasSignature.value ? dataUrl : '');
  emit('change', hasSignature.value ? dataUrl : '');
};

const loadSignature = (dataUrl) => {
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0);
    hasSignature.value = true;
  };
  img.src = dataUrl;
};

const download = () => {
  if (!hasSignature.value) return;

  const link = document.createElement('a');
  link.download = 'signature.png';
  link.href = canvas.value.toDataURL();
  link.click();
};

// Lifecycle hooks
onMounted(() => {
  initCanvas();
  window.addEventListener('resize', initCanvas);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', initCanvas);
});

// Observadores
watch(() => props.modelValue, (newValue) => {
  if (newValue && !hasSignature.value) {
    loadSignature(newValue);
  }
});
</script>

<style scoped>
.signature {
  width: 100%;
}

/* Contenedor */
.signature-container {
  position: relative;
  width: 100%;
  border: 2px solid var(--secondary-color);
  border-radius: var(--border-radius-lg);
  transition: border-color 0.3s ease;
  overflow: hidden;
}

/* Canvas */
.signature-canvas {
  position: relative;
  z-index: 1;
  touch-action: none;
  cursor: crosshair;
}

/* Línea base */
.signature-line {
  position: absolute;
  left: 1rem;
  right: 1rem;
  bottom: 2rem;
  height: 1px;
  background: var(--secondary-color);
  opacity: 0.5;
}

/* Placeholder */
.signature-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--text-light);
  font-size: 0.875rem;
  white-space: nowrap;
  pointer-events: none;
}

/* Acciones */
.signature-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
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
.has-error .signature-container {
  border-color: var(--error-color);
}

.has-success .signature-container {
  border-color: var(--success-color);
}

.is-disabled {
  opacity: 0.7;
  pointer-events: none;
}

.is-readonly .signature-canvas {
  cursor: default;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .signature-container {
    background: #2d3748;
    border-color: #4a5568;
  }

  .signature-line {
    background: #4a5568;
  }

  .signature-placeholder {
    color: #A0AEC0;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .signature-container {
    transition: none;
  }
}

/* Soporte para pantallas táctiles */
@media (hover: none) {
  .signature-canvas {
    cursor: default;
  }
}

/* Soporte para pantallas pequeñas */
@media (max-width: 480px) {
  .signature-actions {
    flex-direction: column;
  }

  .signature-actions button {
    width: 100%;
  }
}
</style>

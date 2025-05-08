<!-- Componente de grabador de audio -->
<template>
  <div 
    :class="[
      'audio-recorder',
      {
        'has-error': !!error,
        'has-success': success,
        'is-disabled': disabled,
        'is-readonly': readonly,
        'is-recording': isRecording,
        'has-audio': hasAudio
      }
    ]"
  >
    <!-- Visualizador -->
    <div class="visualizer-container">
      <canvas
        ref="visualizer"
        class="visualizer"
        :width="320"
        :height="80"
      ></canvas>

      <!-- Tiempo -->
      <div class="time-display">
        {{ formatTime(recordingTime) }}
      </div>
    </div>

    <!-- Controles de grabación -->
    <div v-if="!readonly" class="recorder-controls">
      <!-- Grabar/Detener -->
      <BaseButton
        :variant="isRecording ? 'danger' : 'primary'"
        :disabled="disabled || (isRecording && recordingTime >= maxDuration)"
        @click="toggleRecording"
      >
        <i :class="isRecording ? 'fas fa-stop' : 'fas fa-microphone'"></i>
        {{ isRecording ? 'Detener' : 'Grabar' }}
      </BaseButton>

      <!-- Eliminar -->
      <BaseButton
        v-if="hasAudio"
        variant="danger"
        :disabled="disabled || isRecording"
        @click="deleteRecording"
      >
        <i class="fas fa-trash"></i>
        Eliminar
      </BaseButton>
    </div>

    <!-- Reproductor -->
    <div v-if="hasAudio" class="player-container">
      <audio
        ref="audioPlayer"
        :src="audioUrl"
        controls
        class="audio-player"
      ></audio>

      <!-- Descargar -->
      <BaseButton
        v-if="downloadable"
        variant="secondary"
        size="sm"
        :disabled="disabled || isRecording"
        @click="downloadAudio"
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
import { ref, onMounted, onBeforeUnmount } from 'vue';
import BaseButton from './BaseButton.vue';

const props = defineProps({
  // Duración máxima en segundos
  maxDuration: {
    type: Number,
    default: 300 // 5 minutos
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

const emit = defineEmits([
  'update:modelValue',
  'start-recording',
  'stop-recording',
  'delete-recording'
]);

// Referencias
const visualizer = ref(null);
const audioPlayer = ref(null);

// Estado
const isRecording = ref(false);
const hasAudio = ref(false);
const recordingTime = ref(0);
const audioUrl = ref('');
const mediaRecorder = ref(null);
const audioChunks = ref([]);
const animationFrame = ref(null);
const recordingInterval = ref(null);

// Variables para el visualizador
let audioContext = null;
let analyser = null;
let dataArray = null;
let canvasCtx = null;

// Métodos
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Configurar visualizador
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    
    // Configurar canvas
    canvasCtx = visualizer.value.getContext('2d');
    
    // Iniciar grabación
    mediaRecorder.value = new MediaRecorder(stream);
    audioChunks.value = [];
    
    mediaRecorder.value.ondataavailable = (event) => {
      audioChunks.value.push(event.data);
    };
    
    mediaRecorder.value.onstop = () => {
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/wav' });
      audioUrl.value = URL.createObjectURL(audioBlob);
      hasAudio.value = true;
      emit('update:modelValue', audioBlob);
    };
    
    mediaRecorder.value.start();
    isRecording.value = true;
    recordingTime.value = 0;
    
    // Iniciar temporizador
    recordingInterval.value = setInterval(() => {
      recordingTime.value++;
      if (recordingTime.value >= props.maxDuration) {
        stopRecording();
      }
    }, 1000);
    
    // Iniciar visualización
    drawVisualizer();
    
    emit('start-recording');
  } catch (error) {
    console.error('Error al iniciar la grabación:', error);
  }
};

const stopRecording = () => {
  if (!isRecording.value) return;
  
  mediaRecorder.value.stop();
  isRecording.value = false;
  clearInterval(recordingInterval.value);
  cancelAnimationFrame(animationFrame.value);
  
  // Limpiar recursos
  if (audioContext) {
    audioContext.close();
    audioContext = null;
    analyser = null;
  }
  
  emit('stop-recording');
};

const toggleRecording = () => {
  if (isRecording.value) {
    stopRecording();
  } else {
    startRecording();
  }
};

const deleteRecording = () => {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
  }
  
  audioUrl.value = '';
  hasAudio.value = false;
  recordingTime.value = 0;
  audioChunks.value = [];
  
  emit('update:modelValue', null);
  emit('delete-recording');
};

const drawVisualizer = () => {
  if (!isRecording.value) return;
  
  animationFrame.value = requestAnimationFrame(drawVisualizer);
  
  analyser.getByteFrequencyData(dataArray);
  
  canvasCtx.fillStyle = 'rgb(45, 55, 72)';
  canvasCtx.fillRect(0, 0, visualizer.value.width, visualizer.value.height);
  
  const barWidth = (visualizer.value.width / dataArray.length) * 2.5;
  let barHeight;
  let x = 0;
  
  for (let i = 0; i < dataArray.length; i++) {
    barHeight = (dataArray[i] / 255) * visualizer.value.height;
    
    canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
    canvasCtx.fillRect(x, visualizer.value.height - barHeight, barWidth, barHeight);
    
    x += barWidth + 1;
  }
};

const downloadAudio = () => {
  if (!hasAudio.value) return;
  
  const link = document.createElement('a');
  link.href = audioUrl.value;
  link.download = `recording-${new Date().toISOString()}.wav`;
  link.click();
};

// Lifecycle hooks
onMounted(() => {
  // Limpiar canvas
  canvasCtx = visualizer.value.getContext('2d');
  canvasCtx.fillStyle = 'rgb(45, 55, 72)';
  canvasCtx.fillRect(0, 0, visualizer.value.width, visualizer.value.height);
});

onBeforeUnmount(() => {
  stopRecording();
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
  }
});
</script>

<style scoped>
.audio-recorder {
  width: 100%;
  max-width: 400px;
  padding: 1.5rem;
  border: 2px solid var(--secondary-color);
  border-radius: var(--border-radius-lg);
  transition: all 0.3s ease;
}

/* Visualizador */
.visualizer-container {
  position: relative;
  margin-bottom: 1rem;
}

.visualizer {
  width: 100%;
  height: 80px;
  background: rgb(45, 55, 72);
  border-radius: var(--border-radius-md);
}

.time-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: 'Fira Code', monospace;
  font-size: 1.5rem;
  color: white;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
}

/* Controles */
.recorder-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

/* Reproductor */
.player-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.audio-player {
  width: 100%;
  height: 40px;
  border-radius: var(--border-radius-md);
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

.is-recording .visualizer {
  border: 2px solid var(--error-color);
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .audio-recorder {
    background: #2d3748;
  }

  .visualizer {
    background: #1a202c;
  }

  .audio-player {
    background: #4a5568;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .audio-recorder {
    transition: none;
  }
}

/* Soporte para pantallas pequeñas */
@media (max-width: 480px) {
  .recorder-controls {
    flex-direction: column;
  }

  .recorder-controls button {
    width: 100%;
  }

  .time-display {
    font-size: 1.25rem;
  }
}

/* Soporte para navegación con teclado */
.recorder-controls button:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

@media (prefers-color-scheme: dark) {
  .recorder-controls button:focus {
    outline-color: var(--primary-light);
  }
}
</style>

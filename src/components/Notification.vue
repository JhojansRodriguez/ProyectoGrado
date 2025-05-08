<!-- Componente de notificación -->
<template>
  <Transition name="notification">
    <div 
      v-if="show"
      :class="['notification', type]"
      role="alert"
      @click="handleClick"
    >
      <div class="notification-icon">
        <i :class="iconClass"></i>
      </div>
      
      <div class="notification-content">
        <h4 v-if="title" class="notification-title">{{ title }}</h4>
        <p class="notification-message">{{ message }}</p>
      </div>

      <button 
        v-if="!hideClose"
        class="notification-close"
        @click.stop="close"
        aria-label="Cerrar notificación"
      >
        <i class="fas fa-times"></i>
      </button>

      <!-- Barra de progreso si es autoclose -->
      <div 
        v-if="autoClose"
        class="progress-bar"
        :style="{ animationDuration: `${duration}ms` }"
      ></div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { NOTIFICATION_TYPES } from '../utils/constants';

const props = defineProps({
  // Tipo de notificación
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  // Título opcional
  title: {
    type: String,
    default: ''
  },
  // Mensaje de la notificación
  message: {
    type: String,
    required: true
  },
  // Duración en ms (0 para no cerrar automáticamente)
  duration: {
    type: Number,
    default: 5000
  },
  // Si se debe ocultar el botón de cerrar
  hideClose: {
    type: Boolean,
    default: false
  },
  // Si se puede cerrar al hacer clic
  clickToClose: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['close']);

// Estado
const show = ref(true);
let timeoutId = null;

// Computed
const autoClose = computed(() => props.duration > 0);

const iconClass = computed(() => {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  };
  return icons[props.type] || icons.info;
});

// Métodos
const close = () => {
  show.value = false;
  emit('close');
};

const handleClick = () => {
  if (props.clickToClose) {
    close();
  }
};

// Lifecycle hooks
onMounted(() => {
  if (autoClose.value) {
    timeoutId = setTimeout(close, props.duration);
  }
});

onBeforeUnmount(() => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
});
</script>

<style scoped>
.notification {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 400px;
  width: 100%;
}

/* Tipos de notificación */
.notification.success {
  background-color: #d4edda;
  border-left: 4px solid #28a745;
}

.notification.error {
  background-color: #f8d7da;
  border-left: 4px solid #dc3545;
}

.notification.warning {
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
}

.notification.info {
  background-color: #cce5ff;
  border-left: 4px solid #0d6efd;
}

/* Icono */
.notification-icon {
  flex-shrink: 0;
  margin-right: 1rem;
  font-size: 1.25rem;
}

.success .notification-icon {
  color: #28a745;
}

.error .notification-icon {
  color: #dc3545;
}

.warning .notification-icon {
  color: #ffc107;
}

.info .notification-icon {
  color: #0d6efd;
}

/* Contenido */
.notification-content {
  flex-grow: 1;
  margin-right: 1rem;
}

.notification-title {
  margin: 0 0 0.25rem;
  font-size: 1rem;
  font-weight: 600;
}

.notification-message {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* Botón de cerrar */
.notification-close {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 1rem;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.notification-close:hover {
  opacity: 1;
}

/* Barra de progreso */
.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.5);
  width: 100%;
  transform-origin: left;
  animation: progress linear forwards;
}

@keyframes progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Animaciones de entrada/salida */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Media queries */
@media (max-width: 480px) {
  .notification {
    margin: 0.5rem;
    max-width: calc(100% - 1rem);
  }

  .notification-title {
    font-size: 0.95rem;
  }

  .notification-message {
    font-size: 0.85rem;
  }
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .notification {
    background: #2d3748;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .notification-title,
  .notification-message {
    color: white;
  }

  .notification-close {
    color: #a0aec0;
  }

  .notification.success {
    background-color: rgba(40, 167, 69, 0.2);
  }

  .notification.error {
    background-color: rgba(220, 53, 69, 0.2);
  }

  .notification.warning {
    background-color: rgba(255, 193, 7, 0.2);
  }

  .notification.info {
    background-color: rgba(13, 110, 253, 0.2);
  }
}
</style>

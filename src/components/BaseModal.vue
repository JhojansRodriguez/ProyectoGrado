<!-- Componente de modal base -->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-wrapper">
        <!-- Overlay -->
        <div 
          class="modal-overlay" 
          @click="handleOverlayClick"
          :class="{ 'no-close': !closeOnOverlay }"
        ></div>

        <!-- Contenedor del modal -->
        <div 
          :class="[
            'modal-container',
            size,
            { 'no-padding': noPadding }
          ]"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? 'modal-title' : undefined"
        >
          <!-- Header -->
          <div v-if="$slots.header || title" class="modal-header">
            <slot name="header">
              <h2 v-if="title" id="modal-title" class="modal-title">
                {{ title }}
              </h2>
            </slot>

            <!-- Botón de cierre -->
            <button 
              v-if="!hideClose"
              class="close-button"
              @click="handleClose"
              aria-label="Cerrar modal"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Contenido -->
          <div class="modal-content">
            <slot></slot>
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
  // Modelo (controla visibilidad)
  modelValue: {
    type: Boolean,
    required: true
  },
  // Título del modal
  title: {
    type: String,
    default: ''
  },
  // Tamaño del modal (sm, md, lg, xl, full)
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl', 'full'].includes(value)
  },
  // Si se puede cerrar haciendo clic en el overlay
  closeOnOverlay: {
    type: Boolean,
    default: true
  },
  // Si se oculta el botón de cierre
  hideClose: {
    type: Boolean,
    default: false
  },
  // Si el modal no debe tener padding
  noPadding: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'close']);

// Métodos
const handleClose = () => {
  emit('update:modelValue', false);
  emit('close');
};

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    handleClose();
  }
};

const handleEscape = (event) => {
  if (event.key === 'Escape' && props.modelValue && !props.hideClose) {
    handleClose();
  }
};

// Manejo del scroll del body
const lockScroll = () => {
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
};

const unlockScroll = () => {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
};

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('keydown', handleEscape);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape);
  unlockScroll();
});

// Observar cambios en la visibilidad
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    lockScroll();
  } else {
    unlockScroll();
  }
});
</script>

<style scoped>
.modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

.modal-overlay.no-close {
  cursor: default;
}

.modal-container {
  position: relative;
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  max-height: 90vh;
  width: 90%;
  display: flex;
  flex-direction: column;
  z-index: 1;
}

/* Tamaños */
.modal-container.sm {
  max-width: 400px;
}

.modal-container.md {
  max-width: 600px;
}

.modal-container.lg {
  max-width: 800px;
}

.modal-container.xl {
  max-width: 1000px;
}

.modal-container.full {
  width: 95%;
  height: 95vh;
  max-width: none;
}

/* Header */
.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--secondary-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.25rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--border-radius-sm);
  transition: all 0.3s ease;
}

.close-button:hover {
  background: var(--secondary-color);
  color: var(--text-color);
}

/* Contenido */
.modal-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex-grow: 1;
}

.no-padding .modal-content {
  padding: 0;
}

/* Footer */
.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--secondary-color);
  background: #f8f9fa;
}

/* Animaciones */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container {
  transform: scale(0.8);
}

.modal-leave-to .modal-container {
  transform: scale(0.8);
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .modal-container {
    background: #2d3748;
  }

  .modal-header {
    border-bottom-color: #4a5568;
  }

  .modal-footer {
    background: #1a202c;
    border-top-color: #4a5568;
  }

  .modal-title {
    color: #E2E8F0;
  }

  .close-button {
    color: #A0AEC0;
  }

  .close-button:hover {
    background: #4a5568;
    color: #E2E8F0;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active,
  .modal-enter-active .modal-container,
  .modal-leave-active .modal-container,
  .close-button {
    transition: none;
  }
}

/* Soporte para pantallas pequeñas */
@media (max-width: 480px) {
  .modal-container {
    width: 95%;
  }

  .modal-header,
  .modal-content,
  .modal-footer {
    padding: 1rem;
  }

  .modal-title {
    font-size: 1.1rem;
  }
}
</style>

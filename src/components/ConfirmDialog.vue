<!-- Diálogo de confirmación -->
<template>
  <Transition name="dialog">
    <div v-if="show" class="dialog-overlay" @click="handleOverlayClick">
      <div class="dialog-content" :class="type">
        <!-- Icono -->
        <div class="dialog-icon">
          <i :class="iconClass"></i>
        </div>

        <!-- Título y mensaje -->
        <h2 class="dialog-title">{{ title }}</h2>
        <p class="dialog-message">{{ message }}</p>

        <!-- Mensaje de advertencia -->
        <p v-if="warning" class="dialog-warning">
          <i class="fas fa-exclamation-triangle"></i>
          {{ warning }}
        </p>

        <!-- Botones -->
        <div class="dialog-actions">
          <button 
            class="btn-cancel" 
            @click="handleCancel"
            :disabled="loading"
          >
            {{ cancelText }}
          </button>
          
          <button 
            class="btn-confirm" 
            @click="handleConfirm"
            :disabled="loading"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            {{ loading ? loadingText : confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // Si el diálogo está visible
  show: {
    type: Boolean,
    required: true
  },
  // Tipo de diálogo (success, danger, warning, info)
  type: {
    type: String,
    default: 'danger',
    validator: (value) => ['success', 'danger', 'warning', 'info'].includes(value)
  },
  // Título del diálogo
  title: {
    type: String,
    required: true
  },
  // Mensaje principal
  message: {
    type: String,
    required: true
  },
  // Mensaje de advertencia opcional
  warning: {
    type: String,
    default: ''
  },
  // Texto del botón de cancelar
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  // Texto del botón de confirmar
  confirmText: {
    type: String,
    default: 'Confirmar'
  },
  // Texto durante la carga
  loadingText: {
    type: String,
    default: 'Procesando...'
  },
  // Si está en estado de carga
  loading: {
    type: Boolean,
    default: false
  },
  // Si se puede cerrar haciendo clic fuera
  closeOnOverlay: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['confirm', 'cancel']);

// Computed
const iconClass = computed(() => {
  const icons = {
    success: 'fas fa-check-circle',
    danger: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  };
  return icons[props.type];
});

// Métodos
const handleConfirm = () => {
  if (!props.loading) {
    emit('confirm');
  }
};

const handleCancel = () => {
  if (!props.loading) {
    emit('cancel');
  }
};

const handleOverlayClick = (event) => {
  if (event.target.classList.contains('dialog-overlay') && props.closeOnOverlay && !props.loading) {
    emit('cancel');
  }
};
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.dialog-content {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-lg);
}

.dialog-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Colores de iconos según tipo */
.success .dialog-icon {
  color: var(--success-color);
}

.danger .dialog-icon {
  color: var(--error-color);
}

.warning .dialog-icon {
  color: var(--warning-color);
}

.info .dialog-icon {
  color: var(--info-color);
}

.dialog-title {
  color: var(--text-color);
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.dialog-message {
  color: var(--text-light);
  margin-bottom: 1.5rem;
}

.dialog-warning {
  background: #fff3cd;
  color: #856404;
  padding: 0.75rem;
  border-radius: var(--border-radius-sm);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.dialog-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-cancel,
.btn-confirm {
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  justify-content: center;
}

.btn-cancel {
  background: transparent;
  color: var(--text-color);
  border: 2px solid var(--secondary-color);
}

.btn-cancel:hover:not(:disabled) {
  background: var(--secondary-color);
}

.btn-confirm {
  border: none;
  color: white;
}

/* Colores del botón confirmar según tipo */
.success .btn-confirm {
  background: var(--success-color);
}

.success .btn-confirm:hover:not(:disabled) {
  background: #218838;
}

.danger .btn-confirm {
  background: var(--error-color);
}

.danger .btn-confirm:hover:not(:disabled) {
  background: #c82333;
}

.warning .btn-confirm {
  background: var(--warning-color);
}

.warning .btn-confirm:hover:not(:disabled) {
  background: #e0a800;
}

.info .btn-confirm {
  background: var(--info-color);
}

.info .btn-confirm:hover:not(:disabled) {
  background: #138496;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Animaciones */
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-active .dialog-content {
  animation: dialog-in 0.3s ease-out;
}

.dialog-leave-active .dialog-content {
  animation: dialog-out 0.3s ease-in;
}

@keyframes dialog-in {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes dialog-out {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.8);
    opacity: 0;
  }
}

/* Media queries */
@media (max-width: 480px) {
  .dialog-content {
    padding: 1.5rem;
  }

  .dialog-icon {
    font-size: 2.5rem;
  }

  .dialog-title {
    font-size: 1.25rem;
  }

  .dialog-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-confirm {
    width: 100%;
  }
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .dialog-content {
    background: #2d3748;
  }

  .dialog-title {
    color: white;
  }

  .dialog-message {
    color: #a0aec0;
  }

  .btn-cancel {
    color: white;
    border-color: #4a5568;
  }

  .btn-cancel:hover:not(:disabled) {
    background: #4a5568;
  }

  .dialog-warning {
    background: rgba(255, 193, 7, 0.1);
    color: #ffc107;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .dialog-enter-active,
  .dialog-leave-active {
    transition: none;
  }

  .dialog-enter-active .dialog-content,
  .dialog-leave-active .dialog-content {
    animation: none;
  }
}
</style>

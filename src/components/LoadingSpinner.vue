<!-- Componente de carga -->
<template>
  <div :class="['loading-spinner', { overlay: overlay, fullscreen }]">
    <div class="spinner-container">
      <div class="spinner"></div>
      <p v-if="message" class="message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  // Si debe mostrarse como overlay sobre el contenido
  overlay: {
    type: Boolean,
    default: false
  },
  // Si debe ocupar toda la pantalla
  fullscreen: {
    type: Boolean,
    default: false
  },
  // Mensaje opcional para mostrar
  message: {
    type: String,
    default: ''
  }
});
</script>

<style scoped>
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

/* Versión overlay */
.loading-spinner.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 1000;
}

/* Versión pantalla completa */
.loading-spinner.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 9999;
}

.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #E8F1F2;
  border-top: 4px solid #5F7F79;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.message {
  color: #2D4739;
  margin: 0;
  font-size: 0.9rem;
  text-align: center;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Variantes de tamaño */
.loading-spinner.small .spinner {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.loading-spinner.large .spinner {
  width: 60px;
  height: 60px;
  border-width: 6px;
}

/* Variantes de color */
.loading-spinner.primary .spinner {
  border-color: #E8F1F2;
  border-top-color: #5F7F79;
}

.loading-spinner.secondary .spinner {
  border-color: #E8F1F2;
  border-top-color: #2D4739;
}

.loading-spinner.light .spinner {
  border-color: rgba(255, 255, 255, 0.2);
  border-top-color: white;
}

.loading-spinner.dark .spinner {
  border-color: rgba(0, 0, 0, 0.1);
  border-top-color: #2D4739;
}

/* Media queries */
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
  }
}

@media (max-width: 768px) {
  .spinner {
    width: 30px;
    height: 30px;
    border-width: 3px;
  }

  .message {
    font-size: 0.8rem;
  }
}
</style>

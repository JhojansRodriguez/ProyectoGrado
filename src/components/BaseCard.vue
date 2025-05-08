<!-- Componente de tarjeta base -->
<template>
  <div 
    :class="[
      'base-card',
      variant,
      {
        'hoverable': hoverable,
        'clickable': clickable || !!onClick,
        'loading': loading,
        'no-padding': noPadding
      }
    ]"
    @click="handleClick"
  >
    <!-- Header de la tarjeta -->
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 v-if="title" class="card-title">{{ title }}</h3>
      </slot>
    </div>

    <!-- Overlay de carga -->
    <div v-if="loading" class="loading-overlay">
      <LoadingSpinner />
    </div>

    <!-- Contenido principal -->
    <div :class="['card-content', { 'has-header': $slots.header || title }]">
      <slot></slot>
    </div>

    <!-- Footer de la tarjeta -->
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>

    <!-- Botón de cierre -->
    <button 
      v-if="closable" 
      class="close-button"
      @click.stop="handleClose"
      title="Cerrar"
    >
      <i class="fas fa-times"></i>
    </button>
  </div>
</template>

<script setup>
import LoadingSpinner from './LoadingSpinner.vue';

const props = defineProps({
  // Título de la tarjeta
  title: {
    type: String,
    default: ''
  },
  // Variante de la tarjeta (default, primary, success, warning, danger, info)
  variant: {
    type: String,
    default: 'default',
    validator: (value) => [
      'default',
      'primary',
      'success',
      'warning',
      'danger',
      'info'
    ].includes(value)
  },
  // Si la tarjeta tiene efecto hover
  hoverable: {
    type: Boolean,
    default: false
  },
  // Si la tarjeta es clickeable
  clickable: {
    type: Boolean,
    default: false
  },
  // Si la tarjeta está en estado de carga
  loading: {
    type: Boolean,
    default: false
  },
  // Si la tarjeta se puede cerrar
  closable: {
    type: Boolean,
    default: false
  },
  // Si la tarjeta no debe tener padding
  noPadding: {
    type: Boolean,
    default: false
  },
  // Función a ejecutar al hacer click
  onClick: {
    type: Function,
    default: null
  }
});

const emit = defineEmits(['close', 'click']);

// Métodos
const handleClick = (event) => {
  if (props.onClick) {
    props.onClick(event);
  }
  emit('click', event);
};

const handleClose = (event) => {
  emit('close', event);
};
</script>

<style scoped>
.base-card {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
}

/* Variantes */
.base-card.primary {
  border-left: 4px solid var(--primary-color);
}

.base-card.success {
  border-left: 4px solid var(--success-color);
}

.base-card.warning {
  border-left: 4px solid var(--warning-color);
}

.base-card.danger {
  border-left: 4px solid var(--error-color);
}

.base-card.info {
  border-left: 4px solid var(--info-color);
}

/* Header */
.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--secondary-color);
}

.card-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.25rem;
  font-weight: 600;
}

/* Contenido */
.card-content {
  padding: 1.5rem;
}

.card-content.has-header {
  padding-top: 1rem;
}

.no-padding .card-content {
  padding: 0;
}

/* Footer */
.card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--secondary-color);
  background: #f8f9fa;
}

/* Estados */
.base-card.hoverable:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.base-card.clickable {
  cursor: pointer;
}

/* Botón de cierre */
.close-button {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--border-radius-sm);
  transition: all 0.3s ease;
  z-index: 1;
}

.close-button:hover {
  background: var(--secondary-color);
  color: var(--text-color);
}

/* Overlay de carga */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .base-card {
    background: #2d3748;
  }

  .card-title {
    color: #E2E8F0;
  }

  .card-footer {
    background: #1a202c;
    border-top-color: #4a5568;
  }

  .card-header {
    border-bottom-color: #4a5568;
  }

  .close-button {
    color: #A0AEC0;
  }

  .close-button:hover {
    background: #4a5568;
    color: #E2E8F0;
  }

  .loading-overlay {
    background: rgba(45, 55, 72, 0.8);
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .base-card {
    transition: none;
  }

  .base-card.hoverable:hover {
    transform: none;
  }

  .close-button {
    transition: none;
  }
}

/* Soporte para pantallas pequeñas */
@media (max-width: 480px) {
  .card-content {
    padding: 1rem;
  }

  .card-header,
  .card-footer {
    padding: 0.75rem 1rem;
  }

  .card-title {
    font-size: 1.1rem;
  }
}
</style>

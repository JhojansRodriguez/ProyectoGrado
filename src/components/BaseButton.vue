<!-- Componente de botón base -->
<template>
  <button
    :class="[
      'base-button',
      variant,
      size,
      {
        'loading': loading,
        'block': block,
        'icon-only': iconOnly,
        'disabled': disabled || loading
      }
    ]"
    :type="type"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <!-- Icono izquierdo -->
    <i v-if="iconLeft && !loading" :class="iconLeft"></i>
    
    <!-- Icono de carga -->
    <i v-if="loading" class="fas fa-spinner fa-spin"></i>
    
    <!-- Contenido del botón -->
    <span v-if="!iconOnly" class="button-content">
      <slot>{{ text }}</slot>
    </span>
    
    <!-- Icono derecho -->
    <i v-if="iconRight && !loading" :class="iconRight"></i>
  </button>
</template>

<script setup>
defineProps({
  // Texto del botón
  text: {
    type: String,
    default: ''
  },
  // Variante del botón (primary, secondary, danger, success, warning, info)
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => [
      'primary',
      'secondary',
      'danger',
      'success',
      'warning',
      'info',
      'link'
    ].includes(value)
  },
  // Tamaño del botón (sm, md, lg)
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  // Tipo de botón HTML
  type: {
    type: String,
    default: 'button'
  },
  // Si está en estado de carga
  loading: {
    type: Boolean,
    default: false
  },
  // Si está deshabilitado
  disabled: {
    type: Boolean,
    default: false
  },
  // Si debe ocupar todo el ancho disponible
  block: {
    type: Boolean,
    default: false
  },
  // Icono a la izquierda
  iconLeft: {
    type: String,
    default: ''
  },
  // Icono a la derecha
  iconRight: {
    type: String,
    default: ''
  },
  // Si es solo icono
  iconOnly: {
    type: Boolean,
    default: false
  }
});

defineEmits(['click']);
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  position: relative;
  overflow: hidden;
}

/* Tamaños */
.base-button.sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.base-button.md {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.base-button.lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

/* Variantes */
.base-button.primary {
  background: var(--primary-color);
  color: white;
}

.base-button.primary:hover:not(:disabled) {
  background: var(--primary-dark);
}

.base-button.secondary {
  background: transparent;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
}

.base-button.secondary:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
}

.base-button.danger {
  background: var(--error-color);
  color: white;
}

.base-button.danger:hover:not(:disabled) {
  background: #c82333;
}

.base-button.success {
  background: var(--success-color);
  color: white;
}

.base-button.success:hover:not(:disabled) {
  background: #218838;
}

.base-button.warning {
  background: var(--warning-color);
  color: #212529;
}

.base-button.warning:hover:not(:disabled) {
  background: #e0a800;
}

.base-button.info {
  background: var(--info-color);
  color: white;
}

.base-button.info:hover:not(:disabled) {
  background: #138496;
}

.base-button.link {
  background: transparent;
  color: var(--primary-color);
  padding: 0;
}

.base-button.link:hover:not(:disabled) {
  color: var(--primary-dark);
  text-decoration: underline;
}

/* Estados */
.base-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.base-button.loading {
  cursor: wait;
}

.base-button.loading .button-content {
  opacity: 0;
}

.base-button.loading i {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

/* Botón de bloque */
.base-button.block {
  width: 100%;
}

/* Botón solo icono */
.base-button.icon-only {
  padding: 0.5rem;
  width: 2.5rem;
  height: 2.5rem;
}

.base-button.icon-only.sm {
  width: 2rem;
  height: 2rem;
  padding: 0.4rem;
}

.base-button.icon-only.lg {
  width: 3rem;
  height: 3rem;
  padding: 0.6rem;
}

/* Efecto ripple */
.base-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

.base-button:active::after {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .base-button.secondary {
    border-color: var(--primary-light);
    color: var(--primary-light);
  }

  .base-button.secondary:hover:not(:disabled) {
    background: var(--primary-light);
    color: var(--primary-dark);
  }

  .base-button.link {
    color: var(--primary-light);
  }

  .base-button.link:hover:not(:disabled) {
    color: white;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .base-button {
    transition: none;
  }

  .base-button::after {
    display: none;
  }

  .base-button i.fa-spin {
    animation: none;
  }
}
</style>

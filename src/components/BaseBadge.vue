<!-- Componente de badge -->
<template>
  <span 
    :class="[
      'badge',
      variant,
      size,
      {
        'dot': dot,
        'rounded': rounded,
        'outlined': outlined,
        'clickable': clickable || !!onClick,
        'with-icon': !!icon
      }
    ]"
    :style="badgeStyle"
    @click="handleClick"
  >
    <!-- Icono -->
    <i v-if="icon && !dot" :class="icon"></i>

    <!-- Contenido -->
    <span v-if="!dot" class="badge-content">
      <slot>{{ content }}</slot>
    </span>
  </span>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
  // Contenido del badge
  content: {
    type: [String, Number],
    default: ''
  },
  // Variante (primary, success, warning, danger, info)
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => [
      'primary',
      'success',
      'warning',
      'danger',
      'info',
      'default'
    ].includes(value)
  },
  // Tamaño (sm, md, lg)
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  // Si es solo un punto
  dot: {
    type: Boolean,
    default: false
  },
  // Si es redondeado
  rounded: {
    type: Boolean,
    default: false
  },
  // Si es outline
  outlined: {
    type: Boolean,
    default: false
  },
  // Si es clickeable
  clickable: {
    type: Boolean,
    default: false
  },
  // Icono
  icon: {
    type: String,
    default: ''
  },
  // Color personalizado
  color: {
    type: String,
    default: ''
  },
  // Color de fondo personalizado
  backgroundColor: {
    type: String,
    default: ''
  },
  // Función onClick
  onClick: {
    type: Function,
    default: null
  }
});

const emit = defineEmits(['click']);

// Computed
const badgeStyle = computed(() => {
  if (!props.color && !props.backgroundColor) return {};

  return {
    color: props.color || undefined,
    backgroundColor: props.backgroundColor || undefined,
    borderColor: props.outlined ? (props.color || undefined) : undefined
  };
});

// Métodos
const handleClick = (event) => {
  if (props.onClick) {
    props.onClick(event);
  }
  emit('click', event);
};
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.3s ease;
}

/* Tamaños */
.badge.sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  min-height: 1.5rem;
}

.badge.md {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  min-height: 1.75rem;
}

.badge.lg {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  min-height: 2rem;
}

/* Variantes sólidas */
.badge.primary {
  background: var(--primary-color);
  color: white;
}

.badge.success {
  background: var(--success-color);
  color: white;
}

.badge.warning {
  background: var(--warning-color);
  color: #212529;
}

.badge.danger {
  background: var(--error-color);
  color: white;
}

.badge.info {
  background: var(--info-color);
  color: white;
}

.badge.default {
  background: var(--secondary-color);
  color: var(--text-color);
}

/* Variantes outline */
.badge.outlined {
  background: transparent;
  border: 1px solid currentColor;
}

.badge.outlined.primary {
  color: var(--primary-color);
}

.badge.outlined.success {
  color: var(--success-color);
}

.badge.outlined.warning {
  color: var(--warning-color);
}

.badge.outlined.danger {
  color: var(--error-color);
}

.badge.outlined.info {
  color: var(--info-color);
}

.badge.outlined.default {
  color: var(--text-color);
}

/* Dot */
.badge.dot {
  padding: 0;
  width: 8px;
  height: 8px;
  min-height: 0;
  border-radius: 50%;
}

.badge.dot.sm {
  width: 6px;
  height: 6px;
}

.badge.dot.lg {
  width: 10px;
  height: 10px;
}

/* Bordes redondeados */
.badge:not(.dot) {
  border-radius: var(--border-radius-md);
}

.badge.rounded:not(.dot) {
  border-radius: 999px;
}

/* Estados */
.badge.clickable {
  cursor: pointer;
}

.badge.clickable:hover {
  opacity: 0.9;
}

.badge.clickable:active {
  transform: scale(0.95);
}

/* Con icono */
.badge.with-icon {
  padding-left: 0.5rem;
}

.badge.with-icon.sm {
  padding-left: 0.375rem;
}

.badge.with-icon.lg {
  padding-left: 0.75rem;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .badge.default {
    background: #4a5568;
    color: #E2E8F0;
  }

  .badge.outlined.default {
    color: #E2E8F0;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .badge {
    transition: none;
  }

  .badge.clickable:active {
    transform: none;
  }
}
</style>

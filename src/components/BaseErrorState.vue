<!-- Componente de estado de error -->
<template>
  <div 
    :class="[
      'error-state',
      size,
      {
        'with-action': hasAction,
        'centered': centered
      }
    ]"
  >
    <!-- Icono -->
    <div class="icon-wrapper" :style="{ color: iconColor }">
      <i v-if="icon" :class="icon"></i>
      <slot name="icon"></slot>
    </div>

    <!-- Título -->
    <h3 class="title">
      <slot name="title">{{ title }}</slot>
    </h3>

    <!-- Mensaje de error -->
    <p class="error-message">
      <slot name="message">{{ message }}</slot>
    </p>

    <!-- Detalles técnicos -->
    <div v-if="showDetails && (details || error)" class="error-details">
      <button 
        class="details-toggle"
        @click="isExpanded = !isExpanded"
      >
        <i :class="isExpanded ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"></i>
        Detalles técnicos
      </button>

      <div v-show="isExpanded" class="details-content">
        <pre>{{ details || formatError(error) }}</pre>
      </div>
    </div>

    <!-- Acciones -->
    <div class="actions">
      <!-- Botón de reintentar -->
      <BaseButton
        v-if="retryable"
        variant="primary"
        :loading="retrying"
        @click="handleRetry"
      >
        <i class="fas fa-redo"></i>
        {{ retryLabel }}
      </BaseButton>

      <!-- Botón de acción personalizada -->
      <slot name="action">
        <BaseButton
          v-if="actionLabel"
          :variant="actionVariant"
          @click="$emit('action')"
        >
          <i v-if="actionIcon" :class="actionIcon"></i>
          {{ actionLabel }}
        </BaseButton>
      </slot>
    </div>

    <!-- Contenido adicional -->
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, computed, useSlots } from 'vue';
import BaseButton from './BaseButton.vue';

const props = defineProps({
  // Título del error
  title: {
    type: String,
    default: 'Ha ocurrido un error'
  },
  // Mensaje de error
  message: {
    type: String,
    default: 'No se pudo completar la operación solicitada.'
  },
  // Objeto de error
  error: {
    type: [Error, Object, String],
    default: null
  },
  // Detalles adicionales
  details: {
    type: String,
    default: ''
  },
  // Si debe mostrar detalles técnicos
  showDetails: {
    type: Boolean,
    default: false
  },
  // Icono (clase de Font Awesome)
  icon: {
    type: String,
    default: 'fas fa-exclamation-circle'
  },
  // Color del icono
  iconColor: {
    type: String,
    default: '#dc3545'
  },
  // Tamaño (sm, md, lg)
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  // Si se puede reintentar
  retryable: {
    type: Boolean,
    default: false
  },
  // Etiqueta del botón de reintentar
  retryLabel: {
    type: String,
    default: 'Reintentar'
  },
  // Si está reintentando
  retrying: {
    type: Boolean,
    default: false
  },
  // Etiqueta del botón de acción
  actionLabel: {
    type: String,
    default: ''
  },
  // Icono del botón de acción
  actionIcon: {
    type: String,
    default: ''
  },
  // Variante del botón de acción
  actionVariant: {
    type: String,
    default: 'secondary'
  },
  // Si debe estar centrado
  centered: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['retry', 'action']);

// Estado
const isExpanded = ref(false);

// Get slots
const slots = useSlots();

// Computed
const hasAction = computed(() => {
  return props.retryable || props.actionLabel || !!slots.action;
});

// Métodos
const handleRetry = () => {
  emit('retry');
};

const formatError = (error) => {
  if (!error) return '';
  
  if (typeof error === 'string') return error;
  
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n${error.stack}`;
  }
  
  return JSON.stringify(error, null, 2);
};
</script>

<style scoped>
.error-state {
  padding: 2rem;
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
}

/* Tamaños */
.error-state.sm {
  padding: 1.5rem;
  max-width: 400px;
}

.error-state.lg {
  padding: 3rem;
  max-width: 600px;
}

/* Icono */
.icon-wrapper {
  margin-bottom: 1.5rem;
}

.icon-wrapper i {
  font-size: 3rem;
}

.error-state.sm .icon-wrapper i {
  font-size: 2rem;
}

.error-state.lg .icon-wrapper i {
  font-size: 4rem;
}

/* Título */
.title {
  color: var(--text-color);
  font-size: 1.25rem;
  margin: 0 0 0.5rem;
}

.error-state.sm .title {
  font-size: 1.1rem;
}

.error-state.lg .title {
  font-size: 1.5rem;
}

/* Mensaje */
.error-message {
  color: var(--text-light);
  margin: 0 0 1.5rem;
  line-height: 1.5;
}

.error-state.sm .error-message {
  font-size: 0.9rem;
}

/* Detalles */
.error-details {
  margin: 1.5rem 0;
  text-align: left;
}

.details-toggle {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  padding: 0;
  margin-bottom: 0.5rem;
}

.details-content {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: var(--border-radius-md);
  overflow-x: auto;
}

.details-content pre {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
  white-space: pre-wrap;
  word-break: break-all;
}

/* Acciones */
.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}

/* Alineación */
.error-state.centered {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.error-state.sm.centered {
  min-height: 200px;
}

.error-state.lg.centered {
  min-height: 400px;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .title {
    color: #E2E8F0;
  }

  .error-message {
    color: #A0AEC0;
  }

  .details-toggle {
    color: var(--primary-light);
  }

  .details-content {
    background: #1a202c;
  }

  .details-content pre {
    color: #A0AEC0;
  }
}

/* Soporte para pantallas pequeñas */
@media (max-width: 480px) {
  .error-state {
    padding: 1.5rem;
  }

  .error-state.lg {
    padding: 2rem;
  }

  .icon-wrapper i {
    font-size: 2.5rem;
  }

  .error-state.lg .icon-wrapper i {
    font-size: 3rem;
  }

  .title {
    font-size: 1.1rem;
  }

  .error-state.lg .title {
    font-size: 1.25rem;
  }

  .error-message {
    font-size: 0.9rem;
  }

  .actions {
    flex-direction: column;
  }

  .error-state.centered {
    min-height: 250px;
  }

  .error-state.lg.centered {
    min-height: 300px;
  }
}
</style>

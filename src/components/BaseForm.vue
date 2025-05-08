<!-- Componente de formulario -->
<template>
  <form
    :class="[
      'form',
      {
        'loading': loading,
        'readonly': readonly,
        'compact': compact
      }
    ]"
    @submit.prevent="handleSubmit"
  >
    <!-- Overlay de carga -->
    <div v-if="loading" class="loading-overlay">
      <LoadingSpinner />
    </div>

    <!-- Título del formulario -->
    <div v-if="title || subtitle" class="form-header">
      <h2 v-if="title" class="form-title">{{ title }}</h2>
      <p v-if="subtitle" class="form-subtitle">{{ subtitle }}</p>
    </div>

    <!-- Campos del formulario -->
    <div class="form-fields">
      <slot></slot>
    </div>

    <!-- Mensaje de error -->
    <p v-if="error" class="form-error">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </p>

    <!-- Acciones del formulario -->
    <div v-if="$slots.actions || submitLabel || cancelLabel" class="form-actions">
      <slot name="actions">
        <BaseButton
          v-if="cancelLabel"
          :variant="cancelVariant"
          :disabled="loading || readonly"
          @click="handleCancel"
        >
          {{ cancelLabel }}
        </BaseButton>

        <BaseButton
          v-if="submitLabel"
          type="submit"
          :variant="submitVariant"
          :loading="loading"
          :disabled="loading || readonly || disabled"
        >
          {{ submitLabel }}
        </BaseButton>
      </slot>
    </div>
  </form>
</template>

<script setup>
import { provide } from 'vue';
import BaseButton from './BaseButton.vue';
import LoadingSpinner from './LoadingSpinner.vue';

const props = defineProps({
  // Título del formulario
  title: {
    type: String,
    default: ''
  },
  // Subtítulo del formulario
  subtitle: {
    type: String,
    default: ''
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
  // Si es de solo lectura
  readonly: {
    type: Boolean,
    default: false
  },
  // Si es compacto
  compact: {
    type: Boolean,
    default: false
  },
  // Mensaje de error
  error: {
    type: String,
    default: ''
  },
  // Etiqueta del botón de enviar
  submitLabel: {
    type: String,
    default: ''
  },
  // Variante del botón de enviar
  submitVariant: {
    type: String,
    default: 'primary'
  },
  // Etiqueta del botón de cancelar
  cancelLabel: {
    type: String,
    default: ''
  },
  // Variante del botón de cancelar
  cancelVariant: {
    type: String,
    default: 'secondary'
  }
});

const emit = defineEmits(['submit', 'cancel']);

// Proporcionar estado del formulario a los componentes hijos
provide('formState', {
  loading: props.loading,
  disabled: props.disabled,
  readonly: props.readonly,
  compact: props.compact
});

// Métodos
const handleSubmit = (event) => {
  emit('submit', event);
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<style scoped>
.form {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

/* Header */
.form-header {
  margin-bottom: 2rem;
  text-align: center;
}

.form-title {
  color: var(--text-color);
  font-size: 1.5rem;
  margin: 0 0 0.5rem;
}

.form-subtitle {
  color: var(--text-light);
  font-size: 0.875rem;
  margin: 0;
}

/* Campos */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.compact .form-fields {
  gap: 1rem;
}

/* Error */
.form-error {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #fef2f2;
  color: var(--error-color);
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

/* Acciones */
.form-actions {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* Estado de carga */
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
  z-index: 1;
  border-radius: var(--border-radius-lg);
}

/* Estados */
.form.readonly {
  opacity: 0.7;
  pointer-events: none;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .form-title {
    color: #E2E8F0;
  }

  .form-subtitle {
    color: #A0AEC0;
  }

  .form-error {
    background: rgba(220, 38, 38, 0.1);
  }

  .loading-overlay {
    background: rgba(45, 55, 72, 0.8);
  }
}

/* Soporte para pantallas pequeñas */
@media (max-width: 640px) {
  .form {
    padding: 0 1rem;
  }

  .form-title {
    font-size: 1.25rem;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions button {
    width: 100%;
  }
}

/* Soporte para pantallas medianas */
@media (min-width: 641px) and (max-width: 1024px) {
  .form {
    padding: 0 2rem;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .form,
  .form-actions button {
    transition: none;
  }
}

/* Soporte para navegación con teclado */
.form:focus-within {
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
}

/* Soporte para alto contraste */
@media (forced-colors: active) {
  .form-error {
    border: 1px solid CanvasText;
  }

  .loading-overlay {
    background: Canvas;
    border: 1px solid CanvasText;
  }
}
</style>

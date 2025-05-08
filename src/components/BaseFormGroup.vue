<!-- Componente de grupo de formulario -->
<template>
  <div 
    :class="[
      'form-group',
      {
        'has-error': !!error,
        'has-success': success,
        'is-required': required,
        'is-disabled': isDisabled,
        'is-readonly': isReadonly,
        'is-inline': inline,
        'is-compact': isCompact
      }
    ]"
  >
    <!-- Etiqueta -->
    <div v-if="label || $slots.label" class="group-label">
      <slot name="label">
        <label :for="id">
          {{ label }}
          <span v-if="required" class="required-mark">*</span>
        </label>
      </slot>

      <!-- Tooltip de ayuda -->
      <BaseTooltip 
        v-if="tooltip"
        :content="tooltip"
        position="top"
      >
        <button 
          type="button"
          class="tooltip-trigger"
          aria-label="Más información"
        >
          <i class="fas fa-info-circle"></i>
        </button>
      </BaseTooltip>
    </div>

    <!-- Contenido -->
    <div class="group-content">
      <slot></slot>
    </div>

    <!-- Mensaje de error -->
    <p v-if="error" class="group-error">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </p>

    <!-- Texto de ayuda -->
    <p v-else-if="helpText" class="group-help">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup>
import { inject, computed } from 'vue';
import BaseTooltip from './BaseTooltip.vue';

const props = defineProps({
  // ID para asociar label con input
  id: {
    type: String,
    default: ''
  },
  // Etiqueta del grupo
  label: {
    type: String,
    default: ''
  },
  // Si es requerido
  required: {
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
  // Si es inline
  inline: {
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
  // Si tiene estado de éxito
  success: {
    type: Boolean,
    default: false
  },
  // Texto de ayuda
  helpText: {
    type: String,
    default: ''
  },
  // Tooltip de ayuda
  tooltip: {
    type: String,
    default: ''
  }
});

// Inyectar estado del formulario padre si existe
const formState = inject('formState', {
  loading: false,
  disabled: false,
  readonly: false,
  compact: false
});

// Computed
const isDisabled = computed(() => props.disabled || formState.disabled);
const isReadonly = computed(() => props.readonly || formState.readonly);
const isCompact = computed(() => props.compact || formState.compact);
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Etiqueta */
.group-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.group-label label {
  color: var(--text-color);
  font-weight: 500;
  font-size: 0.9rem;
}

.required-mark {
  color: var(--error-color);
  margin-left: 0.25rem;
}

/* Tooltip */
.tooltip-trigger {
  background: none;
  border: none;
  padding: 0;
  color: var(--text-light);
  cursor: help;
  transition: color 0.3s ease;
}

.tooltip-trigger:hover {
  color: var(--primary-color);
}

/* Contenido */
.group-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Mensajes */
.group-error,
.group-help {
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.group-error {
  color: var(--error-color);
}

.group-help {
  color: var(--text-light);
}

/* Estados */
.is-disabled {
  opacity: 0.7;
  pointer-events: none;
}

.is-readonly {
  opacity: 0.7;
  pointer-events: none;
}

.has-error :deep(input),
.has-error :deep(select),
.has-error :deep(textarea) {
  border-color: var(--error-color);
}

.has-success :deep(input),
.has-success :deep(select),
.has-success :deep(textarea) {
  border-color: var(--success-color);
}

/* Variante inline */
.is-inline {
  flex-direction: row;
  align-items: center;
}

.is-inline .group-label {
  min-width: 200px;
  margin-bottom: 0;
}

.is-inline .group-content {
  flex: 1;
}

.is-inline .group-error,
.is-inline .group-help {
  margin-left: 200px;
}

/* Variante compacta */
.is-compact {
  gap: 0.25rem;
}

.is-compact .group-label label {
  font-size: 0.85rem;
}

.is-compact .group-error,
.is-compact .group-help {
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .group-label label {
    color: #E2E8F0;
  }

  .tooltip-trigger {
    color: #A0AEC0;
  }

  .tooltip-trigger:hover {
    color: var(--primary-light);
  }

  .group-help {
    color: #A0AEC0;
  }
}

/* Soporte para pantallas pequeñas */
@media (max-width: 640px) {
  .is-inline {
    flex-direction: column;
    align-items: stretch;
  }

  .is-inline .group-label {
    min-width: auto;
  }

  .is-inline .group-error,
  .is-inline .group-help {
    margin-left: 0;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .tooltip-trigger {
    transition: none;
  }
}

/* Soporte para navegación con teclado */
.tooltip-trigger:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
  border-radius: 2px;
}

@media (prefers-color-scheme: dark) {
  .tooltip-trigger:focus {
    outline-color: var(--primary-light);
  }
}
</style>

<!-- Componente de estado vacío -->
<template>
  <div 
    :class="[
      'empty-state',
      size,
      {
        'with-action': !!actionLabel,
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

    <!-- Descripción -->
    <p class="description">
      <slot name="description">{{ description }}</slot>
    </p>

    <!-- Acción -->
    <div v-if="$slots.action || actionLabel" class="action">
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
import BaseButton from './BaseButton.vue';

defineProps({
  // Título
  title: {
    type: String,
    required: true
  },
  // Descripción
  description: {
    type: String,
    default: ''
  },
  // Icono (clase de Font Awesome)
  icon: {
    type: String,
    default: 'fas fa-inbox'
  },
  // Color del icono
  iconColor: {
    type: String,
    default: '#B8D8D0'
  },
  // Tamaño (sm, md, lg)
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
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
    default: 'primary'
  },
  // Si debe estar centrado
  centered: {
    type: Boolean,
    default: true
  }
});

defineEmits(['action']);
</script>

<style scoped>
.empty-state {
  padding: 2rem;
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
}

/* Tamaños */
.empty-state.sm {
  padding: 1.5rem;
  max-width: 300px;
}

.empty-state.lg {
  padding: 3rem;
  max-width: 500px;
}

/* Icono */
.icon-wrapper {
  margin-bottom: 1.5rem;
}

.icon-wrapper i {
  font-size: 3rem;
}

.empty-state.sm .icon-wrapper i {
  font-size: 2rem;
}

.empty-state.lg .icon-wrapper i {
  font-size: 4rem;
}

/* Título */
.title {
  color: var(--text-color);
  font-size: 1.25rem;
  margin: 0 0 0.5rem;
}

.empty-state.sm .title {
  font-size: 1.1rem;
}

.empty-state.lg .title {
  font-size: 1.5rem;
}

/* Descripción */
.description {
  color: var(--text-light);
  margin: 0 0 1.5rem;
  line-height: 1.5;
}

.empty-state.sm .description {
  font-size: 0.9rem;
}

/* Acción */
.action {
  margin-top: 1.5rem;
}

/* Alineación */
.empty-state.centered {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.empty-state.sm.centered {
  min-height: 200px;
}

.empty-state.lg.centered {
  min-height: 400px;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .title {
    color: #E2E8F0;
  }

  .description {
    color: #A0AEC0;
  }
}

/* Soporte para pantallas pequeñas */
@media (max-width: 480px) {
  .empty-state {
    padding: 1.5rem;
  }

  .empty-state.lg {
    padding: 2rem;
  }

  .icon-wrapper i {
    font-size: 2.5rem;
  }

  .empty-state.lg .icon-wrapper i {
    font-size: 3rem;
  }

  .title {
    font-size: 1.1rem;
  }

  .empty-state.lg .title {
    font-size: 1.25rem;
  }

  .description {
    font-size: 0.9rem;
  }

  .empty-state.centered {
    min-height: 250px;
  }

  .empty-state.lg.centered {
    min-height: 300px;
  }
}

/* Soporte para pantallas muy pequeñas */
@media (max-width: 320px) {
  .empty-state {
    padding: 1rem;
  }

  .icon-wrapper i {
    font-size: 2rem;
  }

  .title {
    font-size: 1rem;
  }

  .description {
    font-size: 0.85rem;
  }
}
</style>

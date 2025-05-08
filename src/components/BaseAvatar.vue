<!-- Componente de avatar -->
<template>
  <div 
    :class="[
      'avatar',
      size,
      shape,
      status,
      {
        'clickable': clickable || !!onClick,
        'with-status': status,
        'loading': loading
      }
    ]"
    :style="avatarStyle"
    @click="handleClick"
  >
    <!-- Imagen -->
    <img
      v-if="src && !error"
      :src="src"
      :alt="alt"
      @error="handleImageError"
    >

    <!-- Fallback (iniciales o icono) -->
    <div v-else class="fallback" :style="fallbackStyle">
      <template v-if="initials">
        {{ initials }}
      </template>
      <i v-else :class="fallbackIcon"></i>
    </div>

    <!-- Indicador de estado -->
    <span 
      v-if="status"
      class="status-indicator"
      :title="statusTitle"
    ></span>

    <!-- Overlay de carga -->
    <div v-if="loading" class="loading-overlay">
      <LoadingSpinner size="sm" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { generateAvatarColor, getInitials } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner.vue';

const props = defineProps({
  // URL de la imagen
  src: {
    type: String,
    default: ''
  },
  // Texto alternativo
  alt: {
    type: String,
    default: 'Avatar'
  },
  // Nombre para generar iniciales
  name: {
    type: String,
    default: ''
  },
  // Tamaño (xs, sm, md, lg, xl)
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  // Forma (circle, square)
  shape: {
    type: String,
    default: 'circle',
    validator: (value) => ['circle', 'square'].includes(value)
  },
  // Color de fondo
  bgColor: {
    type: String,
    default: ''
  },
  // Color del texto/icono
  color: {
    type: String,
    default: 'white'
  },
  // Icono de fallback
  fallbackIcon: {
    type: String,
    default: 'fas fa-user'
  },
  // Estado (online, offline, away, busy)
  status: {
    type: String,
    default: '',
    validator: (value) => ['', 'online', 'offline', 'away', 'busy'].includes(value)
  },
  // Título del estado
  statusTitle: {
    type: String,
    default: ''
  },
  // Si está en estado de carga
  loading: {
    type: Boolean,
    default: false
  },
  // Si es clickeable
  clickable: {
    type: Boolean,
    default: false
  },
  // Función onClick
  onClick: {
    type: Function,
    default: null
  }
});

const emit = defineEmits(['click', 'error']);

// Estado
const error = ref(false);

// Computed
const initials = computed(() => {
  return props.name ? getInitials(props.name) : '';
});

const avatarStyle = computed(() => {
  return {
    backgroundColor: props.bgColor || (props.name ? generateAvatarColor(props.name) : '#E8F1F2'),
    cursor: (props.clickable || props.onClick) ? 'pointer' : 'default'
  };
});

const fallbackStyle = computed(() => {
  return {
    color: props.color
  };
});

// Métodos
const handleImageError = (e) => {
  error.value = true;
  emit('error', e);
};

const handleClick = (event) => {
  if (props.onClick) {
    props.onClick(event);
  }
  emit('click', event);
};
</script>

<style scoped>
.avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  user-select: none;
}

/* Tamaños */
.avatar.xs {
  width: 24px;
  height: 24px;
  font-size: 0.75rem;
}

.avatar.sm {
  width: 32px;
  height: 32px;
  font-size: 0.875rem;
}

.avatar.md {
  width: 40px;
  height: 40px;
  font-size: 1rem;
}

.avatar.lg {
  width: 48px;
  height: 48px;
  font-size: 1.25rem;
}

.avatar.xl {
  width: 64px;
  height: 64px;
  font-size: 1.5rem;
}

/* Formas */
.avatar.circle {
  border-radius: 50%;
}

.avatar.square {
  border-radius: var(--border-radius-md);
}

/* Imagen */
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Fallback */
.fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  font-weight: 600;
}

/* Estado */
.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 25%;
  height: 25%;
  border-radius: 50%;
  border: 2px solid white;
  background-color: #666;
}

.avatar.xs .status-indicator,
.avatar.sm .status-indicator {
  border-width: 1px;
}

.online .status-indicator {
  background-color: var(--success-color);
}

.offline .status-indicator {
  background-color: var(--text-light);
}

.away .status-indicator {
  background-color: var(--warning-color);
}

.busy .status-indicator {
  background-color: var(--error-color);
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
}

/* Hover */
.avatar.clickable:hover {
  opacity: 0.9;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .status-indicator {
    border-color: #2d3748;
  }

  .loading-overlay {
    background: rgba(45, 55, 72, 0.8);
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .avatar.clickable:hover {
    opacity: 1;
  }
}
</style>

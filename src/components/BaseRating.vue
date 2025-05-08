<!-- Componente de calificación -->
<template>
  <div 
    :class="[
      'rating',
      size,
      {
        'is-disabled': disabled,
        'is-readonly': readonly,
        'has-error': !!error,
        'has-success': success,
        'is-interactive': !disabled && !readonly
      }
    ]"
  >
    <!-- Estrellas -->
    <div 
      class="stars"
      @mouseleave="handleMouseLeave"
    >
      <button
        v-for="n in maxStars"
        :key="n"
        type="button"
        :class="[
          'star',
          {
            'filled': n <= (hoveredRating || modelValue),
            'half': showHalfStars && isHalfStar(n)
          }
        ]"
        :disabled="disabled || readonly"
        @click="handleClick(n)"
        @mouseover="handleMouseOver(n)"
      >
        <i 
          :class="[
            'fas',
            {
              'fa-star': !showHalfStars || !isHalfStar(n),
              'fa-star-half-alt': showHalfStars && isHalfStar(n)
            }
          ]"
        ></i>
      </button>
    </div>

    <!-- Etiqueta -->
    <div v-if="showLabel" class="rating-label">
      <slot name="label">
        {{ getLabelText }}
      </slot>
    </div>

    <!-- Mensaje de error -->
    <p v-if="error" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  // Modelo
  modelValue: {
    type: Number,
    default: 0
  },
  // Número máximo de estrellas
  maxStars: {
    type: Number,
    default: 5
  },
  // Si permite medias estrellas
  showHalfStars: {
    type: Boolean,
    default: false
  },
  // Si muestra etiqueta
  showLabel: {
    type: Boolean,
    default: true
  },
  // Etiquetas personalizadas
  labels: {
    type: Object,
    default: () => ({
      0: 'Sin calificar',
      1: 'Muy malo',
      2: 'Malo',
      3: 'Regular',
      4: 'Bueno',
      5: 'Excelente'
    })
  },
  // Tamaño (sm, md, lg)
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
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
  // Mensaje de error
  error: {
    type: String,
    default: ''
  },
  // Si tiene estado de éxito
  success: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

// Estado
const hoveredRating = ref(0);

// Computed
const getLabelText = computed(() => {
  const rating = hoveredRating.value || props.modelValue;
  if (props.showHalfStars) {
    const roundedRating = Math.floor(rating);
    return props.labels[roundedRating] || 'Sin calificar';
  }
  return props.labels[rating] || 'Sin calificar';
});

// Métodos
const handleClick = (value) => {
  if (props.disabled || props.readonly) return;

  let rating = value;
  if (props.showHalfStars) {
    const rect = event.currentTarget.getBoundingClientRect();
    const halfWidth = rect.width / 2;
    const clickX = event.clientX - rect.left;
    rating = clickX < halfWidth ? value - 0.5 : value;
  }

  emit('update:modelValue', rating);
  emit('change', rating);
};

const handleMouseOver = (value) => {
  if (props.disabled || props.readonly) return;

  let rating = value;
  if (props.showHalfStars) {
    const rect = event.currentTarget.getBoundingClientRect();
    const halfWidth = rect.width / 2;
    const mouseX = event.clientX - rect.left;
    rating = mouseX < halfWidth ? value - 0.5 : value;
  }

  hoveredRating.value = rating;
};

const handleMouseLeave = () => {
  hoveredRating.value = 0;
};

const isHalfStar = (value) => {
  const rating = hoveredRating.value || props.modelValue;
  return value - 0.5 === rating;
};
</script>

<style scoped>
.rating {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

/* Estrellas */
.stars {
  display: flex;
  gap: 0.25rem;
}

.star {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--secondary-color);
  transition: all 0.3s ease;
}

.star.filled {
  color: #ffd700;
}

/* Tamaños */
.rating.sm .star {
  font-size: 1rem;
}

.rating.md .star {
  font-size: 1.5rem;
}

.rating.lg .star {
  font-size: 2rem;
}

/* Etiqueta */
.rating-label {
  font-size: 0.875rem;
  color: var(--text-color);
}

/* Mensaje de error */
.error-message {
  color: var(--error-color);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Estados */
.is-interactive .star:hover {
  transform: scale(1.1);
}

.is-disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.is-readonly .star {
  cursor: default;
}

/* Animaciones */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.star.filled:not(.is-readonly):not(.is-disabled) {
  animation: pulse 0.3s ease;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .star {
    color: #4a5568;
  }

  .rating-label {
    color: #E2E8F0;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .star {
    transition: none;
  }

  .star.filled:not(.is-readonly):not(.is-disabled) {
    animation: none;
  }
}

/* Soporte para navegación con teclado */
.star:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
  border-radius: 4px;
}

@media (prefers-color-scheme: dark) {
  .star:focus {
    outline-color: var(--primary-light);
  }
}

/* Soporte para alto contraste */
@media (forced-colors: active) {
  .star {
    color: ButtonText;
  }

  .star.filled {
    color: Highlight;
  }
}
</style>

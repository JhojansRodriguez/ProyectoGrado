<!-- Componente de tooltip -->
<template>
  <div 
    ref="container"
    class="tooltip-container"
    @mouseenter="show"
    @mouseleave="hide"
    @focus="show"
    @blur="hide"
  >
    <!-- Elemento activador -->
    <slot></slot>

    <!-- Tooltip -->
    <Transition :name="transition">
      <div
        v-if="isVisible"
        ref="tooltip"
        :class="[
          'tooltip',
          position,
          variant,
          size,
          {
            'has-arrow': arrow,
            'multiline': multiline
          }
        ]"
        :style="tooltipStyle"
        role="tooltip"
      >
        <!-- Contenido -->
        <div class="tooltip-content">
          <slot name="content">{{ content }}</slot>
        </div>

        <!-- Flecha -->
        <div v-if="arrow" class="tooltip-arrow"></div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';

const props = defineProps({
  // Contenido del tooltip
  content: {
    type: String,
    default: ''
  },
  // Posición (top, right, bottom, left)
  position: {
    type: String,
    default: 'top',
    validator: (value) => ['top', 'right', 'bottom', 'left'].includes(value)
  },
  // Variante (dark, light)
  variant: {
    type: String,
    default: 'dark',
    validator: (value) => ['dark', 'light'].includes(value)
  },
  // Tamaño (sm, md, lg)
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  // Si muestra flecha
  arrow: {
    type: Boolean,
    default: true
  },
  // Si permite múltiples líneas
  multiline: {
    type: Boolean,
    default: false
  },
  // Offset del tooltip
  offset: {
    type: Number,
    default: 8
  },
  // Delay para mostrar (ms)
  showDelay: {
    type: Number,
    default: 0
  },
  // Delay para ocultar (ms)
  hideDelay: {
    type: Number,
    default: 0
  }
});

// Referencias
const container = ref(null);
const tooltip = ref(null);

// Estado
const isVisible = ref(false);
const tooltipStyle = ref({});
let showTimeout = null;
let hideTimeout = null;

// Computed
const transition = computed(() => {
  const transitions = {
    top: 'tooltip-slide-down',
    right: 'tooltip-slide-left',
    bottom: 'tooltip-slide-up',
    left: 'tooltip-slide-right'
  };
  return transitions[props.position];
});

// Métodos
const updatePosition = () => {
  if (!container.value || !tooltip.value) return;

  const triggerRect = container.value.getBoundingClientRect();
  const tooltipRect = tooltip.value.getBoundingClientRect();

  let top = 0;
  let left = 0;

  switch (props.position) {
    case 'top':
      top = -tooltipRect.height - props.offset;
      left = (triggerRect.width - tooltipRect.width) / 2;
      break;
    case 'right':
      top = (triggerRect.height - tooltipRect.height) / 2;
      left = triggerRect.width + props.offset;
      break;
    case 'bottom':
      top = triggerRect.height + props.offset;
      left = (triggerRect.width - tooltipRect.width) / 2;
      break;
    case 'left':
      top = (triggerRect.height - tooltipRect.height) / 2;
      left = -tooltipRect.width - props.offset;
      break;
  }

  tooltipStyle.value = {
    top: `${top}px`,
    left: `${left}px`
  };
};

const show = async () => {
  clearTimeout(hideTimeout);
  if (props.showDelay) {
    showTimeout = setTimeout(async () => {
      isVisible.value = true;
      await nextTick();
      updatePosition();
    }, props.showDelay);
  } else {
    isVisible.value = true;
    await nextTick();
    updatePosition();
  }
};

const hide = () => {
  clearTimeout(showTimeout);
  if (props.hideDelay) {
    hideTimeout = setTimeout(() => {
      isVisible.value = false;
    }, props.hideDelay);
  } else {
    isVisible.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('resize', updatePosition);
  window.addEventListener('scroll', updatePosition);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updatePosition);
  window.removeEventListener('scroll', updatePosition);
  clearTimeout(showTimeout);
  clearTimeout(hideTimeout);
});
</script>

<style scoped>
.tooltip-container {
  position: relative;
  display: inline-block;
}

.tooltip {
  position: absolute;
  z-index: 9999;
  pointer-events: none;
}

/* Variantes */
.tooltip.dark {
  background: rgba(0, 0, 0, 0.9);
  color: white;
}

.tooltip.light {
  background: white;
  color: var(--text-color);
  box-shadow: var(--shadow-md);
}

/* Tamaños */
.tooltip.sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  max-width: 150px;
}

.tooltip.md {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  max-width: 200px;
}

.tooltip.lg {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  max-width: 300px;
}

/* Contenido */
.tooltip-content {
  text-align: center;
  white-space: nowrap;
}

.tooltip.multiline .tooltip-content {
  white-space: normal;
}

/* Flecha */
.tooltip-arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background: inherit;
  transform: rotate(45deg);
}

.tooltip.top .tooltip-arrow {
  bottom: -4px;
  left: calc(50% - 4px);
}

.tooltip.right .tooltip-arrow {
  left: -4px;
  top: calc(50% - 4px);
}

.tooltip.bottom .tooltip-arrow {
  top: -4px;
  left: calc(50% - 4px);
}

.tooltip.left .tooltip-arrow {
  right: -4px;
  top: calc(50% - 4px);
}

/* Animaciones */
.tooltip-slide-up-enter-active,
.tooltip-slide-up-leave-active,
.tooltip-slide-down-enter-active,
.tooltip-slide-down-leave-active,
.tooltip-slide-left-enter-active,
.tooltip-slide-left-leave-active,
.tooltip-slide-right-enter-active,
.tooltip-slide-right-leave-active {
  transition: all 0.2s ease;
}

.tooltip-slide-up-enter-from,
.tooltip-slide-up-leave-to {
  opacity: 0;
  transform: translateY(5px);
}

.tooltip-slide-down-enter-from,
.tooltip-slide-down-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.tooltip-slide-left-enter-from,
.tooltip-slide-left-leave-to {
  opacity: 0;
  transform: translateX(5px);
}

.tooltip-slide-right-enter-from,
.tooltip-slide-right-leave-to {
  opacity: 0;
  transform: translateX(-5px);
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .tooltip.light {
    background: #2d3748;
    color: #E2E8F0;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .tooltip-slide-up-enter-active,
  .tooltip-slide-up-leave-active,
  .tooltip-slide-down-enter-active,
  .tooltip-slide-down-leave-active,
  .tooltip-slide-left-enter-active,
  .tooltip-slide-left-leave-active,
  .tooltip-slide-right-enter-active,
  .tooltip-slide-right-leave-active {
    transition: opacity 0.2s;
    transform: none;
  }
}
</style>

<!-- Componente de menú desplegable -->
<template>
  <div 
    ref="container"
    :class="[
      'dropdown',
      {
        'show': isOpen,
        'disabled': disabled
      }
    ]"
    @keydown.esc="close"
  >
    <!-- Trigger -->
    <div 
      ref="trigger"
      class="dropdown-trigger"
      @click="toggle"
    >
      <slot name="trigger">
        <BaseButton
          :variant="buttonVariant"
          :size="buttonSize"
          :disabled="disabled"
        >
          {{ label }}
          <i 
            :class="[
              'dropdown-arrow',
              { 'open': isOpen }
            ]"
            class="fas fa-chevron-down"
          ></i>
        </BaseButton>
      </slot>
    </div>

    <!-- Menú -->
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        ref="menu"
        :class="[
          'dropdown-menu',
          placement,
          size,
          {
            'with-icons': hasIcons
          }
        ]"
        :style="menuStyle"
        role="menu"
      >
        <!-- Header -->
        <div v-if="$slots.header" class="dropdown-header">
          <slot name="header"></slot>
        </div>

        <!-- Items -->
        <div class="dropdown-items">
          <slot>
            <template v-for="(item, index) in items" :key="index">
              <!-- Separador -->
              <div v-if="item.divider" class="dropdown-divider"></div>

              <!-- Item -->
              <button
                v-else
                :class="[
                  'dropdown-item',
                  {
                    'active': isItemActive(item),
                    'disabled': item.disabled
                  }
                ]"
                :disabled="item.disabled"
                @click="handleItemClick(item)"
              >
                <i v-if="item.icon" :class="item.icon"></i>
                <span class="item-label">{{ item.label }}</span>
                <BaseBadge
                  v-if="item.badge"
                  :content="item.badge.content"
                  v-bind="item.badge"
                />
              </button>
            </template>
          </slot>
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer" class="dropdown-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import BaseButton from './BaseButton.vue';
import BaseBadge from './BaseBadge.vue';

const props = defineProps({
  // Etiqueta del botón
  label: {
    type: String,
    default: 'Opciones'
  },
  // Items del menú
  items: {
    type: Array,
    default: () => []
  },
  // Valor seleccionado
  modelValue: {
    type: [String, Number, Object],
    default: null
  },
  // Posición del menú
  placement: {
    type: String,
    default: 'bottom-start',
    validator: (value) => [
      'top-start',
      'top-end',
      'bottom-start',
      'bottom-end',
      'left-start',
      'left-end',
      'right-start',
      'right-end'
    ].includes(value)
  },
  // Tamaño
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  // Variante del botón
  buttonVariant: {
    type: String,
    default: 'secondary'
  },
  // Tamaño del botón
  buttonSize: {
    type: String,
    default: 'md'
  },
  // Si está deshabilitado
  disabled: {
    type: Boolean,
    default: false
  },
  // Offset del menú
  offset: {
    type: Number,
    default: 4
  }
});

const emit = defineEmits(['update:modelValue', 'select']);

// Referencias
const container = ref(null);
const trigger = ref(null);
const menu = ref(null);

// Estado
const isOpen = ref(false);
const menuStyle = ref({});

// Computed
const hasIcons = computed(() => {
  return props.items.some(item => item.icon);
});

// Métodos
const toggle = () => {
  if (!props.disabled) {
    isOpen.value ? close() : open();
  }
};

const open = () => {
  isOpen.value = true;
  nextTick(() => {
    updatePosition();
    document.addEventListener('click', handleOutsideClick);
  });
};

const close = () => {
  isOpen.value = false;
  document.removeEventListener('click', handleOutsideClick);
};

const handleOutsideClick = (event) => {
  if (container.value && !container.value.contains(event.target)) {
    close();
  }
};

const updatePosition = () => {
  if (!trigger.value || !menu.value) return;

  const triggerRect = trigger.value.getBoundingClientRect();
  const menuRect = menu.value.getBoundingClientRect();

  let top = 0;
  let left = 0;

  switch (props.placement) {
    case 'bottom-start':
      top = triggerRect.height + props.offset;
      left = 0;
      break;
    case 'bottom-end':
      top = triggerRect.height + props.offset;
      left = triggerRect.width - menuRect.width;
      break;
    case 'top-start':
      top = -menuRect.height - props.offset;
      left = 0;
      break;
    case 'top-end':
      top = -menuRect.height - props.offset;
      left = triggerRect.width - menuRect.width;
      break;
    // Agregar más casos según sea necesario
  }

  menuStyle.value = {
    top: `${top}px`,
    left: `${left}px`
  };
};

const handleItemClick = (item) => {
  if (item.disabled) return;

  emit('update:modelValue', item.value);
  emit('select', item);
  close();

  if (item.onClick) {
    item.onClick(item);
  }
};

const isItemActive = (item) => {
  return item.value === props.modelValue;
};

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('resize', updatePosition);
  window.addEventListener('scroll', updatePosition);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updatePosition);
  window.removeEventListener('scroll', updatePosition);
  document.removeEventListener('click', handleOutsideClick);
});
</script>

<style scoped>
.dropdown {
  position: relative;
  display: inline-block;
}

/* Trigger */
.dropdown-trigger {
  cursor: pointer;
}

.dropdown-arrow {
  transition: transform 0.3s ease;
  margin-left: 0.5rem;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

/* Menú */
.dropdown-menu {
  position: absolute;
  min-width: 200px;
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  overflow: hidden;
}

/* Header */
.dropdown-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--secondary-color);
}

/* Items */
.dropdown-items {
  max-height: 300px;
  overflow-y: auto;
}

.dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: var(--text-color);
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 0.75rem;
}

.dropdown-item:hover:not(.disabled) {
  background: var(--secondary-color);
}

.dropdown-item.active {
  background: var(--primary-color);
  color: white;
}

.dropdown-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Con iconos */
.dropdown-menu.with-icons .dropdown-item {
  padding-left: 0.75rem;
}

.dropdown-item i {
  width: 1.25rem;
  text-align: center;
}

/* Separador */
.dropdown-divider {
  height: 1px;
  background: var(--secondary-color);
  margin: 0.5rem 0;
}

/* Footer */
.dropdown-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--secondary-color);
}

/* Tamaños */
.dropdown-menu.sm .dropdown-item {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.dropdown-menu.lg .dropdown-item {
  padding: 1rem 1.25rem;
  font-size: 1.1rem;
}

/* Animaciones */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .dropdown-menu {
    background: #2d3748;
  }

  .dropdown-item {
    color: #E2E8F0;
  }

  .dropdown-item:hover:not(.disabled) {
    background: #4a5568;
  }

  .dropdown-header,
  .dropdown-footer {
    border-color: #4a5568;
  }

  .dropdown-divider {
    background: #4a5568;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .dropdown-arrow,
  .dropdown-enter-active,
  .dropdown-leave-active,
  .dropdown-item {
    transition: none;
  }
}
</style>

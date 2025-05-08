<!-- Componente de grid -->
<template>
  <div 
    :class="[
      'grid-container',
      {
        'loading': loading,
        'with-gap': gap
      }
    ]"
    :style="gridStyle"
  >
    <!-- Overlay de carga -->
    <div v-if="loading" class="loading-overlay">
      <LoadingSpinner />
    </div>

    <!-- Items -->
    <TransitionGroup 
      :name="animation ? 'grid' : ''"
      tag="div"
      class="grid"
    >
      <div
        v-for="(item, index) in items"
        :key="getItemKey(item, index)"
        :class="[
          'grid-item',
          {
            'clickable': isClickable(item),
            'selected': isSelected(item),
            'disabled': item.disabled
          }
        ]"
        :style="getItemStyle(item)"
        @click="handleItemClick(item)"
      >
        <!-- Checkbox de selección -->
        <div v-if="selectable" class="item-select">
          <BaseCheckbox
            :id="`grid-item-${index}`"
            v-model="selectedItems"
            :value="item"
            :disabled="item.disabled"
          />
        </div>

        <!-- Contenido del item -->
        <slot 
          name="item" 
          :item="item"
          :index="index"
        >
          <div class="item-content">
            <!-- Imagen o icono -->
            <div v-if="hasMedia(item)" class="item-media">
              <img
                v-if="item.image"
                :src="item.image"
                :alt="item.title || item.label"
                @error="handleImageError"
              >
              <i 
                v-else-if="item.icon"
                :class="['item-icon', item.icon]"
              ></i>
            </div>

            <!-- Información -->
            <div class="item-info">
              <h3 class="item-title">{{ item.title || item.label }}</h3>
              <p v-if="item.description" class="item-description">
                {{ item.description }}
              </p>
              <div v-if="item.metadata" class="item-metadata">
                {{ item.metadata }}
              </div>
            </div>

            <!-- Badge -->
            <BaseBadge
              v-if="item.badge"
              v-bind="typeof item.badge === 'object' ? item.badge : { content: item.badge }"
              class="item-badge"
            />
          </div>
        </slot>

        <!-- Acciones -->
        <div v-if="hasActions(item)" class="item-actions">
          <slot 
            name="actions" 
            :item="item"
            :index="index"
          >
            <template v-if="item.actions">
              <button
                v-for="action in item.actions"
                :key="action.key || action.label"
                class="item-action"
                :title="action.label"
                @click.stop="handleActionClick(action, item)"
              >
                <i :class="action.icon"></i>
              </button>
            </template>
          </slot>
        </div>
      </div>
    </TransitionGroup>

    <!-- Estado vacío -->
    <slot 
      v-if="!loading && items.length === 0" 
      name="empty"
    >
      <BaseEmptyState
        title="No hay elementos"
        description="No se encontraron elementos para mostrar."
        icon="fas fa-th-large"
      />
    </slot>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseCheckbox from './BaseCheckbox.vue';
import BaseBadge from './BaseBadge.vue';
import BaseEmptyState from './BaseEmptyState.vue';
import LoadingSpinner from './LoadingSpinner.vue';

const props = defineProps({
  // Items del grid
  items: {
    type: Array,
    required: true
  },
  // Número de columnas
  columns: {
    type: [Number, Object],
    default: 3
  },
  // Si es seleccionable
  selectable: {
    type: Boolean,
    default: false
  },
  // Items seleccionados
  modelValue: {
    type: Array,
    default: () => []
  },
  // Si tiene espacio entre items
  gap: {
    type: [Boolean, String],
    default: true
  },
  // Si está en estado de carga
  loading: {
    type: Boolean,
    default: false
  },
  // Si tiene animaciones
  animation: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'select', 'action', 'click']);

// Estado
const selectedItems = ref(props.modelValue);

// Computed
const gridStyle = computed(() => {
  const styles = {};
  
  // Manejo de columnas responsivas
  if (typeof props.columns === 'object') {
    const breakpoints = {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px'
    };

    const templateColumns = Object.entries(props.columns)
      .map(([breakpoint, cols]) => {
        if (breakpoint === 'default') {
          return `repeat(${cols}, 1fr)`;
        }
        return `@media (min-width: ${breakpoints[breakpoint]}) { grid-template-columns: repeat(${cols}, 1fr); }`;
      })
      .join(' ');

    styles['grid-template-columns'] = templateColumns;
  } else {
    styles['grid-template-columns'] = `repeat(${props.columns}, 1fr)`;
  }

  // Manejo de gap
  if (props.gap) {
    styles.gap = typeof props.gap === 'string' ? props.gap : '1rem';
  }

  return styles;
});

// Métodos
function getItemKey(item, index) {
  return item.id || item.key || index;
}

function isClickable(item) {
  return !item.disabled && (item.onClick || props.selectable);
}

function isSelected(item) {
  return selectedItems.value.includes(item);
}

function hasMedia(item) {
  return item.image || item.icon;
}

function hasActions(item) {
  return item.actions || props.$slots.actions;
}

function getItemStyle(item) {
  return item.style || {};
}

function handleItemClick(item) {
  if (item.disabled) return;

  if (item.onClick) {
    item.onClick(item);
  }
  emit('click', item);
}

function handleActionClick(action, item) {
  if (action.onClick) {
    action.onClick(item);
  }
  emit('action', { action, item });
}

function handleImageError(event) {
  event.target.style.display = 'none';
}

// Observadores
watch(() => props.modelValue, (newValue) => {
  selectedItems.value = newValue;
});

watch(selectedItems, (newValue) => {
  emit('update:modelValue', newValue);
  emit('select', newValue);
});
</script>

<style scoped>
.grid-container {
  position: relative;
  width: 100%;
}

.grid {
  display: grid;
  width: 100%;
}

/* Items */
.grid-item {
  position: relative;
  background: white;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

/* Estados */
.grid-item.clickable {
  cursor: pointer;
}

.grid-item.clickable:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.grid-item.selected {
  border: 2px solid var(--primary-color);
}

.grid-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Checkbox de selección */
.item-select {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 1;
}

/* Contenido */
.item-content {
  padding: 1rem;
}

/* Media */
.item-media {
  position: relative;
  width: 100%;
  padding-bottom: 75%; /* Ratio 4:3 */
  background: var(--secondary-color);
  margin-bottom: 1rem;
}

.item-media img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  color: var(--text-light);
}

/* Información */
.item-info {
  min-height: 0;
}

.item-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-color);
}

.item-description {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  color: var(--text-light);
}

.item-metadata {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-light);
}

/* Badge */
.item-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

/* Acciones */
.item-actions {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.5rem;
}

.item-action {
  padding: 0.5rem;
  background: white;
  border: none;
  border-radius: var(--border-radius-md);
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.item-action:hover {
  color: var(--primary-color);
  box-shadow: var(--shadow-md);
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
}

/* Animaciones */
.grid-move,
.grid-enter-active,
.grid-leave-active {
  transition: all 0.3s ease;
}

.grid-enter-from,
.grid-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .grid-item {
    background: #2d3748;
  }

  .item-title {
    color: #E2E8F0;
  }

  .item-description,
  .item-metadata {
    color: #A0AEC0;
  }

  .item-media {
    background: #4a5568;
  }

  .item-icon {
    color: #A0AEC0;
  }

  .item-action {
    background: #2d3748;
    color: #A0AEC0;
  }

  .item-action:hover {
    color: var(--primary-light);
  }

  .loading-overlay {
    background: rgba(45, 55, 72, 0.8);
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .grid-item,
  .item-action,
  .grid-move,
  .grid-enter-active,
  .grid-leave-active {
    transition: none;
  }

  .grid-item.clickable:hover {
    transform: none;
  }
}

/* Soporte para pantallas pequeñas */
@media (max-width: 640px) {
  .grid {
    grid-template-columns: repeat(1, 1fr) !important;
  }
}
</style>

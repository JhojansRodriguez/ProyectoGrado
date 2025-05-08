<!-- Componente de lista -->
<template>
  <div 
    :class="[
      'list-container',
      {
        'bordered': bordered,
        'hoverable': hoverable,
        'loading': loading
      }
    ]"
  >
    <!-- Overlay de carga -->
    <div v-if="loading" class="loading-overlay">
      <LoadingSpinner />
    </div>

    <!-- Lista -->
    <ul 
      class="list"
      :class="size"
      role="list"
    >
      <!-- Items -->
      <TransitionGroup name="list">
        <li
          v-for="(item, index) in items"
          :key="getItemKey(item, index)"
          :class="[
            'list-item',
            {
              'clickable': isClickable(item),
              'selected': isSelected(item),
              'disabled': item.disabled
            }
          ]"
          @click="handleItemClick(item)"
        >
          <!-- Checkbox de selección -->
          <BaseCheckbox
            v-if="selectable"
            :id="`list-item-${index}`"
            v-model="selectedItems"
            :value="item"
            :disabled="item.disabled"
            class="item-checkbox"
          />

          <!-- Avatar o icono -->
          <div v-if="hasLeadingElement(item)" class="item-leading">
            <BaseAvatar
              v-if="item.avatar"
              v-bind="typeof item.avatar === 'string' ? { src: item.avatar } : item.avatar"
              :size="size"
            />
            <i v-else-if="item.icon" :class="item.icon"></i>
          </div>

          <!-- Contenido principal -->
          <div class="item-content">
            <slot 
              name="item" 
              :item="item"
              :index="index"
            >
              <div class="item-main">
                <div class="item-title">{{ item.title || item.label }}</div>
                <div v-if="item.description" class="item-description">
                  {{ item.description }}
                </div>
              </div>
              <div v-if="item.metadata" class="item-metadata">
                {{ item.metadata }}
              </div>
            </slot>
          </div>

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

          <!-- Badge -->
          <BaseBadge
            v-if="item.badge"
            v-bind="typeof item.badge === 'object' ? item.badge : { content: item.badge }"
            size="sm"
          />
        </li>
      </TransitionGroup>
    </ul>

    <!-- Estado vacío -->
    <slot 
      v-if="!loading && items.length === 0" 
      name="empty"
    >
      <BaseEmptyState
        title="No hay elementos"
        description="No se encontraron elementos para mostrar."
        icon="fas fa-list"
      />
    </slot>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseCheckbox from './BaseCheckbox.vue';
import BaseAvatar from './BaseAvatar.vue';
import BaseBadge from './BaseBadge.vue';
import BaseEmptyState from './BaseEmptyState.vue';
import LoadingSpinner from './LoadingSpinner.vue';

const props = defineProps({
  // Items de la lista
  items: {
    type: Array,
    required: true
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
  // Si tiene bordes
  bordered: {
    type: Boolean,
    default: false
  },
  // Si tiene efecto hover
  hoverable: {
    type: Boolean,
    default: true
  },
  // Tamaño (sm, md, lg)
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  // Si está en estado de carga
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'select', 'action', 'click']);

// Estado
const selectedItems = ref(props.modelValue);

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

function hasLeadingElement(item) {
  return item.avatar || item.icon;
}

function hasActions(item) {
  return item.actions || props.$slots.actions;
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
.list-container {
  position: relative;
  width: 100%;
}

/* Lista */
.list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* Items */
.list-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  transition: all 0.3s ease;
}

.list-item + .list-item {
  border-top: 1px solid var(--secondary-color);
}

/* Tamaños */
.list.sm .list-item {
  padding: 0.75rem;
  font-size: 0.875rem;
}

.list.lg .list-item {
  padding: 1.25rem;
  font-size: 1.1rem;
}

/* Variante con bordes */
.bordered .list {
  border: 1px solid var(--secondary-color);
  border-radius: var(--border-radius-lg);
}

/* Estados */
.list-item.clickable {
  cursor: pointer;
}

.list-item.clickable:hover {
  background: var(--secondary-color);
}

.list-item.selected {
  background: var(--primary-color);
  color: white;
}

.list-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Checkbox */
.item-checkbox {
  flex-shrink: 0;
}

/* Contenido */
.item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.item-main {
  min-width: 0;
}

.item-title {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-description {
  color: var(--text-light);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.selected .item-description {
  color: rgba(255, 255, 255, 0.8);
}

.item-metadata {
  color: var(--text-light);
  font-size: 0.875rem;
  white-space: nowrap;
}

.selected .item-metadata {
  color: rgba(255, 255, 255, 0.8);
}

/* Acciones */
.item-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.item-action {
  padding: 0.5rem;
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  transition: color 0.3s ease;
  border-radius: var(--border-radius-sm);
}

.item-action:hover {
  color: var(--primary-color);
  background: var(--secondary-color);
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
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-active {
  position: absolute;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .list-item {
    background: #2d3748;
  }

  .list-item + .list-item {
    border-color: #4a5568;
  }

  .bordered .list {
    border-color: #4a5568;
  }

  .list-item.clickable:hover {
    background: #4a5568;
  }

  .item-description,
  .item-metadata {
    color: #A0AEC0;
  }

  .item-action {
    color: #A0AEC0;
  }

  .item-action:hover {
    color: var(--primary-light);
    background: #4a5568;
  }

  .loading-overlay {
    background: rgba(45, 55, 72, 0.8);
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .list-item,
  .item-action,
  .list-move,
  .list-enter-active,
  .list-leave-active {
    transition: none;
  }
}
</style>

<!-- Componente de acordeón -->
<template>
  <div 
    :class="[
      'accordion',
      {
        'bordered': bordered,
        'spaced': spaced
      }
    ]"
  >
    <!-- Items -->
    <div
      v-for="(item, index) in items"
      :key="item.key || index"
      :class="[
        'accordion-item',
        {
          'expanded': isItemExpanded(item),
          'disabled': item.disabled
        }
      ]"
    >
      <!-- Header -->
      <button
        class="accordion-header"
        :aria-expanded="isItemExpanded(item)"
        :aria-controls="`accordion-content-${item.key || index}`"
        :disabled="item.disabled"
        @click="toggleItem(item)"
      >
        <!-- Icono -->
        <i v-if="item.icon" :class="['header-icon', item.icon]"></i>

        <!-- Título -->
        <div class="header-content">
          <h3 class="header-title">{{ item.title }}</h3>
          <p v-if="item.description" class="header-description">
            {{ item.description }}
          </p>
        </div>

        <!-- Badge -->
        <BaseBadge
          v-if="item.badge"
          v-bind="typeof item.badge === 'object' ? item.badge : { content: item.badge }"
          size="sm"
        />

        <!-- Indicador -->
        <i 
          :class="[
            'indicator',
            isItemExpanded(item) ? 'fas fa-chevron-up' : 'fas fa-chevron-down'
          ]"
        ></i>
      </button>

      <!-- Contenido -->
      <Transition
        name="accordion"
        @enter="startTransition"
        @leave="startTransition"
      >
        <div
          v-if="isItemExpanded(item)"
          :id="`accordion-content-${item.key || index}`"
          class="accordion-content"
          role="region"
          :aria-labelledby="`accordion-header-${item.key || index}`"
        >
          <div class="content-wrapper">
            <slot :name="item.key || index" :item="item">
              {{ item.content }}
            </slot>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseBadge from './BaseBadge.vue';

const props = defineProps({
  // Items del acordeón
  items: {
    type: Array,
    required: true,
    validator: (items) => {
      return items.every(item => item.title);
    }
  },
  // Si permite múltiples items expandidos
  multiple: {
    type: Boolean,
    default: false
  },
  // Si tiene bordes
  bordered: {
    type: Boolean,
    default: true
  },
  // Si tiene espacio entre items
  spaced: {
    type: Boolean,
    default: false
  },
  // Item(s) expandido(s) inicialmente
  modelValue: {
    type: [Array, String, Number],
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

// Estado
const expandedItems = ref(
  Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]
);

// Métodos
function isItemExpanded(item) {
  const itemKey = item.key || item;
  return expandedItems.value.includes(itemKey);
}

function toggleItem(item) {
  if (item.disabled) return;

  const itemKey = item.key || item;
  
  if (props.multiple) {
    const index = expandedItems.value.indexOf(itemKey);
    if (index === -1) {
      expandedItems.value.push(itemKey);
    } else {
      expandedItems.value.splice(index, 1);
    }
  } else {
    expandedItems.value = expandedItems.value[0] === itemKey ? [] : [itemKey];
  }

  emit('update:modelValue', props.multiple ? expandedItems.value : expandedItems.value[0]);
  emit('change', {
    item,
    expanded: isItemExpanded(item),
    expandedItems: [...expandedItems.value]
  });
}

function startTransition(el) {
  el.style.height = el.scrollHeight + 'px';
}

// Observadores
watch(() => props.modelValue, (newValue) => {
  expandedItems.value = Array.isArray(newValue) ? newValue : [newValue];
});
</script>

<style scoped>
.accordion {
  width: 100%;
}

/* Item */
.accordion-item {
  background: white;
  transition: all 0.3s ease;
}

.accordion-item + .accordion-item {
  border-top: 1px solid var(--secondary-color);
}

/* Variante con bordes */
.accordion.bordered .accordion-item {
  border: 1px solid var(--secondary-color);
  border-radius: var(--border-radius-md);
}

.accordion.bordered .accordion-item + .accordion-item {
  border-top: 1px solid var(--secondary-color);
}

/* Variante con espacio */
.accordion.spaced .accordion-item {
  margin-bottom: 0.5rem;
}

.accordion.spaced .accordion-item + .accordion-item {
  border-top: none;
}

/* Header */
.accordion-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: all 0.3s ease;
}

.accordion-header:hover:not(:disabled) {
  background: var(--secondary-color);
}

.accordion-item.expanded .accordion-header {
  background: var(--secondary-color);
}

.accordion-header:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Icono del header */
.header-icon {
  color: var(--primary-color);
  font-size: 1.25rem;
  flex-shrink: 0;
}

/* Contenido del header */
.header-content {
  flex: 1;
  min-width: 0;
}

.header-title {
  margin: 0;
  font-size: 1rem;
  color: var(--text-color);
}

.header-description {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: var(--text-light);
}

/* Indicador */
.indicator {
  color: var(--text-light);
  font-size: 0.875rem;
  transition: transform 0.3s ease;
}

/* Contenido */
.accordion-content {
  overflow: hidden;
  height: 0;
  transition: height 0.3s ease;
}

.content-wrapper {
  padding: 1rem;
  color: var(--text-color);
}

/* Animaciones */
.accordion-enter-active,
.accordion-leave-active {
  transition: height 0.3s ease;
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  height: 0 !important;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .accordion-item {
    background: #2d3748;
  }

  .accordion-item + .accordion-item {
    border-color: #4a5568;
  }

  .accordion.bordered .accordion-item {
    border-color: #4a5568;
  }

  .accordion-header:hover:not(:disabled) {
    background: #4a5568;
  }

  .accordion-item.expanded .accordion-header {
    background: #4a5568;
  }

  .header-title {
    color: #E2E8F0;
  }

  .header-description {
    color: #A0AEC0;
  }

  .indicator {
    color: #A0AEC0;
  }

  .content-wrapper {
    color: #E2E8F0;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .accordion-item,
  .accordion-header,
  .indicator,
  .accordion-content,
  .accordion-enter-active,
  .accordion-leave-active {
    transition: none;
  }
}

/* Soporte para navegación con teclado */
.accordion-header:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: -2px;
}

@media (prefers-color-scheme: dark) {
  .accordion-header:focus {
    outline-color: var(--primary-light);
  }
}
</style>

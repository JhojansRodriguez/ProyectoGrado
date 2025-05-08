<!-- Componente de breadcrumb -->
<template>
  <nav 
    class="breadcrumb"
    :aria-label="ariaLabel"
  >
    <ol class="breadcrumb-list">
      <!-- Items -->
      <li 
        v-for="(item, index) in items"
        :key="index"
        :class="[
          'breadcrumb-item',
          {
            'active': isLastItem(index),
            'clickable': !isLastItem(index) && (item.to || item.onClick)
          }
        ]"
      >
        <!-- Separador -->
        <span 
          v-if="index > 0" 
          class="separator"
          aria-hidden="true"
        >
          <slot name="separator">
            <i class="fas fa-chevron-right"></i>
          </slot>
        </span>

        <!-- Contenido del item -->
        <component
          :is="isLastItem(index) ? 'span' : item.to ? 'router-link' : 'button'"
          :to="item.to"
          :class="{ 'with-icon': item.icon }"
          @click="handleClick(item)"
        >
          <!-- Icono -->
          <i v-if="item.icon" :class="item.icon"></i>

          <!-- Texto -->
          <span class="item-text">
            <slot :name="`item-${index}`" :item="item">
              {{ item.label }}
            </slot>
          </span>
        </component>
      </li>
    </ol>
  </nav>
</template>

<script setup>
const props = defineProps({
  // Items del breadcrumb
  items: {
    type: Array,
    required: true,
    validator: (items) => {
      return items.every(item => item.label);
    }
  },
  // Etiqueta ARIA
  ariaLabel: {
    type: String,
    default: 'Navegación de breadcrumb'
  }
});

const emit = defineEmits(['click']);

// Métodos
const isLastItem = (index) => {
  return index === props.items.length - 1;
};

const handleClick = (item) => {
  if (item.onClick) {
    item.onClick(item);
  }
  emit('click', item);
};
</script>

<style scoped>
.breadcrumb {
  padding: 0.75rem 0;
}

.breadcrumb-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 0;
  margin: 0;
  list-style: none;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  color: var(--text-light);
  font-size: 0.875rem;
}

/* Separador */
.separator {
  margin: 0 0.5rem;
  color: var(--text-light);
  font-size: 0.75rem;
}

/* Enlaces y botones */
.breadcrumb-item a,
.breadcrumb-item button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  text-decoration: none;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  transition: color 0.3s ease;
}

.breadcrumb-item.clickable:hover a,
.breadcrumb-item.clickable:hover button {
  color: var(--primary-dark);
}

/* Item activo */
.breadcrumb-item.active {
  color: var(--text-color);
  font-weight: 500;
}

/* Con icono */
.with-icon {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

/* Truncamiento en pantallas pequeñas */
@media (max-width: 768px) {
  .item-text {
    max-width: 120px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Mostrar completo el último item */
  .breadcrumb-item.active .item-text {
    max-width: none;
  }
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .breadcrumb-item {
    color: #A0AEC0;
  }

  .separator {
    color: #A0AEC0;
  }

  .breadcrumb-item a,
  .breadcrumb-item button {
    color: var(--primary-light);
  }

  .breadcrumb-item.clickable:hover a,
  .breadcrumb-item.clickable:hover button {
    color: white;
  }

  .breadcrumb-item.active {
    color: #E2E8F0;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .breadcrumb-item a,
  .breadcrumb-item button {
    transition: none;
  }
}

/* Soporte para navegación con teclado */
.breadcrumb-item a:focus,
.breadcrumb-item button:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
  border-radius: 2px;
}

@media (prefers-color-scheme: dark) {
  .breadcrumb-item a:focus,
  .breadcrumb-item button:focus {
    outline-color: var(--primary-light);
  }
}
</style>

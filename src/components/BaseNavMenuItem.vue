<!-- Componente de ítem de menú de navegación -->
<template>
  <component
    :is="isLink ? 'router-link' : 'button'"
    :to="isLink ? to : undefined"
    :class="[
      'nav-menu-item',
      {
        'active': active,
        'disabled': disabled,
        'collapsed': collapsed,
        'has-badge': !!badge,
        'has-submenu': hasSubmenu
      }
    ]"
    :disabled="disabled"
    @click="handleClick"
  >
    <!-- Icono -->
    <div class="item-icon" :title="collapsed ? label : undefined">
      <i v-if="icon" :class="icon"></i>
      <slot name="icon"></slot>
    </div>

    <!-- Contenido -->
    <div v-if="!collapsed" class="item-content">
      <span class="item-label">{{ label }}</span>
      <span v-if="description" class="item-description">
        {{ description }}
      </span>
    </div>

    <!-- Badge -->
    <BaseBadge
      v-if="badge"
      v-bind="typeof badge === 'object' ? badge : { content: badge }"
      size="sm"
    />

    <!-- Indicador de submenú -->
    <i 
      v-if="hasSubmenu" 
      :class="[
        'submenu-indicator',
        expanded ? 'fas fa-chevron-down' : 'fas fa-chevron-right'
      ]"
    ></i>
  </component>

  <!-- Submenú -->
  <Transition name="submenu">
    <div 
      v-if="hasSubmenu && expanded"
      class="submenu"
      :class="{ 'collapsed': collapsed }"
    >
      <BaseNavMenuItem
        v-for="(item, index) in submenu"
        :key="index"
        v-bind="item"
        :collapsed="collapsed"
        :level="level + 1"
      />
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseBadge from './BaseBadge.vue';

const props = defineProps({
  // Etiqueta del ítem
  label: {
    type: String,
    required: true
  },
  // Descripción
  description: {
    type: String,
    default: ''
  },
  // Icono
  icon: {
    type: String,
    default: ''
  },
  // Ruta (para router-link)
  to: {
    type: String,
    default: ''
  },
  // Si está activo
  active: {
    type: Boolean,
    default: false
  },
  // Si está deshabilitado
  disabled: {
    type: Boolean,
    default: false
  },
  // Si está colapsado
  collapsed: {
    type: Boolean,
    default: false
  },
  // Badge
  badge: {
    type: [String, Number, Object],
    default: null
  },
  // Submenú
  submenu: {
    type: Array,
    default: () => []
  },
  // Nivel de anidación
  level: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['click']);

// Estado
const expanded = ref(false);

// Computed
const isLink = computed(() => !!props.to);

const hasSubmenu = computed(() => {
  return props.submenu && props.submenu.length > 0;
});

// Métodos
const handleClick = (event) => {
  if (props.disabled) return;

  if (hasSubmenu.value) {
    expanded.value = !expanded.value;
  }

  emit('click', event);
};
</script>

<style scoped>
.nav-menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: var(--text-color);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 1rem;
  position: relative;
}

/* Estados */
.nav-menu-item:hover:not(.disabled) {
  background: var(--secondary-color);
}

.nav-menu-item.active {
  background: var(--primary-color);
  color: white;
}

.nav-menu-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Icono */
.item-icon {
  flex-shrink: 0;
  width: 1.5rem;
  text-align: center;
}

/* Contenido */
.item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.item-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-description {
  font-size: 0.75rem;
  color: var(--text-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.active .item-description {
  color: rgba(255, 255, 255, 0.8);
}

/* Badge */
.has-badge {
  padding-right: 2.5rem;
}

/* Submenú */
.submenu-indicator {
  margin-left: auto;
  font-size: 0.75rem;
  transition: transform 0.3s ease;
}

.submenu {
  padding-left: 1rem;
}

.submenu.collapsed {
  padding-left: 0;
}

/* Estado colapsado */
.nav-menu-item.collapsed {
  justify-content: center;
  padding: 0.75rem 0;
}

.nav-menu-item.collapsed .item-icon {
  margin: 0;
}

/* Niveles de anidación */
.nav-menu-item[level="1"] {
  padding-left: 2rem;
}

.nav-menu-item[level="2"] {
  padding-left: 3rem;
}

/* Animaciones */
.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.submenu-enter-from,
.submenu-leave-to {
  opacity: 0;
  max-height: 0;
}

.submenu-enter-to,
.submenu-leave-from {
  opacity: 1;
  max-height: 1000px;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .nav-menu-item {
    color: #E2E8F0;
  }

  .nav-menu-item:hover:not(.disabled) {
    background: #4a5568;
  }

  .item-description {
    color: #A0AEC0;
  }

  .nav-menu-item.active {
    background: var(--primary-light);
    color: #2d3748;
  }

  .active .item-description {
    color: rgba(45, 55, 72, 0.8);
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .nav-menu-item,
  .submenu-indicator,
  .submenu-enter-active,
  .submenu-leave-active {
    transition: none;
  }
}
</style>

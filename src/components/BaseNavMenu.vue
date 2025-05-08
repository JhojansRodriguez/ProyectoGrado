<!-- Componente de menú de navegación -->
<template>
  <nav 
    :class="[
      'nav-menu',
      {
        'collapsed': collapsed,
        'mobile': mobile
      }
    ]"
  >
    <!-- Header -->
    <div v-if="$slots.header" class="nav-header">
      <slot name="header"></slot>
    </div>

    <!-- Items -->
    <div class="nav-items">
      <template v-for="(item, index) in items" :key="index">
        <!-- Grupo -->
        <div v-if="item.type === 'group'" class="nav-group">
          <div 
            v-if="item.label" 
            class="nav-group-label"
            :title="collapsed ? item.label : ''"
          >
            {{ collapsed ? '' : item.label }}
          </div>
          
          <template v-for="(subItem, subIndex) in item.items" :key="subIndex">
            <BaseNavMenuItem
              v-bind="subItem"
              :active="isItemActive(subItem)"
              :collapsed="collapsed"
              @click="handleItemClick(subItem)"
            />
          </template>
        </div>

        <!-- Item individual -->
        <BaseNavMenuItem
          v-else
          v-bind="item"
          :active="isItemActive(item)"
          :collapsed="collapsed"
          @click="handleItemClick(item)"
        />
      </template>
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" class="nav-footer">
      <slot name="footer"></slot>
    </div>

    <!-- Botón de colapsar -->
    <button 
      v-if="collapsible && !mobile"
      class="collapse-button"
      @click="toggleCollapse"
      :title="collapsed ? 'Expandir menú' : 'Colapsar menú'"
    >
      <i :class="collapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
    </button>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseNavMenuItem from './BaseNavMenuItem.vue';

const props = defineProps({
  // Items del menú
  items: {
    type: Array,
    required: true,
    validator: (items) => {
      return items.every(item => {
        if (item.type === 'group') {
          return item.items && Array.isArray(item.items);
        }
        return item.label && (item.to || item.onClick);
      });
    }
  },
  // Si es colapsable
  collapsible: {
    type: Boolean,
    default: true
  },
  // Si está colapsado inicialmente
  initialCollapsed: {
    type: Boolean,
    default: false
  },
  // Si está en modo móvil
  mobile: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['collapse', 'select']);

// Router
const route = useRoute();
const router = useRouter();

// Estado
const collapsed = ref(props.initialCollapsed);

// Métodos
const toggleCollapse = () => {
  collapsed.value = !collapsed.value;
  emit('collapse', collapsed.value);
};

const isItemActive = (item) => {
  if (!item.to) return false;
  
  if (typeof item.exact === 'undefined') {
    // Por defecto, usar coincidencia exacta para rutas cortas
    // y coincidencia parcial para rutas largas
    const exact = item.to.split('/').length <= 2;
    return exact ? route.path === item.to : route.path.startsWith(item.to);
  }
  
  return item.exact ? route.path === item.to : route.path.startsWith(item.to);
};

const handleItemClick = async (item) => {
  if (item.onClick) {
    await item.onClick(item);
  } else if (item.to) {
    await router.push(item.to);
  }
  
  emit('select', item);
};
</script>

<style scoped>
.nav-menu {
  display: flex;
  flex-direction: column;
  background: white;
  height: 100%;
  width: 260px;
  transition: width 0.3s ease;
  position: relative;
  border-right: 1px solid var(--secondary-color);
}

/* Estado colapsado */
.nav-menu.collapsed {
  width: 64px;
}

/* Modo móvil */
.nav-menu.mobile {
  width: 100%;
  border-right: none;
  border-bottom: 1px solid var(--secondary-color);
}

/* Header */
.nav-header {
  padding: 1rem;
  border-bottom: 1px solid var(--secondary-color);
}

.collapsed .nav-header {
  padding: 1rem 0;
  text-align: center;
}

/* Items */
.nav-items {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

/* Grupos */
.nav-group {
  margin-bottom: 1.5rem;
}

.nav-group:last-child {
  margin-bottom: 0;
}

.nav-group-label {
  padding: 0.5rem 1rem;
  color: var(--text-light);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.collapsed .nav-group-label {
  text-align: center;
}

/* Footer */
.nav-footer {
  padding: 1rem;
  border-top: 1px solid var(--secondary-color);
}

.collapsed .nav-footer {
  padding: 1rem 0;
  text-align: center;
}

/* Botón de colapsar */
.collapse-button {
  position: absolute;
  top: 50%;
  right: -12px;
  width: 24px;
  height: 24px;
  background: white;
  border: 1px solid var(--secondary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transform: translateY(-50%);
  transition: all 0.3s ease;
  z-index: 1;
}

.collapse-button:hover {
  background: var(--secondary-color);
}

.collapse-button i {
  font-size: 0.75rem;
  color: var(--text-color);
}

/* Scrollbar */
.nav-items::-webkit-scrollbar {
  width: 4px;
}

.nav-items::-webkit-scrollbar-track {
  background: transparent;
}

.nav-items::-webkit-scrollbar-thumb {
  background: var(--secondary-color);
  border-radius: 4px;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .nav-menu {
    background: #2d3748;
    border-color: #4a5568;
  }

  .nav-header,
  .nav-footer {
    border-color: #4a5568;
  }

  .nav-group-label {
    color: #A0AEC0;
  }

  .collapse-button {
    background: #2d3748;
    border-color: #4a5568;
  }

  .collapse-button:hover {
    background: #4a5568;
  }

  .collapse-button i {
    color: #E2E8F0;
  }

  .nav-items::-webkit-scrollbar-thumb {
    background: #4a5568;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .nav-menu,
  .collapse-button {
    transition: none;
  }
}
</style>

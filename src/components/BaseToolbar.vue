<!-- Componente de barra de herramientas -->
<template>
  <div 
    :class="[
      'toolbar',
      {
        'with-selection': hasSelection,
        'with-actions': hasActions,
        'compact': compact
      }
    ]"
  >
    <!-- Acciones de selección -->
    <div v-if="hasSelection" class="selection-actions">
      <span class="selection-count">
        {{ selectedCount }} {{ selectedLabel }}
      </span>
      
      <div class="selection-buttons">
        <slot name="selection-actions"></slot>
      </div>

      <button 
        class="clear-selection"
        @click="$emit('clear-selection')"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Contenido principal -->
    <div class="toolbar-content">
      <!-- Búsqueda -->
      <div class="search-section">
        <BaseSearchBar
          v-model="searchQuery"
          :placeholder="searchPlaceholder"
          :loading="searching"
          :suggestions="suggestions"
          @search="handleSearch"
          @select="handleSuggestionSelect"
        />
      </div>

      <!-- Filtros -->
      <div class="filters-section">
        <BaseFilters
          v-model="filters"
          :filters="filterConfig"
          @change="handleFilterChange"
          @apply="handleFiltersApply"
        />

        <!-- Acciones adicionales -->
        <div v-if="hasActions" class="toolbar-actions">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>

    <!-- Vista activa (grid/lista) -->
    <div v-if="showViewToggle" class="view-toggle">
      <button
        :class="['view-button', { active: view === 'grid' }]"
        @click="toggleView('grid')"
        title="Vista de cuadrícula"
      >
        <i class="fas fa-th-large"></i>
      </button>
      <button
        :class="['view-button', { active: view === 'list' }]"
        @click="toggleView('list')"
        title="Vista de lista"
      >
        <i class="fas fa-list"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseSearchBar from './BaseSearchBar.vue';
import BaseFilters from './BaseFilters.vue';

const props = defineProps({
  // Valor de búsqueda
  modelValue: {
    type: String,
    default: ''
  },
  // Placeholder de búsqueda
  searchPlaceholder: {
    type: String,
    default: 'Buscar...'
  },
  // Si está buscando
  searching: {
    type: Boolean,
    default: false
  },
  // Sugerencias de búsqueda
  suggestions: {
    type: Array,
    default: () => []
  },
  // Configuración de filtros
  filterConfig: {
    type: Array,
    default: () => []
  },
  // Número de elementos seleccionados
  selectedCount: {
    type: Number,
    default: 0
  },
  // Etiqueta para elementos seleccionados
  selectedLabel: {
    type: String,
    default: 'elementos seleccionados'
  },
  // Si muestra el toggle de vista
  showViewToggle: {
    type: Boolean,
    default: false
  },
  // Vista actual
  view: {
    type: String,
    default: 'grid',
    validator: (value) => ['grid', 'list'].includes(value)
  },
  // Si es compacto
  compact: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'update:modelValue',
  'search',
  'suggestion-select',
  'filter-change',
  'filters-apply',
  'clear-selection',
  'update:view'
]);

// Estado
const searchQuery = ref(props.modelValue);
const filters = ref({});

// Computed
const hasSelection = computed(() => props.selectedCount > 0);
const hasActions = computed(() => !!props.$slots.actions);

// Métodos
const handleSearch = (query) => {
  emit('update:modelValue', query);
  emit('search', query);
};

const handleSuggestionSelect = (suggestion) => {
  emit('suggestion-select', suggestion);
};

const handleFilterChange = (filter) => {
  emit('filter-change', filter);
};

const handleFiltersApply = (appliedFilters) => {
  emit('filters-apply', appliedFilters);
};

const toggleView = (newView) => {
  emit('update:view', newView);
};
</script>

<style scoped>
.toolbar {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 1rem;
  margin-bottom: 1.5rem;
}

/* Contenido principal */
.toolbar-content {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Sección de búsqueda */
.search-section {
  flex: 1;
  min-width: 200px;
}

/* Sección de filtros */
.filters-section {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Acciones de selección */
.selection-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border-radius: var(--border-radius-md);
  margin-bottom: 1rem;
}

.selection-count {
  font-weight: 500;
}

.selection-buttons {
  display: flex;
  gap: 0.5rem;
}

.clear-selection {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.25rem;
  opacity: 0.8;
  transition: opacity 0.3s;
}

.clear-selection:hover {
  opacity: 1;
}

/* Toggle de vista */
.view-toggle {
  display: flex;
  gap: 0.5rem;
}

.view-button {
  background: none;
  border: 2px solid var(--secondary-color);
  color: #666;
  padding: 0.5rem;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.3s;
}

.view-button:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.view-button.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

/* Variante compacta */
.toolbar.compact {
  padding: 0.75rem;
}

.toolbar.compact .toolbar-content {
  gap: 0.75rem;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .toolbar {
    background: #2d3748;
  }

  .view-button {
    border-color: #4a5568;
    color: #A0AEC0;
  }

  .view-button:hover {
    border-color: var(--primary-light);
    color: var(--primary-light);
  }

  .view-button.active {
    background: var(--primary-light);
    border-color: var(--primary-light);
    color: #2d3748;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .clear-selection,
  .view-button {
    transition: none;
  }
}

/* Soporte para pantallas pequeñas */
@media (max-width: 768px) {
  .toolbar-content {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-section {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .selection-actions {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
  }

  .selection-buttons {
    width: 100%;
    justify-content: center;
  }
}
</style>

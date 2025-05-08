<!-- Componente de filtros -->
<template>
  <div class="filters-container">
    <!-- Botón de filtros -->
    <BaseButton
      :class="['filters-toggle', { 'active': isOpen }]"
      variant="secondary"
      @click="toggleFilters"
    >
      <i class="fas fa-filter"></i>
      Filtros
      <span v-if="activeFiltersCount" class="filters-count">
        {{ activeFiltersCount }}
      </span>
    </BaseButton>

    <!-- Panel de filtros -->
    <Transition name="slide">
      <div v-if="isOpen" class="filters-panel">
        <div class="filters-header">
          <h3>Filtros</h3>
          <div class="header-actions">
            <button 
              v-if="hasActiveFilters"
              class="clear-filters"
              @click="clearAllFilters"
            >
              Limpiar filtros
            </button>
            <button class="close-panel" @click="closePanel">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div class="filters-content">
          <div 
            v-for="filter in filters"
            :key="filter.key"
            class="filter-group"
          >
            <!-- Título del grupo -->
            <h4 class="filter-title">{{ filter.label }}</h4>

            <!-- Filtros de tipo checkbox -->
            <template v-if="filter.type === 'checkbox'">
              <BaseCheckboxGroup
                :id="`filter-${filter.key}`"
                v-model="selectedFilters[filter.key]"
                :options="filter.options"
                @change="handleFilterChange(filter.key)"
              />
            </template>

            <!-- Filtros de tipo radio -->
            <template v-else-if="filter.type === 'radio'">
              <BaseRadioGroup
                :id="`filter-${filter.key}`"
                v-model="selectedFilters[filter.key]"
                :name="`filter-${filter.key}`"
                :options="filter.options"
                @change="handleFilterChange(filter.key)"
              />
            </template>

            <!-- Filtros de tipo select -->
            <template v-else-if="filter.type === 'select'">
              <BaseSelect
                :id="`filter-${filter.key}`"
                v-model="selectedFilters[filter.key]"
                :options="filter.options"
                :placeholder="filter.placeholder || 'Seleccionar...'"
                @change="handleFilterChange(filter.key)"
              />
            </template>

            <!-- Filtros de tipo rango -->
            <template v-else-if="filter.type === 'range'">
              <div class="range-inputs">
                <BaseInput
                  :id="`filter-${filter.key}-min`"
                  v-model="selectedFilters[filter.key].min"
                  type="number"
                  :placeholder="filter.minPlaceholder || 'Mín'"
                  @change="handleFilterChange(filter.key)"
                />
                <span class="range-separator">-</span>
                <BaseInput
                  :id="`filter-${filter.key}-max`"
                  v-model="selectedFilters[filter.key].max"
                  type="number"
                  :placeholder="filter.maxPlaceholder || 'Máx'"
                  @change="handleFilterChange(filter.key)"
                />
              </div>
            </template>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="filters-actions">
          <BaseButton
            variant="secondary"
            @click="closePanel"
          >
            Cancelar
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="applyFilters"
          >
            Aplicar Filtros
          </BaseButton>
        </div>
      </div>
    </Transition>

    <!-- Overlay -->
    <Transition name="fade">
      <div 
        v-if="isOpen" 
        class="filters-overlay"
        @click="closePanel"
      ></div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseButton from './BaseButton.vue';
import BaseCheckboxGroup from './BaseCheckboxGroup.vue';
import BaseRadioGroup from './BaseRadioGroup.vue';
import BaseSelect from './BaseSelect.vue';
import BaseInput from './BaseInput.vue';

const props = defineProps({
  // Configuración de filtros
  filters: {
    type: Array,
    required: true,
    validator: (filters) => {
      return filters.every(filter => 
        filter.key && 
        filter.label && 
        filter.type && 
        ['checkbox', 'radio', 'select', 'range'].includes(filter.type)
      );
    }
  },
  // Valores iniciales
  modelValue: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue', 'change', 'apply']);

// Estado
const isOpen = ref(false);
const selectedFilters = ref({ ...props.modelValue });

// Computed
const hasActiveFilters = computed(() => {
  return Object.keys(selectedFilters.value).some(key => {
    const value = selectedFilters.value[key];
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (typeof value === 'object') {
      return value.min || value.max;
    }
    return !!value;
  });
});

const activeFiltersCount = computed(() => {
  let count = 0;
  Object.keys(selectedFilters.value).forEach(key => {
    const value = selectedFilters.value[key];
    if (Array.isArray(value)) {
      count += value.length;
    } else if (typeof value === 'object') {
      if (value.min) count++;
      if (value.max) count++;
    } else if (value) {
      count++;
    }
  });
  return count || '';
});

// Métodos
const toggleFilters = () => {
  isOpen.value = !isOpen.value;
};

const closePanel = () => {
  isOpen.value = false;
  // Restaurar selección previa si no se aplicaron los cambios
  selectedFilters.value = { ...props.modelValue };
};

const handleFilterChange = (key) => {
  emit('change', { key, value: selectedFilters.value[key] });
};

const clearAllFilters = () => {
  selectedFilters.value = {};
  emit('update:modelValue', {});
  emit('change', {});
};

const applyFilters = () => {
  emit('update:modelValue', { ...selectedFilters.value });
  emit('apply', selectedFilters.value);
  isOpen.value = false;
};
</script>

<style scoped>
.filters-container {
  position: relative;
  z-index: 100;
}

/* Botón de filtros */
.filters-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.filters-toggle.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.filters-count {
  background: var(--error-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  min-width: 1.5rem;
  text-align: center;
}

/* Panel de filtros */
.filters-panel {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  width: 300px;
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
}

.filters-header {
  padding: 1rem;
  border-bottom: 1px solid var(--secondary-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filters-header h3 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.clear-filters {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 0.9rem;
  cursor: pointer;
}

.close-panel {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.25rem;
}

/* Contenido de filtros */
.filters-content {
  padding: 1rem;
  overflow-y: auto;
  max-height: 400px;
}

.filter-group {
  margin-bottom: 1.5rem;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-title {
  margin: 0 0 0.75rem;
  color: var(--text-color);
  font-size: 0.9rem;
  font-weight: 600;
}

/* Filtros de rango */
.range-inputs {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0.5rem;
  align-items: center;
}

.range-separator {
  color: var(--text-color);
  text-align: center;
}

/* Acciones */
.filters-actions {
  padding: 1rem;
  border-top: 1px solid var(--secondary-color);
  display: flex;
  gap: 1rem;
}

/* Overlay */
.filters-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: -1;
}

/* Animaciones */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .filters-panel {
    background: #2d3748;
  }

  .filters-header {
    border-bottom-color: #4a5568;
  }

  .filters-header h3 {
    color: #E2E8F0;
  }

  .filter-title {
    color: #E2E8F0;
  }

  .clear-filters {
    color: var(--primary-light);
  }

  .close-panel {
    color: #A0AEC0;
  }

  .filters-actions {
    border-top-color: #4a5568;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .slide-enter-active,
  .slide-leave-active,
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}

/* Soporte para pantallas pequeñas */
@media (max-width: 640px) {
  .filters-panel {
    position: fixed;
    top: auto;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    margin: 0;
    border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
    max-height: 80vh;
  }

  .filters-content {
    max-height: calc(80vh - 130px);
  }
}
</style>

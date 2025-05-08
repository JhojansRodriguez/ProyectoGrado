<!-- Componente de tabla base -->
<template>
  <div 
    :class="[
      'base-table-wrapper',
      {
        'loading': loading,
        'hoverable': hoverable,
        'bordered': bordered,
        'striped': striped,
        'compact': compact
      }
    ]"
  >
    <!-- Overlay de carga -->
    <div v-if="loading" class="loading-overlay">
      <LoadingSpinner />
    </div>

    <!-- Tabla -->
    <table class="base-table">
      <!-- Encabezado -->
      <thead>
        <tr>
          <!-- Checkbox de selección múltiple -->
          <th v-if="selectable" class="selection-cell">
            <BaseCheckbox
              :id="`${id}-select-all`"
              :model-value="allSelected"
              @update:model-value="toggleSelectAll"
              :indeterminate="someSelected"
            />
          </th>

          <!-- Columnas -->
          <th 
            v-for="column in columns"
            :key="column.key"
            :class="[
              column.class,
              { 
                'sortable': column.sortable,
                'sorted': sortKey === column.key,
                'sorted-desc': sortKey === column.key && sortOrder === 'desc'
              }
            ]"
            @click="handleSort(column)"
          >
            <div class="column-header">
              {{ column.label }}
              <i 
                v-if="column.sortable" 
                :class="getSortIcon(column.key)"
                class="sort-icon"
              ></i>
            </div>
          </th>

          <!-- Columna de acciones -->
          <th v-if="hasActions" class="actions-cell">
            Acciones
          </th>
        </tr>
      </thead>

      <!-- Cuerpo -->
      <tbody>
        <template v-if="data.length">
          <tr 
            v-for="(item, index) in data"
            :key="getItemKey(item, index)"
            @click="handleRowClick(item)"
          >
            <!-- Checkbox de selección -->
            <td v-if="selectable" class="selection-cell">
              <BaseCheckbox
                :id="`${id}-select-${index}`"
                v-model="selectedItems"
                :value="item"
              />
            </td>

            <!-- Celdas de datos -->
            <td 
              v-for="column in columns"
              :key="column.key"
              :class="column.class"
            >
              <slot 
                :name="`cell-${column.key}`" 
                :item="item" 
                :value="item[column.key]"
              >
                {{ formatCellValue(item[column.key], column) }}
              </slot>
            </td>

            <!-- Celda de acciones -->
            <td v-if="hasActions" class="actions-cell">
              <slot name="actions" :item="item"></slot>
            </td>
          </tr>
        </template>

        <!-- Estado vacío -->
        <tr v-else>
          <td :colspan="totalColumns" class="empty-state">
            <slot name="empty">
              <div class="empty-content">
                <i class="fas fa-inbox"></i>
                <p>No hay datos disponibles</p>
              </div>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Paginación -->
    <div v-if="pagination" class="table-footer">
      <BasePagination v-bind="pagination" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseCheckbox from './BaseCheckbox.vue';
import BasePagination from './BasePagination.vue';
import LoadingSpinner from './LoadingSpinner.vue';

const props = defineProps({
  // ID único para la tabla
  id: {
    type: String,
    required: true
  },
  // Datos de la tabla
  data: {
    type: Array,
    required: true
  },
  // Configuración de columnas
  columns: {
    type: Array,
    required: true,
    validator: (columns) => {
      return columns.every(column => 
        column.key && 
        (column.label || column.key)
      );
    }
  },
  // Si está en estado de carga
  loading: {
    type: Boolean,
    default: false
  },
  // Si las filas son seleccionables
  selectable: {
    type: Boolean,
    default: false
  },
  // Si las filas tienen efecto hover
  hoverable: {
    type: Boolean,
    default: true
  },
  // Si la tabla tiene bordes
  bordered: {
    type: Boolean,
    default: false
  },
  // Si la tabla es rayada
  striped: {
    type: Boolean,
    default: true
  },
  // Si la tabla es compacta
  compact: {
    type: Boolean,
    default: false
  },
  // Configuración de paginación
  pagination: {
    type: Object,
    default: null
  },
  // Clave para ordenamiento actual
  sortKey: {
    type: String,
    default: ''
  },
  // Orden actual (asc/desc)
  sortOrder: {
    type: String,
    default: 'asc',
    validator: (value) => ['asc', 'desc'].includes(value)
  }
});

const emit = defineEmits([
  'update:selectedItems',
  'row-click',
  'sort',
  'update:sortKey',
  'update:sortOrder'
]);

// Estado
const selectedItems = ref([]);

// Computed
const hasActions = computed(() => {
  return !!props.$slots.actions;
});

const totalColumns = computed(() => {
  let count = props.columns.length;
  if (props.selectable) count++;
  if (hasActions.value) count++;
  return count;
});

const allSelected = computed(() => {
  return props.data.length > 0 && selectedItems.value.length === props.data.length;
});

const someSelected = computed(() => {
  return selectedItems.value.length > 0 && !allSelected.value;
});

// Métodos
const getItemKey = (item, index) => {
  return item.id || item.key || index;
};

const toggleSelectAll = (checked) => {
  selectedItems.value = checked ? [...props.data] : [];
  emit('update:selectedItems', selectedItems.value);
};

const handleRowClick = (item) => {
  emit('row-click', item);
};

const handleSort = (column) => {
  if (!column.sortable) return;

  let newOrder = props.sortOrder;
  if (props.sortKey === column.key) {
    newOrder = props.sortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    newOrder = 'asc';
  }

  emit('update:sortKey', column.key);
  emit('update:sortOrder', newOrder);
  emit('sort', { key: column.key, order: newOrder });
};

const getSortIcon = (columnKey) => {
  if (props.sortKey !== columnKey) {
    return 'fas fa-sort';
  }
  return props.sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
};

const formatCellValue = (value, column) => {
  if (value === undefined || value === null) return '';
  
  if (column.format) {
    return column.format(value);
  }

  return value;
};
</script>

<style scoped>
.base-table-wrapper {
  position: relative;
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.base-table {
  width: 100%;
  border-collapse: collapse;
}

/* Encabezado */
thead {
  background: #f8f9fa;
  border-bottom: 2px solid var(--secondary-color);
}

th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-color);
  white-space: nowrap;
}

/* Columnas ordenables */
.sortable {
  cursor: pointer;
  user-select: none;
}

.column-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-icon {
  color: #999;
  font-size: 0.8rem;
}

.sorted .sort-icon {
  color: var(--primary-color);
}

/* Cuerpo */
td {
  padding: 1rem;
  border-bottom: 1px solid var(--secondary-color);
  color: var(--text-color);
}

/* Variantes */
.hoverable tbody tr:hover {
  background: #f8f9fa;
}

.bordered th,
.bordered td {
  border: 1px solid var(--secondary-color);
}

.striped tbody tr:nth-child(even) {
  background: #f8f9fa;
}

.compact th,
.compact td {
  padding: 0.5rem 1rem;
}

/* Celdas especiales */
.selection-cell {
  width: 40px;
  text-align: center;
}

.actions-cell {
  width: 1%;
  white-space: nowrap;
  text-align: right;
}

/* Estado vacío */
.empty-state {
  text-align: center;
  padding: 3rem !important;
}

.empty-content {
  color: #666;
}

.empty-content i {
  font-size: 2rem;
  margin-bottom: 1rem;
  opacity: 0.5;
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

/* Footer */
.table-footer {
  border-top: 1px solid var(--secondary-color);
  padding: 1rem;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .base-table-wrapper {
    background: #2d3748;
  }

  thead {
    background: #1a202c;
    border-bottom-color: #4a5568;
  }

  th {
    color: #E2E8F0;
  }

  td {
    color: #E2E8F0;
    border-bottom-color: #4a5568;
  }

  .hoverable tbody tr:hover {
    background: #1a202c;
  }

  .bordered th,
  .bordered td {
    border-color: #4a5568;
  }

  .striped tbody tr:nth-child(even) {
    background: #1a202c;
  }

  .empty-content {
    color: #A0AEC0;
  }

  .loading-overlay {
    background: rgba(45, 55, 72, 0.8);
  }

  .table-footer {
    border-top-color: #4a5568;
  }
}

/* Soporte para pantallas pequeñas */
@media (max-width: 768px) {
  .base-table-wrapper {
    overflow-x: auto;
  }

  .base-table {
    min-width: 600px;
  }
}
</style>

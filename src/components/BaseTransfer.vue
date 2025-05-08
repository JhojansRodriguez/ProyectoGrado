<!-- Componente de transferencia -->
<template>
  <div 
    :class="[
      'transfer',
      {
        'has-error': !!error,
        'has-success': success,
        'is-disabled': disabled,
        'is-readonly': readonly
      }
    ]"
  >
    <!-- Panel izquierdo -->
    <div class="transfer-panel source">
      <!-- Cabecera -->
      <div class="panel-header">
        <BaseCheckbox
          v-if="!readonly"
          v-model="sourceCheckedAll"
          :indeterminate="sourceIndeterminate"
          @change="handleSourceCheckAll"
        >
          {{ sourceTitle }}
          <span class="item-count">{{ sourceCount }}</span>
        </BaseCheckbox>
        <div v-else class="panel-title">
          {{ sourceTitle }}
          <span class="item-count">{{ sourceCount }}</span>
        </div>
      </div>

      <!-- Búsqueda -->
      <div v-if="filterable" class="panel-search">
        <BaseSearchBar
          v-model="sourceSearch"
          :placeholder="searchPlaceholder"
          size="sm"
        />
      </div>

      <!-- Lista -->
      <div class="panel-body">
        <template v-if="filteredSource.length">
          <div
            v-for="item in filteredSource"
            :key="getItemKey(item)"
            :class="[
              'transfer-item',
              { 
                'selected': sourceChecked.includes(getItemKey(item)),
                'disabled': isItemDisabled(item)
              }
            ]"
            @click="handleItemClick(item, 'source')"
          >
            <BaseCheckbox
              v-if="!readonly"
              :model-value="sourceChecked.includes(getItemKey(item))"
              :disabled="isItemDisabled(item)"
              @change="handleItemCheck(item, 'source')"
            />
            <div class="item-content">
              <slot 
                name="item" 
                :item="item"
                :direction="'source'"
              >
                {{ getItemLabel(item) }}
              </slot>
            </div>
          </div>
        </template>
        <BaseEmptyState
          v-else
          :title="emptyText"
          icon="fas fa-inbox"
          size="sm"
        />
      </div>
    </div>

    <!-- Botones de operación -->
    <div class="transfer-operations">
      <BaseButton
        :disabled="!canMoveToTarget || disabled || readonly"
        :title="toTargetText"
        @click="moveToTarget"
      >
        <i class="fas fa-chevron-right"></i>
      </BaseButton>
      <BaseButton
        :disabled="!canMoveToSource || disabled || readonly"
        :title="toSourceText"
        @click="moveToSource"
      >
        <i class="fas fa-chevron-left"></i>
      </BaseButton>
    </div>

    <!-- Panel derecho -->
    <div class="transfer-panel target">
      <!-- Cabecera -->
      <div class="panel-header">
        <BaseCheckbox
          v-if="!readonly"
          v-model="targetCheckedAll"
          :indeterminate="targetIndeterminate"
          @change="handleTargetCheckAll"
        >
          {{ targetTitle }}
          <span class="item-count">{{ targetCount }}</span>
        </BaseCheckbox>
        <div v-else class="panel-title">
          {{ targetTitle }}
          <span class="item-count">{{ targetCount }}</span>
        </div>
      </div>

      <!-- Búsqueda -->
      <div v-if="filterable" class="panel-search">
        <BaseSearchBar
          v-model="targetSearch"
          :placeholder="searchPlaceholder"
          size="sm"
        />
      </div>

      <!-- Lista -->
      <div class="panel-body">
        <template v-if="filteredTarget.length">
          <div
            v-for="item in filteredTarget"
            :key="getItemKey(item)"
            :class="[
              'transfer-item',
              { 
                'selected': targetChecked.includes(getItemKey(item)),
                'disabled': isItemDisabled(item)
              }
            ]"
            @click="handleItemClick(item, 'target')"
          >
            <BaseCheckbox
              v-if="!readonly"
              :model-value="targetChecked.includes(getItemKey(item))"
              :disabled="isItemDisabled(item)"
              @change="handleItemCheck(item, 'target')"
            />
            <div class="item-content">
              <slot 
                name="item" 
                :item="item"
                :direction="'target'"
              >
                {{ getItemLabel(item) }}
              </slot>
            </div>
          </div>
        </template>
        <BaseEmptyState
          v-else
          :title="emptyText"
          icon="fas fa-inbox"
          size="sm"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseButton from './BaseButton.vue';
import BaseCheckbox from './BaseCheckbox.vue';
import BaseSearchBar from './BaseSearchBar.vue';
import BaseEmptyState from './BaseEmptyState.vue';

const props = defineProps({
  // Datos de origen
  data: {
    type: Array,
    required: true
  },
  // Valores seleccionados
  modelValue: {
    type: Array,
    default: () => []
  },
  // Título del panel izquierdo
  sourceTitle: {
    type: String,
    default: 'Origen'
  },
  // Título del panel derecho
  targetTitle: {
    type: String,
    default: 'Destino'
  },
  // Si permite filtrar
  filterable: {
    type: Boolean,
    default: true
  },
  // Placeholder de búsqueda
  searchPlaceholder: {
    type: String,
    default: 'Buscar'
  },
  // Texto cuando está vacío
  emptyText: {
    type: String,
    default: 'No hay datos'
  },
  // Texto del botón hacia la derecha
  toTargetText: {
    type: String,
    default: 'Mover a la derecha'
  },
  // Texto del botón hacia la izquierda
  toSourceText: {
    type: String,
    default: 'Mover a la izquierda'
  },
  // Si está deshabilitado
  disabled: {
    type: Boolean,
    default: false
  },
  // Si es de solo lectura
  readonly: {
    type: Boolean,
    default: false
  },
  // Mensaje de error
  error: {
    type: String,
    default: ''
  },
  // Si tiene estado de éxito
  success: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

// Estado
const sourceSearch = ref('');
const targetSearch = ref('');
const sourceChecked = ref([]);
const targetChecked = ref([]);

// Computed
const sourceData = computed(() => {
  return props.data.filter(item => !props.modelValue.includes(getItemKey(item)));
});

const targetData = computed(() => {
  return props.data.filter(item => props.modelValue.includes(getItemKey(item)));
});

const filteredSource = computed(() => {
  if (!sourceSearch.value) return sourceData.value;
  const search = sourceSearch.value.toLowerCase();
  return sourceData.value.filter(item => 
    getItemLabel(item).toLowerCase().includes(search)
  );
});

const filteredTarget = computed(() => {
  if (!targetSearch.value) return targetData.value;
  const search = targetSearch.value.toLowerCase();
  return targetData.value.filter(item => 
    getItemLabel(item).toLowerCase().includes(search)
  );
});

const sourceCount = computed(() => {
  return `${sourceChecked.value.length}/${sourceData.value.length}`;
});

const targetCount = computed(() => {
  return `${targetChecked.value.length}/${targetData.value.length}`;
});

const sourceCheckedAll = computed(() => {
  return sourceData.value.length > 0 && 
    sourceChecked.value.length === sourceData.value.length;
});

const targetCheckedAll = computed(() => {
  return targetData.value.length > 0 && 
    targetChecked.value.length === targetData.value.length;
});

const sourceIndeterminate = computed(() => {
  return sourceChecked.value.length > 0 && 
    sourceChecked.value.length < sourceData.value.length;
});

const targetIndeterminate = computed(() => {
  return targetChecked.value.length > 0 && 
    targetChecked.value.length < targetData.value.length;
});

const canMoveToTarget = computed(() => {
  return sourceChecked.value.length > 0;
});

const canMoveToSource = computed(() => {
  return targetChecked.value.length > 0;
});

// Métodos
const getItemKey = (item) => {
  return item.id || item.key || item;
};

const getItemLabel = (item) => {
  return item.label || item.name || item.toString();
};

const isItemDisabled = (item) => {
  return item.disabled;
};

const handleSourceCheckAll = (checked) => {
  sourceChecked.value = checked 
    ? sourceData.value
        .filter(item => !isItemDisabled(item))
        .map(item => getItemKey(item))
    : [];
};

const handleTargetCheckAll = (checked) => {
  targetChecked.value = checked
    ? targetData.value
        .filter(item => !isItemDisabled(item))
        .map(item => getItemKey(item))
    : [];
};

const handleItemClick = (item, direction) => {
  if (props.readonly || isItemDisabled(item)) return;
  
  const key = getItemKey(item);
  const checkedList = direction === 'source' ? sourceChecked : targetChecked;
  const index = checkedList.value.indexOf(key);
  
  if (index > -1) {
    checkedList.value.splice(index, 1);
  } else {
    checkedList.value.push(key);
  }
};

const handleItemCheck = (item, direction) => {
  handleItemClick(item, direction);
};

const moveToTarget = () => {
  const newValue = [...props.modelValue];
  sourceChecked.value.forEach(key => {
    if (!newValue.includes(key)) {
      newValue.push(key);
    }
  });
  
  emit('update:modelValue', newValue);
  emit('change', newValue);
  sourceChecked.value = [];
};

const moveToSource = () => {
  const newValue = props.modelValue.filter(key => 
    !targetChecked.value.includes(key)
  );
  
  emit('update:modelValue', newValue);
  emit('change', newValue);
  targetChecked.value = [];
};
</script>

<style scoped>
.transfer {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

/* Panel */
.transfer-panel {
  flex: 1;
  min-width: 200px;
  max-width: 400px;
  height: 400px;
  border: 1px solid var(--secondary-color);
  border-radius: var(--border-radius-lg);
  display: flex;
  flex-direction: column;
}

/* Cabecera */
.panel-header {
  padding: 0.75rem;
  border-bottom: 1px solid var(--secondary-color);
}

.panel-title {
  font-weight: 500;
  color: var(--text-color);
}

.item-count {
  margin-left: 0.5rem;
  color: var(--text-light);
  font-size: 0.875rem;
}

/* Búsqueda */
.panel-search {
  padding: 0.75rem;
  border-bottom: 1px solid var(--secondary-color);
}

/* Cuerpo */
.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

/* Item */
.transfer-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.transfer-item:hover:not(.disabled) {
  background: var(--secondary-color);
}

.transfer-item.selected {
  background: var(--primary-color);
  color: white;
}

.transfer-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.item-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Operaciones */
.transfer-operations {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
}

/* Estados */
.has-error .transfer-panel {
  border-color: var(--error-color);
}

.has-success .transfer-panel {
  border-color: var(--success-color);
}

.is-disabled {
  opacity: 0.7;
  pointer-events: none;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .transfer-panel {
    border-color: #4a5568;
    background: #2d3748;
  }

  .panel-header {
    border-color: #4a5568;
  }

  .panel-search {
    border-color: #4a5568;
  }

  .panel-title {
    color: #E2E8F0;
  }

  .item-count {
    color: #A0AEC0;
  }

  .transfer-item:hover:not(.disabled) {
    background: #4a5568;
  }

  .transfer-item.selected {
    background: var(--primary-light);
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .transfer-item {
    transition: none;
  }
}

/* Soporte para navegación con teclado */
.transfer-item:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: -2px;
}

@media (prefers-color-scheme: dark) {
  .transfer-item:focus {
    outline-color: var(--primary-light);
  }
}

/* Soporte para pantallas pequeñas */
@media (max-width: 640px) {
  .transfer {
    flex-direction: column;
  }

  .transfer-panel {
    width: 100%;
    max-width: none;
    height: 300px;
  }

  .transfer-operations {
    flex-direction: row;
    justify-content: center;
    padding: 0.5rem 0;
  }
}
</style>

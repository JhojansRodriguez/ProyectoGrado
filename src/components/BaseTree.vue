<!-- Componente de árbol -->
<template>
  <div 
    :class="[
      'tree',
      {
        'has-error': !!error,
        'has-success': success,
        'is-disabled': disabled,
        'is-readonly': readonly,
        'is-loading': loading,
        'with-checkbox': checkable,
        'with-lines': showLines
      }
    ]"
  >
    <!-- Barra de búsqueda -->
    <div v-if="filterable" class="tree-search">
      <BaseSearchBar
        v-model="searchQuery"
        :placeholder="searchPlaceholder"
        :loading="loading"
        size="sm"
      />
    </div>

    <!-- Árbol -->
    <div class="tree-content">
      <!-- Overlay de carga -->
      <div v-if="loading" class="loading-overlay">
        <LoadingSpinner />
      </div>

      <!-- Nodos -->
      <template v-if="filteredNodes.length">
        <BaseTreeNode
          v-for="node in filteredNodes"
          :key="getNodeKey(node)"
          :node="node"
          :level="0"
          :expanded-keys="expandedKeys"
          :selected-keys="internalSelectedKeys"
          :checked-keys="internalCheckedKeys"
          :checkable="checkable"
          :selectable="selectable"
          :show-lines="showLines"
          :disabled="disabled || node.disabled"
          :readonly="readonly"
          :loading-keys="loadingKeys"
          @toggle="toggleNode"
          @select="selectNode"
          @check="checkNode"
          @load="loadNode"
        >
          <template 
            v-for="(_, name) in $slots"
            #[name]="slotData"
          >
            <slot 
              :name="name"
              v-bind="slotData"
            ></slot>
          </template>
        </BaseTreeNode>
      </template>

      <!-- Estado vacío -->
      <BaseEmptyState
        v-else-if="!loading"
        :title="emptyText"
        icon="fas fa-folder-open"
        size="sm"
      />
    </div>

    <!-- Mensaje de error -->
    <p v-if="error" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import BaseSearchBar from './BaseSearchBar.vue';
import BaseTreeNode from './BaseTreeNode.vue';
import BaseEmptyState from './BaseEmptyState.vue';
import LoadingSpinner from './LoadingSpinner.vue';

const props = defineProps({
  // Datos del árbol
  data: {
    type: Array,
    required: true
  },
  // Claves expandidas
  expandedKeys: {
    type: Array,
    default: () => []
  },
  // Claves seleccionadas
  selectedKeys: {
    type: Array,
    default: () => []
  },
  // Claves marcadas (checkbox)
  checkedKeys: {
    type: Array,
    default: () => []
  },
  // Si permite selección
  selectable: {
    type: Boolean,
    default: true
  },
  // Si permite selección múltiple
  multiple: {
    type: Boolean,
    default: false
  },
  // Si muestra checkboxes
  checkable: {
    type: Boolean,
    default: false
  },
  // Si muestra líneas de conexión
  showLines: {
    type: Boolean,
    default: true
  },
  // Si permite filtrar
  filterable: {
    type: Boolean,
    default: false
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
  // Si está cargando
  loading: {
    type: Boolean,
    default: false
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

const emit = defineEmits([
  'update:expandedKeys',
  'update:selectedKeys',
  'update:checkedKeys',
  'expand',
  'select',
  'check',
  'load'
]);

// Estado
const searchQuery = ref('');
const internalSelectedKeys = ref([...props.selectedKeys]);
const internalCheckedKeys = ref([...props.checkedKeys]);
const loadingKeys = ref([]);

// Computed
const filteredNodes = computed(() => {
  if (!searchQuery.value) return props.data;

  const search = searchQuery.value.toLowerCase();
  return filterNodes(props.data, search);
});

// Métodos
const filterNodes = (nodes, search) => {
  return nodes.filter(node => {
    const matches = getNodeLabel(node).toLowerCase().includes(search);
    if (matches) return true;

    if (node.children) {
      const matchingChildren = filterNodes(node.children, search);
      if (matchingChildren.length) {
        node.children = matchingChildren;
        return true;
      }
    }

    return false;
  });
};

const getNodeKey = (node) => {
  return node.id || node.key;
};

const getNodeLabel = (node) => {
  return node.label || node.title || node.name;
};

const toggleNode = (node) => {
  const key = getNodeKey(node);
  const index = props.expandedKeys.indexOf(key);
  const newKeys = [...props.expandedKeys];

  if (index > -1) {
    newKeys.splice(index, 1);
  } else {
    newKeys.push(key);
  }

  emit('update:expandedKeys', newKeys);
  emit('expand', { expanded: index === -1, node, keys: newKeys });
};

const selectNode = (node) => {
  if (props.disabled || node.disabled || !props.selectable) return;

  const key = getNodeKey(node);
  let newKeys;

  if (props.multiple) {
    const index = internalSelectedKeys.value.indexOf(key);
    newKeys = [...internalSelectedKeys.value];

    if (index > -1) {
      newKeys.splice(index, 1);
    } else {
      newKeys.push(key);
    }
  } else {
    newKeys = [key];
  }

  internalSelectedKeys.value = newKeys;
  emit('update:selectedKeys', newKeys);
  emit('select', { selected: newKeys.includes(key), node, keys: newKeys });
};

const checkNode = (node, checked) => {
  if (props.disabled || node.disabled || !props.checkable) return;

  const key = getNodeKey(node);
  const newKeys = [...internalCheckedKeys.value];
  const index = newKeys.indexOf(key);

  if (checked && index === -1) {
    newKeys.push(key);
  } else if (!checked && index > -1) {
    newKeys.splice(index, 1);
  }

  // Actualizar hijos
  if (node.children) {
    updateChildrenChecked(node.children, checked, newKeys);
  }

  // Actualizar padres
  updateParentChecked(node, checked, newKeys);

  internalCheckedKeys.value = newKeys;
  emit('update:checkedKeys', newKeys);
  emit('check', { checked, node, keys: newKeys });
};

const updateChildrenChecked = (children, checked, keys) => {
  children.forEach(child => {
    if (child.disabled) return;

    const key = getNodeKey(child);
    const index = keys.indexOf(key);

    if (checked && index === -1) {
      keys.push(key);
    } else if (!checked && index > -1) {
      keys.splice(index, 1);
    }

    if (child.children) {
      updateChildrenChecked(child.children, checked, keys);
    }
  });
};

const updateParentChecked = (node, checked, keys) => {
  if (!node.parent) return;

  const parent = node.parent;
  const parentKey = getNodeKey(parent);
  const allChildren = parent.children.filter(child => !child.disabled);
  const checkedChildren = allChildren.filter(child => 
    keys.includes(getNodeKey(child))
  );

  const index = keys.indexOf(parentKey);
  if (checkedChildren.length === allChildren.length) {
    if (index === -1) keys.push(parentKey);
  } else {
    if (index > -1) keys.splice(index, 1);
  }

  updateParentChecked(parent, checked, keys);
};

const loadNode = async (node) => {
  const key = getNodeKey(node);
  if (loadingKeys.value.includes(key)) return;

  loadingKeys.value.push(key);
  try {
    await emit('load', node);
  } finally {
    const index = loadingKeys.value.indexOf(key);
    if (index > -1) {
      loadingKeys.value.splice(index, 1);
    }
  }
};

// Observadores
watch(() => props.selectedKeys, (newKeys) => {
  internalSelectedKeys.value = [...newKeys];
});

watch(() => props.checkedKeys, (newKeys) => {
  internalCheckedKeys.value = [...newKeys];
});
</script>

<style scoped>
.tree {
  width: 100%;
}

/* Búsqueda */
.tree-search {
  margin-bottom: 1rem;
}

/* Contenido */
.tree-content {
  position: relative;
  min-height: 100px;
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

/* Mensaje de error */
.error-message {
  margin-top: 0.5rem;
  color: var(--error-color);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Estados */
.is-disabled {
  opacity: 0.7;
  pointer-events: none;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .loading-overlay {
    background: rgba(45, 55, 72, 0.8);
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .tree-node-enter-active,
  .tree-node-leave-active {
    transition: none;
  }
}
</style>

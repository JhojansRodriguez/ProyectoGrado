<!-- Componente de nodo del árbol -->
<template>
  <div 
    :class="[
      'tree-node',
      {
        'expanded': isExpanded,
        'selected': isSelected,
        'disabled': disabled,
        'loading': isLoading,
        'leaf': isLeaf
      }
    ]"
    :style="{ paddingLeft: `${level * 24}px` }"
  >
    <!-- Contenido del nodo -->
    <div class="node-content">
      <!-- Línea de conexión -->
      <span 
        v-if="showLines && level > 0"
        class="node-line"
      ></span>

      <!-- Botón de expandir -->
      <button
        v-if="!isLeaf"
        type="button"
        class="expand-button"
        :disabled="disabled || readonly"
        @click="handleExpand"
      >
        <i 
          :class="[
            'fas',
            isExpanded ? 'fa-chevron-down' : 'fa-chevron-right',
            { 'fa-spin': isLoading }
          ]"
        ></i>
      </button>
      <span v-else class="expand-placeholder"></span>

      <!-- Checkbox -->
      <BaseCheckbox
        v-if="checkable"
        :model-value="isChecked"
        :indeterminate="isIndeterminate"
        :disabled="disabled || readonly"
        @update:model-value="handleCheck"
      />

      <!-- Contenido personalizado o por defecto -->
      <div 
        :class="[
          'node-label',
          { 'selectable': selectable && !disabled && !readonly }
        ]"
        @click="handleSelect"
      >
        <slot 
          name="label" 
          :node="node"
          :level="level"
        >
          <i v-if="node.icon" :class="['node-icon', node.icon]"></i>
          {{ node.label || node.title || node.name }}
        </slot>
      </div>

      <!-- Acciones -->
      <div v-if="$slots.actions" class="node-actions">
        <slot 
          name="actions"
          :node="node"
          :level="level"
        ></slot>
      </div>
    </div>

    <!-- Nodos hijos -->
    <Transition name="expand">
      <div v-if="isExpanded" class="node-children">
        <BaseTreeNode
          v-for="child in node.children"
          :key="getNodeKey(child)"
          :node="child"
          :level="level + 1"
          :expanded-keys="expandedKeys"
          :selected-keys="selectedKeys"
          :checked-keys="checkedKeys"
          :checkable="checkable"
          :selectable="selectable"
          :show-lines="showLines"
          :disabled="disabled || child.disabled"
          :readonly="readonly"
          :loading-keys="loadingKeys"
          @toggle="$emit('toggle', $event)"
          @select="$emit('select', $event)"
          @check="$emit('check', $event)"
          @load="$emit('load', $event)"
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
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import BaseCheckbox from './BaseCheckbox.vue';

const props = defineProps({
  // Datos del nodo
  node: {
    type: Object,
    required: true
  },
  // Nivel de anidación
  level: {
    type: Number,
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
  // Si muestra checkbox
  checkable: {
    type: Boolean,
    default: false
  },
  // Si muestra líneas
  showLines: {
    type: Boolean,
    default: true
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
  // Claves en estado de carga
  loadingKeys: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['toggle', 'select', 'check', 'load']);

// Computed
const isExpanded = computed(() => {
  return props.expandedKeys.includes(getNodeKey(props.node));
});

const isSelected = computed(() => {
  return props.selectedKeys.includes(getNodeKey(props.node));
});

const isChecked = computed(() => {
  return props.checkedKeys.includes(getNodeKey(props.node));
});

const isIndeterminate = computed(() => {
  if (!props.node.children) return false;

  const childKeys = getAllChildKeys(props.node);
  const checkedChildKeys = childKeys.filter(key => 
    props.checkedKeys.includes(key)
  );

  return checkedChildKeys.length > 0 && 
    checkedChildKeys.length < childKeys.length;
});

const isLeaf = computed(() => {
  return !props.node.children || props.node.children.length === 0;
});

const isLoading = computed(() => {
  return props.loadingKeys.includes(getNodeKey(props.node));
});

// Métodos
const getNodeKey = (node) => {
  return node.id || node.key;
};

const getAllChildKeys = (node) => {
  const keys = [];
  if (!node.children) return keys;

  node.children.forEach(child => {
    keys.push(getNodeKey(child));
    if (child.children) {
      keys.push(...getAllChildKeys(child));
    }
  });

  return keys;
};

const handleExpand = async () => {
  if (props.node.children === null && !isLoading.value) {
    await emit('load', props.node);
  }
  emit('toggle', props.node);
};

const handleSelect = () => {
  if (props.selectable && !props.disabled && !props.readonly) {
    emit('select', props.node);
  }
};

const handleCheck = (checked) => {
  emit('check', props.node, checked);
};
</script>

<style scoped>
.tree-node {
  position: relative;
}

/* Contenido del nodo */
.node-content {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.375rem 0;
}

/* Línea de conexión */
.node-line {
  position: absolute;
  left: -12px;
  top: 50%;
  width: 12px;
  height: 1px;
  background: var(--secondary-color);
}

.tree-node:last-child::before {
  display: none;
}

/* Botón de expandir */
.expand-button {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: none;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.3s ease;
}

.expand-button:hover:not(:disabled) {
  color: var(--primary-color);
}

.expand-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.expand-placeholder {
  width: 24px;
}

/* Etiqueta */
.node-label {
  flex: 1;
  min-width: 0;
  padding: 0 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-label.selectable {
  cursor: pointer;
}

.node-label.selectable:hover {
  color: var(--primary-color);
}

/* Icono */
.node-icon {
  margin-right: 0.5rem;
  color: var(--text-light);
}

/* Acciones */
.node-actions {
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.node-content:hover .node-actions {
  opacity: 1;
}

/* Estados */
.tree-node.selected > .node-content .node-label {
  color: var(--primary-color);
  font-weight: 500;
}

.tree-node.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tree-node.loading > .node-content {
  opacity: 0.7;
}

/* Animaciones */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  height: 0;
  opacity: 0;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .node-line {
    background: #4a5568;
  }

  .expand-button {
    color: #A0AEC0;
  }

  .expand-button:hover:not(:disabled) {
    color: var(--primary-light);
  }

  .node-icon {
    color: #A0AEC0;
  }

  .node-label.selectable:hover {
    color: var(--primary-light);
  }

  .tree-node.selected > .node-content .node-label {
    color: var(--primary-light);
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .expand-button,
  .node-actions,
  .expand-enter-active,
  .expand-leave-active {
    transition: none;
  }
}

/* Soporte para navegación con teclado */
.expand-button:focus,
.node-label.selectable:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

@media (prefers-color-scheme: dark) {
  .expand-button:focus,
  .node-label.selectable:focus {
    outline-color: var(--primary-light);
  }
}
</style>

<!-- Componente de grupo de avatares -->
<template>
  <div 
    :class="[
      'avatar-group',
      size,
      { 'stacked': stacked }
    ]"
  >
    <!-- Avatares visibles -->
    <BaseAvatar
      v-for="(item, index) in visibleItems"
      :key="getItemKey(item, index)"
      :src="getItemImage(item)"
      :name="getItemName(item)"
      :alt="getItemAlt(item)"
      :size="size"
      :shape="shape"
      :status="getItemStatus(item)"
      :status-title="getItemStatusTitle(item)"
      :clickable="clickable"
      :style="getAvatarStyle(index)"
      @click="handleAvatarClick(item, index)"
    />

    <!-- Contador de avatares adicionales -->
    <div 
      v-if="hasMore"
      :class="['avatar-counter', size, shape]"
      @click="handleCounterClick"
    >
      +{{ items.length - max }}
    </div>

    <!-- Modal de lista completa -->
    <BaseModal
      v-if="showAllModal"
      v-model="showAllModal"
      title="Todos los miembros"
      size="sm"
    >
      <div class="avatar-list">
        <div 
          v-for="(item, index) in items"
          :key="getItemKey(item, index)"
          class="avatar-list-item"
          @click="handleAvatarClick(item, index)"
        >
          <BaseAvatar
            :src="getItemImage(item)"
            :name="getItemName(item)"
            :alt="getItemAlt(item)"
            :size="size"
            :shape="shape"
            :status="getItemStatus(item)"
            :status-title="getItemStatusTitle(item)"
          />
          <span class="avatar-name">{{ getItemName(item) }}</span>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseAvatar from './BaseAvatar.vue';
import BaseModal from './BaseModal.vue';

const props = defineProps({
  // Lista de items
  items: {
    type: Array,
    required: true
  },
  // Número máximo de avatares visibles
  max: {
    type: Number,
    default: 5
  },
  // Tamaño de los avatares
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  // Forma de los avatares
  shape: {
    type: String,
    default: 'circle',
    validator: (value) => ['circle', 'square'].includes(value)
  },
  // Si los avatares están apilados
  stacked: {
    type: Boolean,
    default: true
  },
  // Si los avatares son clickeables
  clickable: {
    type: Boolean,
    default: false
  },
  // Función para obtener la imagen
  imageKey: {
    type: [String, Function],
    default: 'photo_url'
  },
  // Función para obtener el nombre
  nameKey: {
    type: [String, Function],
    default: 'display_name'
  },
  // Función para obtener el estado
  statusKey: {
    type: [String, Function],
    default: 'status'
  }
});

const emit = defineEmits(['click']);

// Estado
const showAllModal = ref(false);

// Computed
const visibleItems = computed(() => {
  return props.items.slice(0, props.max);
});

const hasMore = computed(() => {
  return props.items.length > props.max;
});

// Métodos
const getItemKey = (item, index) => {
  return item.id || item.key || index;
};

const getItemImage = (item) => {
  if (typeof props.imageKey === 'function') {
    return props.imageKey(item);
  }
  return item[props.imageKey];
};

const getItemName = (item) => {
  if (typeof props.nameKey === 'function') {
    return props.nameKey(item);
  }
  return item[props.nameKey];
};

const getItemAlt = (item) => {
  return `Avatar de ${getItemName(item)}`;
};

const getItemStatus = (item) => {
  if (typeof props.statusKey === 'function') {
    return props.statusKey(item);
  }
  return item[props.statusKey];
};

const getItemStatusTitle = (item) => {
  const status = getItemStatus(item);
  if (!status) return '';

  const statusTitles = {
    online: 'En línea',
    offline: 'Desconectado',
    away: 'Ausente',
    busy: 'Ocupado'
  };

  return statusTitles[status] || status;
};

const getAvatarStyle = (index) => {
  if (!props.stacked) return {};
  
  return {
    zIndex: props.items.length - index,
    marginLeft: index > 0 ? '-0.5rem' : '0'
  };
};

const handleAvatarClick = (item, index) => {
  if (props.clickable) {
    emit('click', { item, index });
  }
};

const handleCounterClick = () => {
  showAllModal.value = true;
};
</script>

<style scoped>
.avatar-group {
  display: inline-flex;
  align-items: center;
}

/* Contador */
.avatar-counter {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--secondary-color);
  color: var(--text-color);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.avatar-counter:hover {
  background: var(--primary-color);
  color: white;
}

/* Tamaños del contador */
.avatar-counter.xs {
  width: 24px;
  height: 24px;
  font-size: 0.75rem;
}

.avatar-counter.sm {
  width: 32px;
  height: 32px;
  font-size: 0.875rem;
}

.avatar-counter.md {
  width: 40px;
  height: 40px;
  font-size: 1rem;
}

.avatar-counter.lg {
  width: 48px;
  height: 48px;
  font-size: 1.25rem;
}

.avatar-counter.xl {
  width: 64px;
  height: 64px;
  font-size: 1.5rem;
}

/* Formas del contador */
.avatar-counter.circle {
  border-radius: 50%;
}

.avatar-counter.square {
  border-radius: var(--border-radius-md);
}

/* Lista de avatares en el modal */
.avatar-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.avatar-list-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: background-color 0.3s;
}

.avatar-list-item:hover {
  background: var(--secondary-color);
}

.avatar-name {
  color: var(--text-color);
  font-weight: 500;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .avatar-counter {
    background: #4a5568;
    color: #E2E8F0;
  }

  .avatar-counter:hover {
    background: var(--primary-light);
  }

  .avatar-list-item:hover {
    background: #4a5568;
  }

  .avatar-name {
    color: #E2E8F0;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .avatar-counter,
  .avatar-list-item {
    transition: none;
  }
}
</style>

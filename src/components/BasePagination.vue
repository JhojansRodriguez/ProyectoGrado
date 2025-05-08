<!-- Componente de paginación -->
<template>
  <nav 
    v-if="totalPages > 1" 
    class="pagination"
    role="navigation"
    aria-label="Navegación de páginas"
  >
    <!-- Botón anterior -->
    <button 
      class="pagination-button prev"
      :disabled="currentPage === 1"
      @click="handlePageChange(currentPage - 1)"
      aria-label="Página anterior"
    >
      <i class="fas fa-chevron-left"></i>
    </button>

    <!-- Números de página -->
    <ul class="pagination-list">
      <!-- Primera página -->
      <li v-if="showFirst">
        <button 
          class="pagination-button"
          :class="{ active: currentPage === 1 }"
          @click="handlePageChange(1)"
        >
          1
        </button>
      </li>

      <!-- Ellipsis izquierdo -->
      <li v-if="showLeftEllipsis" class="ellipsis">
        <span>...</span>
      </li>

      <!-- Páginas centrales -->
      <li v-for="page in visiblePages" :key="page">
        <button 
          class="pagination-button"
          :class="{ active: currentPage === page }"
          @click="handlePageChange(page)"
        >
          {{ page }}
        </button>
      </li>

      <!-- Ellipsis derecho -->
      <li v-if="showRightEllipsis" class="ellipsis">
        <span>...</span>
      </li>

      <!-- Última página -->
      <li v-if="showLast">
        <button 
          class="pagination-button"
          :class="{ active: currentPage === totalPages }"
          @click="handlePageChange(totalPages)"
        >
          {{ totalPages }}
        </button>
      </li>
    </ul>

    <!-- Botón siguiente -->
    <button 
      class="pagination-button next"
      :disabled="currentPage === totalPages"
      @click="handlePageChange(currentPage + 1)"
      aria-label="Página siguiente"
    >
      <i class="fas fa-chevron-right"></i>
    </button>

    <!-- Selector de tamaño de página -->
    <div v-if="showPageSize" class="page-size-selector">
      <label for="pageSize">Por página:</label>
      <select 
        id="pageSize"
        v-model="selectedPageSize"
        @change="handlePageSizeChange"
      >
        <option 
          v-for="size in pageSizeOptions" 
          :key="size" 
          :value="size"
        >
          {{ size }}
        </option>
      </select>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  // Página actual
  currentPage: {
    type: Number,
    required: true
  },
  // Total de páginas
  totalPages: {
    type: Number,
    required: true
  },
  // Número de páginas visibles
  visiblePageCount: {
    type: Number,
    default: 5
  },
  // Tamaño de página actual
  pageSize: {
    type: Number,
    default: 10
  },
  // Opciones de tamaño de página
  pageSizeOptions: {
    type: Array,
    default: () => [10, 25, 50, 100]
  },
  // Si muestra el selector de tamaño de página
  showPageSize: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:currentPage', 'update:pageSize']);

// Estado local
const selectedPageSize = ref(props.pageSize);

// Computed properties
const visiblePages = computed(() => {
  const halfVisible = Math.floor(props.visiblePageCount / 2);
  let start = props.currentPage - halfVisible;
  let end = props.currentPage + halfVisible;

  if (start < 1) {
    end = Math.min(props.visiblePageCount, props.totalPages);
    start = 1;
  }

  if (end > props.totalPages) {
    start = Math.max(1, props.totalPages - props.visiblePageCount + 1);
    end = props.totalPages;
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

const showFirst = computed(() => {
  return !visiblePages.value.includes(1);
});

const showLast = computed(() => {
  return !visiblePages.value.includes(props.totalPages);
});

const showLeftEllipsis = computed(() => {
  return showFirst.value && visiblePages.value[0] > 2;
});

const showRightEllipsis = computed(() => {
  return showLast.value && visiblePages.value[visiblePages.value.length - 1] < props.totalPages - 1;
});

// Métodos
const handlePageChange = (page) => {
  emit('update:currentPage', page);
};

const handlePageSizeChange = () => {
  emit('update:pageSize', selectedPageSize.value);
};
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
}

.pagination-list {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 0.5rem;
}

.pagination-button {
  min-width: 40px;
  height: 40px;
  padding: 0 0.5rem;
  border: 2px solid var(--secondary-color);
  background: white;
  color: var(--text-color);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.pagination-button:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.pagination-button.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-button.prev,
.pagination-button.next {
  font-size: 0.8rem;
}

.ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  width: 40px;
}

/* Selector de tamaño de página */
.page-size-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.page-size-selector label {
  color: var(--text-color);
  font-size: 0.9rem;
}

.page-size-selector select {
  padding: 0.5rem;
  border: 2px solid var(--secondary-color);
  border-radius: var(--border-radius-md);
  background: white;
  color: var(--text-color);
  font-size: 0.9rem;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.page-size-selector select:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .pagination-button {
    background: #2d3748;
    border-color: #4a5568;
    color: #E2E8F0;
  }

  .pagination-button:hover:not(:disabled) {
    border-color: var(--primary-light);
    color: var(--primary-light);
  }

  .pagination-button.active {
    background: var(--primary-light);
    border-color: var(--primary-light);
    color: #2d3748;
  }

  .ellipsis {
    color: #E2E8F0;
  }

  .page-size-selector label {
    color: #E2E8F0;
  }

  .page-size-selector select {
    background: #2d3748;
    border-color: #4a5568;
    color: #E2E8F0;
  }

  .page-size-selector select:focus {
    border-color: var(--primary-light);
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .pagination-button,
  .page-size-selector select {
    transition: none;
  }
}

/* Soporte para pantallas pequeñas */
@media (max-width: 640px) {
  .pagination {
    flex-wrap: wrap;
    justify-content: center;
  }

  .page-size-selector {
    width: 100%;
    justify-content: center;
    margin-top: 1rem;
    margin-left: 0;
  }
}

@media (max-width: 480px) {
  .pagination-button {
    min-width: 36px;
    height: 36px;
    font-size: 0.8rem;
  }

  .ellipsis {
    width: 36px;
  }
}
</style>

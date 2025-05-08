<!-- Componente de barra de búsqueda -->
<template>
  <div 
    :class="[
      'search-bar',
      size,
      {
        'has-error': !!error,
        'is-focused': isFocused,
        'is-loading': loading,
        'is-disabled': disabled,
        'with-suggestions': showSuggestions && suggestions.length > 0
      }
    ]"
  >
    <!-- Campo de búsqueda -->
    <div class="search-input-wrapper">
      <i class="fas fa-search search-icon"></i>
      
      <input
        ref="inputRef"
        type="search"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :autocomplete="autocomplete"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown.down="handleKeyDown"
        @keydown.up="handleKeyUp"
        @keydown.enter="handleEnter"
        @keydown.esc="handleEscape"
      >

      <!-- Botones de acción -->
      <div class="search-actions" v-if="modelValue || loading">
        <!-- Spinner de carga -->
        <i v-if="loading" class="fas fa-spinner fa-spin loading-icon"></i>
        
        <!-- Botón de limpiar -->
        <button 
          v-else-if="modelValue"
          type="button"
          class="clear-button"
          @click="clearSearch"
          title="Limpiar búsqueda"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Lista de sugerencias -->
    <div 
      v-if="showSuggestions && suggestions.length > 0"
      class="suggestions-list"
      role="listbox"
    >
      <div
        v-for="(suggestion, index) in suggestions"
        :key="getSuggestionKey(suggestion, index)"
        :class="[
          'suggestion-item',
          { 'selected': index === selectedIndex }
        ]"
        role="option"
        :aria-selected="index === selectedIndex"
        @mousedown="selectSuggestion(suggestion)"
        @mouseover="selectedIndex = index"
      >
        <slot 
          name="suggestion" 
          :suggestion="suggestion"
          :selected="index === selectedIndex"
        >
          {{ getSuggestionLabel(suggestion) }}
        </slot>
      </div>
    </div>

    <!-- Mensaje de error -->
    <p v-if="error" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  // Modelo
  modelValue: {
    type: String,
    default: ''
  },
  // Placeholder
  placeholder: {
    type: String,
    default: 'Buscar...'
  },
  // Tamaño (sm, md, lg)
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  // Si está en estado de carga
  loading: {
    type: Boolean,
    default: false
  },
  // Si está deshabilitado
  disabled: {
    type: Boolean,
    default: false
  },
  // Sugerencias
  suggestions: {
    type: Array,
    default: () => []
  },
  // Si muestra sugerencias
  showSuggestions: {
    type: Boolean,
    default: true
  },
  // Mensaje de error
  error: {
    type: String,
    default: ''
  },
  // Atributo autocomplete
  autocomplete: {
    type: String,
    default: 'off'
  }
});

const emit = defineEmits([
  'update:modelValue',
  'search',
  'clear',
  'select',
  'focus',
  'blur'
]);

// Estado
const inputRef = ref(null);
const isFocused = ref(false);
const selectedIndex = ref(-1);

// Observar cambios en las sugerencias
watch(() => props.suggestions, () => {
  selectedIndex.value = -1;
});

// Métodos
const handleInput = (event) => {
  emit('update:modelValue', event.target.value);
  emit('search', event.target.value);
};

const handleFocus = (event) => {
  isFocused.value = true;
  emit('focus', event);
};

const handleBlur = (event) => {
  isFocused.value = false;
  // Pequeño delay para permitir la selección de sugerencias
  setTimeout(() => {
    selectedIndex.value = -1;
  }, 200);
  emit('blur', event);
};

const clearSearch = () => {
  emit('update:modelValue', '');
  emit('clear');
  inputRef.value?.focus();
};

const handleKeyDown = () => {
  if (!props.suggestions.length) return;
  selectedIndex.value = Math.min(selectedIndex.value + 1, props.suggestions.length - 1);
};

const handleKeyUp = () => {
  if (!props.suggestions.length) return;
  selectedIndex.value = Math.max(selectedIndex.value - 1, -1);
};

const handleEnter = () => {
  if (selectedIndex.value >= 0 && props.suggestions[selectedIndex.value]) {
    selectSuggestion(props.suggestions[selectedIndex.value]);
  } else {
    emit('search', props.modelValue);
  }
};

const handleEscape = () => {
  selectedIndex.value = -1;
  inputRef.value?.blur();
};

const selectSuggestion = (suggestion) => {
  emit('select', suggestion);
  emit('update:modelValue', getSuggestionLabel(suggestion));
  selectedIndex.value = -1;
};

const getSuggestionLabel = (suggestion) => {
  if (typeof suggestion === 'string') return suggestion;
  return suggestion.label || suggestion.name || suggestion.value || '';
};

const getSuggestionKey = (suggestion, index) => {
  if (typeof suggestion === 'object') {
    return suggestion.id || suggestion.key || index;
  }
  return index;
};
</script>

<style scoped>
.search-bar {
  position: relative;
  width: 100%;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

/* Input */
input {
  width: 100%;
  padding: 0.75rem 2.5rem;
  border: 2px solid var(--secondary-color);
  border-radius: var(--border-radius-lg);
  font-size: 1rem;
  color: var(--text-color);
  background: white;
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* Tamaños */
.search-bar.sm input {
  padding: 0.5rem 2rem;
  font-size: 0.875rem;
}

.search-bar.lg input {
  padding: 1rem 3rem;
  font-size: 1.125rem;
}

/* Iconos */
.search-icon {
  position: absolute;
  left: 1rem;
  color: #666;
}

.search-actions {
  position: absolute;
  right: 1rem;
  display: flex;
  align-items: center;
}

.loading-icon {
  color: var(--primary-color);
}

.clear-button {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.clear-button:hover {
  background: var(--secondary-color);
  color: var(--text-color);
}

/* Sugerencias */
.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  max-height: 300px;
  overflow-y: auto;
  z-index: 100;
}

.suggestion-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.suggestion-item:hover,
.suggestion-item.selected {
  background: var(--secondary-color);
}

/* Estados */
.search-bar.has-error input {
  border-color: var(--error-color);
}

.search-bar.is-disabled input {
  background: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Mensaje de error */
.error-message {
  font-size: 0.85rem;
  color: var(--error-color);
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  input {
    background: #2d3748;
    color: #E2E8F0;
    border-color: #4a5568;
  }

  input:focus {
    border-color: var(--primary-light);
  }

  .suggestions-list {
    background: #2d3748;
  }

  .suggestion-item:hover,
  .suggestion-item.selected {
    background: #4a5568;
  }

  .search-bar.is-disabled input {
    background: #1a202c;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  input,
  .clear-button,
  .suggestion-item {
    transition: none;
  }

  .loading-icon {
    animation: none;
  }
}

/* Soporte para pantallas pequeñas */
@media (max-width: 480px) {
  input {
    font-size: 16px; /* Prevenir zoom en iOS */
  }
}
</style>

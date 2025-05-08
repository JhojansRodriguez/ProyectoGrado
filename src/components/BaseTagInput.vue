<!-- Componente de entrada de etiquetas -->
<template>
  <div 
    :class="[
      'tag-input',
      {
        'has-error': !!error,
        'has-success': success,
        'is-disabled': disabled,
        'is-readonly': readonly,
        'is-focused': isFocused
      }
    ]"
  >
    <!-- Campo de entrada -->
    <div 
      class="input-wrapper"
      @click="focusInput"
    >
      <!-- Etiquetas -->
      <TransitionGroup 
        name="tag"
        tag="div"
        class="tags-container"
      >
        <div
          v-for="(tag, index) in tags"
          :key="tag"
          :class="[
            'tag',
            { 'selected': selectedIndex === index }
          ]"
        >
          <span class="tag-text">{{ tag }}</span>
          <button
            v-if="!readonly"
            type="button"
            class="remove-tag"
            @click.stop="removeTag(index)"
            :title="`Eliminar ${tag}`"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </TransitionGroup>

      <!-- Input -->
      <input
        ref="inputRef"
        type="text"
        :placeholder="getPlaceholder"
        :disabled="disabled"
        :readonly="readonly"
        v-model="inputValue"
        @input="handleInput"
        @keydown="handleKeydown"
        @focus="handleFocus"
        @blur="handleBlur"
        @paste="handlePaste"
      >
    </div>

    <!-- Sugerencias -->
    <Transition name="suggestions">
      <div 
        v-if="showSuggestions && filteredSuggestions.length > 0"
        class="suggestions-list"
      >
        <button
          v-for="suggestion in filteredSuggestions"
          :key="suggestion"
          type="button"
          class="suggestion-item"
          @mousedown="addTag(suggestion)"
        >
          {{ suggestion }}
        </button>
      </div>
    </Transition>

    <!-- Límite -->
    <div 
      v-if="maxTags"
      :class="[
        'tags-limit',
        { 'near-limit': isNearLimit }
      ]"
    >
      {{ tags.length }}/{{ maxTags }}
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

const props = defineProps({
  // Modelo (array de etiquetas)
  modelValue: {
    type: Array,
    default: () => []
  },
  // Placeholder
  placeholder: {
    type: String,
    default: 'Agregar etiqueta'
  },
  // Sugerencias
  suggestions: {
    type: Array,
    default: () => []
  },
  // Número máximo de etiquetas
  maxTags: {
    type: Number,
    default: null
  },
  // Longitud máxima por etiqueta
  maxLength: {
    type: Number,
    default: 20
  },
  // Si permite duplicados
  allowDuplicates: {
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

const emit = defineEmits(['update:modelValue', 'change', 'add', 'remove']);

// Estado
const tags = ref([...props.modelValue]);
const inputValue = ref('');
const inputRef = ref(null);
const isFocused = ref(false);
const showSuggestions = ref(false);
const selectedIndex = ref(-1);

// Computed
const getPlaceholder = computed(() => {
  if (props.maxTags && tags.value.length >= props.maxTags) {
    return 'Límite alcanzado';
  }
  return props.placeholder;
});

const isNearLimit = computed(() => {
  if (!props.maxTags) return false;
  return tags.value.length >= props.maxTags * 0.8;
});

const filteredSuggestions = computed(() => {
  if (!inputValue.value) return [];
  
  return props.suggestions.filter(suggestion => 
    suggestion.toLowerCase().includes(inputValue.value.toLowerCase()) &&
    (props.allowDuplicates || !tags.value.includes(suggestion))
  );
});

// Métodos
const focusInput = () => {
  if (!props.disabled && !props.readonly) {
    inputRef.value?.focus();
  }
};

const addTag = (tag) => {
  tag = tag.trim();
  
  if (!tag) return;
  if (tag.length > props.maxLength) return;
  if (props.maxTags && tags.value.length >= props.maxTags) return;
  if (!props.allowDuplicates && tags.value.includes(tag)) return;

  tags.value.push(tag);
  inputValue.value = '';
  showSuggestions.value = false;
  emit('update:modelValue', tags.value);
  emit('change', tags.value);
  emit('add', tag);
};

const removeTag = (index) => {
  const removedTag = tags.value[index];
  tags.value.splice(index, 1);
  emit('update:modelValue', tags.value);
  emit('change', tags.value);
  emit('remove', removedTag);
};

const handleInput = () => {
  showSuggestions.value = !!inputValue.value;
};

const handleKeydown = (event) => {
  if (event.key === 'Enter' && inputValue.value) {
    event.preventDefault();
    addTag(inputValue.value);
  }
  else if (event.key === 'Backspace' && !inputValue.value && tags.value.length > 0) {
    if (selectedIndex.value === -1) {
      selectedIndex.value = tags.value.length - 1;
    } else {
      removeTag(selectedIndex.value);
      selectedIndex.value = -1;
    }
  }
  else if (event.key === 'ArrowLeft' && !inputValue.value) {
    selectedIndex.value = Math.max(-1, selectedIndex.value - 1);
  }
  else if (event.key === 'ArrowRight' && !inputValue.value) {
    selectedIndex.value = Math.min(tags.value.length - 1, selectedIndex.value + 1);
  }
  else {
    selectedIndex.value = -1;
  }
};

const handleFocus = () => {
  isFocused.value = true;
  if (inputValue.value) {
    showSuggestions.value = true;
  }
};

const handleBlur = () => {
  isFocused.value = false;
  // Pequeño delay para permitir la selección de sugerencias
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

const handlePaste = (event) => {
  event.preventDefault();
  const pastedText = event.clipboardData.getData('text');
  const newTags = pastedText.split(/[,;\n]/).map(tag => tag.trim()).filter(Boolean);
  
  newTags.forEach(tag => addTag(tag));
};

// Observadores
watch(() => props.modelValue, (newValue) => {
  tags.value = [...newValue];
});
</script>

<style scoped>
.tag-input {
  width: 100%;
}

/* Contenedor de entrada */
.input-wrapper {
  min-height: 40px;
  padding: 0.25rem;
  border: 2px solid var(--secondary-color);
  border-radius: var(--border-radius-lg);
  background: white;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  cursor: text;
  transition: all 0.3s ease;
}

.is-focused .input-wrapper {
  border-color: var(--primary-color);
}

/* Contenedor de etiquetas */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Etiquetas */
.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: var(--secondary-color);
  border-radius: var(--border-radius-md);
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.tag.selected {
  background: var(--primary-color);
  color: white;
}

.tag-text {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-tag {
  background: none;
  border: none;
  color: inherit;
  padding: 0;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.remove-tag:hover {
  opacity: 1;
}

/* Input */
input {
  flex: 1;
  min-width: 100px;
  border: none;
  outline: none;
  padding: 0.25rem;
  font: inherit;
  background: none;
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
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-item {
  width: 100%;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.suggestion-item:hover {
  background: var(--secondary-color);
}

/* Límite de etiquetas */
.tags-limit {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-light);
  text-align: right;
}

.tags-limit.near-limit {
  color: var(--warning-color);
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
.has-error .input-wrapper {
  border-color: var(--error-color);
}

.has-success .input-wrapper {
  border-color: var(--success-color);
}

.is-disabled {
  opacity: 0.7;
  pointer-events: none;
}

/* Animaciones */
.tag-enter-active,
.tag-leave-active {
  transition: all 0.3s ease;
}

.tag-enter-from,
.tag-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.suggestions-enter-active,
.suggestions-leave-active {
  transition: all 0.3s ease;
}

.suggestions-enter-from,
.suggestions-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .input-wrapper {
    background: #2d3748;
    border-color: #4a5568;
  }

  .tag {
    background: #4a5568;
    color: #E2E8F0;
  }

  input {
    color: #E2E8F0;
  }

  .suggestions-list {
    background: #2d3748;
  }

  .suggestion-item {
    color: #E2E8F0;
  }

  .suggestion-item:hover {
    background: #4a5568;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .input-wrapper,
  .tag,
  .remove-tag,
  .suggestion-item,
  .tag-enter-active,
  .tag-leave-active,
  .suggestions-enter-active,
  .suggestions-leave-active {
    transition: none;
  }
}

/* Soporte para navegación con teclado */
.suggestion-item:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: -2px;
}

@media (prefers-color-scheme: dark) {
  .suggestion-item:focus {
    outline-color: var(--primary-light);
  }
}
</style>

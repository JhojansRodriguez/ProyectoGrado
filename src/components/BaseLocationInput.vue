<!-- Componente de búsqueda de ubicación -->
<template>
  <div 
    :class="[
      'location-input',
      {
        'has-error': !!error,
        'has-success': success,
        'is-disabled': disabled,
        'is-readonly': readonly,
        'is-loading': loading
      }
    ]"
  >
    <!-- Campo de búsqueda -->
    <div class="input-wrapper">
      <BaseInput
        :id="id"
        v-model="searchQuery"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :error="error"
        :success="success"
        :loading="loading"
        icon-left="fas fa-map-marker-alt"
        :icon-right="loading ? 'fas fa-spinner fa-spin' : ''"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </div>

    <!-- Lista de sugerencias -->
    <Transition name="suggestions">
      <div 
        v-if="showSuggestions && suggestions.length > 0"
        ref="suggestionsList"
        class="suggestions-list"
        role="listbox"
      >
        <button
          v-for="(suggestion, index) in suggestions"
          :key="suggestion.id"
          type="button"
          :class="[
            'suggestion-item',
            { 'selected': index === selectedIndex }
          ]"
          role="option"
          :aria-selected="index === selectedIndex"
          @mousedown="selectSuggestion(suggestion)"
          @mouseover="selectedIndex = index"
        >
          <i class="fas fa-map-marker-alt"></i>
          <div class="suggestion-content">
            <div class="suggestion-main">{{ suggestion.main }}</div>
            <div class="suggestion-secondary">{{ suggestion.secondary }}</div>
          </div>
        </button>
      </div>
    </Transition>

    <!-- Mapa de previsualización -->
    <div v-if="showMap && selectedLocation" class="location-preview">
      <div class="map-container">
        <!-- Aquí iría el componente de mapa -->
        <div class="map-placeholder">
          <img 
            :src="getStaticMapUrl(selectedLocation.coordinates)"
            :alt="selectedLocation.main"
          >
          <div class="map-marker">
            <i class="fas fa-map-marker-alt"></i>
          </div>
        </div>
      </div>
      <div class="location-details">
        <div class="location-name">{{ selectedLocation.main }}</div>
        <div class="location-address">{{ selectedLocation.secondary }}</div>
        <div class="location-coordinates">
          {{ formatCoordinates(selectedLocation.coordinates) }}
        </div>
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
import { ref, computed, watch } from 'vue';
import BaseInput from './BaseInput.vue';
import { debounce } from '../utils/helpers';

const props = defineProps({
  // ID único
  id: {
    type: String,
    required: true
  },
  // Modelo
  modelValue: {
    type: Object,
    default: null
  },
  // Placeholder
  placeholder: {
    type: String,
    default: 'Buscar ubicación'
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
  // Si muestra el mapa
  showMap: {
    type: Boolean,
    default: true
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
  },
  // API Key de Google Maps
  apiKey: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus']);

// Estado
const searchQuery = ref('');
const suggestions = ref([]);
const selectedIndex = ref(-1);
const showSuggestions = ref(false);
const loading = ref(false);
const selectedLocation = ref(props.modelValue);

// Búsqueda con debounce
const searchLocations = debounce(async (query) => {
  if (!query) {
    suggestions.value = [];
    return;
  }

  loading.value = true;
  try {
    // Aquí iría la llamada a la API de geocodificación
    // Por ahora, simulamos algunos resultados
    const results = await simulateGeocoding(query);
    suggestions.value = results;
  } catch (error) {
    console.error('Error buscando ubicaciones:', error);
    suggestions.value = [];
  } finally {
    loading.value = false;
  }
}, 300);

// Métodos
const handleInput = (value) => {
  searchQuery.value = value;
  selectedLocation.value = null;
  emit('update:modelValue', null);
  
  if (value) {
    showSuggestions.value = true;
    searchLocations(value);
  } else {
    showSuggestions.value = false;
    suggestions.value = [];
  }
};

const handleFocus = (event) => {
  if (searchQuery.value) {
    showSuggestions.value = true;
  }
  emit('focus', event);
};

const handleBlur = (event) => {
  // Pequeño delay para permitir la selección de sugerencias
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
  emit('blur', event);
};

const selectSuggestion = (suggestion) => {
  selectedLocation.value = suggestion;
  searchQuery.value = suggestion.main;
  showSuggestions.value = false;
  emit('update:modelValue', suggestion);
  emit('change', suggestion);
};

const formatCoordinates = (coordinates) => {
  if (!coordinates) return '';
  return `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`;
};

const getStaticMapUrl = (coordinates) => {
  if (!coordinates) return '';
  const { lat, lng } = coordinates;
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=400x200&markers=color:red%7C${lat},${lng}&key=${props.apiKey}`;
};

// Simulación de geocodificación
const simulateGeocoding = async (query) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    {
      id: 1,
      main: 'Centro Comercial Santa Fe',
      secondary: 'Autopista Norte #183, Bogotá',
      coordinates: { lat: 4.7684, lng: -74.0478 }
    },
    {
      id: 2,
      main: 'Parque de la 93',
      secondary: 'Calle 93, Bogotá',
      coordinates: { lat: 4.6761, lng: -74.0496 }
    }
  ].filter(location => 
    location.main.toLowerCase().includes(query.toLowerCase()) ||
    location.secondary.toLowerCase().includes(query.toLowerCase())
  );
};

// Observadores
watch(() => props.modelValue, (newValue) => {
  selectedLocation.value = newValue;
  if (newValue) {
    searchQuery.value = newValue.main;
  }
});
</script>

<style scoped>
.location-input {
  position: relative;
  width: 100%;
}

/* Lista de sugerencias */
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
  max-height: 300px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.suggestion-item:hover,
.suggestion-item.selected {
  background: var(--secondary-color);
}

.suggestion-item i {
  color: var(--primary-color);
  margin-top: 0.25rem;
}

.suggestion-content {
  flex: 1;
  min-width: 0;
}

.suggestion-main {
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.suggestion-secondary {
  color: var(--text-light);
  font-size: 0.875rem;
}

/* Previsualización del mapa */
.location-preview {
  margin-top: 1rem;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.map-container {
  position: relative;
  width: 100%;
  height: 200px;
  background: var(--secondary-color);
}

.map-placeholder {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.map-marker {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
  color: var(--error-color);
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.location-details {
  padding: 1rem;
  background: white;
}

.location-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.location-address {
  color: var(--text-light);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.location-coordinates {
  color: var(--text-light);
  font-size: 0.75rem;
  font-family: monospace;
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

/* Animaciones */
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
  .suggestions-list {
    background: #2d3748;
  }

  .suggestion-item:hover,
  .suggestion-item.selected {
    background: #4a5568;
  }

  .suggestion-main {
    color: #E2E8F0;
  }

  .suggestion-secondary {
    color: #A0AEC0;
  }

  .location-details {
    background: #2d3748;
  }

  .location-name {
    color: #E2E8F0;
  }

  .location-address,
  .location-coordinates {
    color: #A0AEC0;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .suggestion-item,
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

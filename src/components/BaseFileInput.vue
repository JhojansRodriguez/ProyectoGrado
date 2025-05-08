<!-- Componente de campo de archivo -->
<template>
  <div 
    :class="[
      'file-input',
      {
        'has-error': !!error,
        'has-success': success,
        'is-disabled': disabled,
        'is-readonly': readonly,
        'is-dragging': isDragging,
        'has-preview': hasPreview
      }
    ]"
    @dragenter.prevent="handleDragEnter"
    @dragleave.prevent="handleDragLeave"
    @dragover.prevent
    @drop.prevent="handleDrop"
  >
    <!-- Input real (oculto) -->
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled || readonly"
      @change="handleFileChange"
      class="file-input-hidden"
    >

    <!-- Área de drop -->
    <div 
      class="drop-zone"
      @click="triggerFileInput"
      role="button"
      tabindex="0"
      @keydown.enter="triggerFileInput"
      @keydown.space="triggerFileInput"
    >
      <!-- Icono -->
      <div class="drop-icon">
        <i v-if="hasPreview" class="fas fa-check-circle"></i>
        <i v-else class="fas fa-cloud-upload-alt"></i>
      </div>

      <!-- Mensaje -->
      <div class="drop-message">
        <p v-if="hasPreview">
          {{ getFileMessage }}
          <button 
            v-if="!readonly"
            type="button" 
            class="change-file"
            @click.stop="triggerFileInput"
          >
            Cambiar archivo
          </button>
        </p>
        <template v-else>
          <p class="primary-text">
            <span class="highlight">Click para seleccionar</span> o arrastra y suelta
          </p>
          <p class="secondary-text">
            {{ acceptMessage }}
          </p>
        </template>
      </div>
    </div>

    <!-- Previsualización -->
    <div v-if="hasPreview && showPreview" class="preview-container">
      <!-- Imagen -->
      <div v-if="isImage" class="image-preview">
        <img :src="previewUrl" :alt="selectedFile.name">
      </div>

      <!-- Lista de archivos -->
      <div v-else-if="multiple" class="file-list">
        <div 
          v-for="(file, index) in selectedFiles"
          :key="index"
          class="file-item"
        >
          <i :class="getFileIcon(file)"></i>
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">({{ formatFileSize(file.size) }})</span>
          <button 
            v-if="!readonly"
            type="button"
            class="remove-file"
            @click.stop="removeFile(index)"
            title="Eliminar archivo"
          >
            <i class="fas fa-times"></i>
          </button>
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
import { ref, computed } from 'vue';

const props = defineProps({
  // Modelo
  modelValue: {
    type: [File, Array],
    default: null
  },
  // Si permite múltiples archivos
  multiple: {
    type: Boolean,
    default: false
  },
  // Tipos de archivo aceptados
  accept: {
    type: String,
    default: '*'
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
  // Si muestra previsualización
  showPreview: {
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
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

// Referencias
const fileInput = ref(null);
const isDragging = ref(false);
const previewUrl = ref('');

// Computed
const selectedFile = computed(() => {
  return Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue;
});

const selectedFiles = computed(() => {
  return Array.isArray(props.modelValue) ? props.modelValue : [];
});

const hasPreview = computed(() => {
  return props.multiple ? selectedFiles.value.length > 0 : !!selectedFile.value;
});

const isImage = computed(() => {
  if (!selectedFile.value) return false;
  return selectedFile.value.type.startsWith('image/');
});

const acceptMessage = computed(() => {
  if (props.accept === '*') return 'Cualquier tipo de archivo';
  
  const types = props.accept.split(',').map(type => {
    return type.trim().replace('.', '').toUpperCase();
  });
  
  return `Archivos ${types.join(', ')}`;
});

const getFileMessage = computed(() => {
  if (props.multiple) {
    return `${selectedFiles.value.length} archivo${selectedFiles.value.length === 1 ? '' : 's'} seleccionado${selectedFiles.value.length === 1 ? '' : 's'}`;
  }
  return selectedFile.value?.name || '';
});

// Métodos
const triggerFileInput = () => {
  if (!props.disabled && !props.readonly) {
    fileInput.value?.click();
  }
};

const handleFileChange = (event) => {
  const files = Array.from(event.target.files);
  updateFiles(files);
};

const handleDragEnter = () => {
  if (!props.disabled && !props.readonly) {
    isDragging.value = true;
  }
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const handleDrop = (event) => {
  isDragging.value = false;
  if (props.disabled || props.readonly) return;

  const files = Array.from(event.dataTransfer.files);
  updateFiles(files);
};

const updateFiles = (files) => {
  // Validar tipos de archivo
  const validFiles = files.filter(file => {
    if (props.accept === '*') return true;
    return props.accept.split(',').some(type => {
      return file.type === type || file.name.endsWith(type.replace('*', ''));
    });
  });

  if (validFiles.length === 0) return;

  const value = props.multiple ? validFiles : validFiles[0];
  emit('update:modelValue', value);
  emit('change', value);

  // Generar previsualización para imágenes
  if (isImage.value && validFiles[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewUrl.value = e.target.result;
    };
    reader.readAsDataURL(validFiles[0]);
  }
};

const removeFile = (index) => {
  const files = [...selectedFiles.value];
  files.splice(index, 1);
  emit('update:modelValue', props.multiple ? files : null);
  emit('change', props.multiple ? files : null);
};

const getFileIcon = (file) => {
  const type = file.type;
  if (type.startsWith('image/')) return 'fas fa-image';
  if (type.startsWith('video/')) return 'fas fa-video';
  if (type.startsWith('audio/')) return 'fas fa-music';
  if (type.includes('pdf')) return 'fas fa-file-pdf';
  if (type.includes('word')) return 'fas fa-file-word';
  if (type.includes('excel') || type.includes('sheet')) return 'fas fa-file-excel';
  if (type.includes('powerpoint')) return 'fas fa-file-powerpoint';
  return 'fas fa-file';
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<style scoped>
.file-input {
  position: relative;
  width: 100%;
}

/* Input oculto */
.file-input-hidden {
  display: none;
}

/* Área de drop */
.drop-zone {
  padding: 2rem;
  border: 2px dashed var(--secondary-color);
  border-radius: var(--border-radius-lg);
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.drop-zone:hover:not(.is-disabled) {
  border-color: var(--primary-color);
}

.is-dragging .drop-zone {
  border-color: var(--primary-color);
  background: var(--secondary-color);
}

/* Icono */
.drop-icon {
  font-size: 2rem;
  color: var(--text-light);
  margin-bottom: 1rem;
}

.has-preview .drop-icon {
  color: var(--success-color);
}

/* Mensajes */
.drop-message {
  color: var(--text-color);
}

.primary-text {
  margin: 0 0 0.5rem;
}

.secondary-text {
  color: var(--text-light);
  font-size: 0.875rem;
  margin: 0;
}

.highlight {
  color: var(--primary-color);
  text-decoration: underline;
}

.change-file {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  padding: 0;
  font: inherit;
  text-decoration: underline;
}

/* Previsualización */
.preview-container {
  margin-top: 1rem;
}

.image-preview {
  width: 100%;
  max-height: 200px;
  overflow: hidden;
  border-radius: var(--border-radius-md);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Lista de archivos */
.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--secondary-color);
  border-radius: var(--border-radius-md);
}

.file-name {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  color: var(--text-light);
  font-size: 0.875rem;
}

.remove-file {
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.3s ease;
}

.remove-file:hover {
  color: var(--error-color);
}

/* Estados */
.has-error .drop-zone {
  border-color: var(--error-color);
}

.has-success .drop-zone {
  border-color: var(--success-color);
}

.is-disabled .drop-zone {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Error */
.error-message {
  color: var(--error-color);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .drop-zone {
    background: #2d3748;
    border-color: #4a5568;
  }

  .drop-zone:hover:not(.is-disabled) {
    border-color: var(--primary-light);
  }

  .is-dragging .drop-zone {
    border-color: var(--primary-light);
    background: #4a5568;
  }

  .drop-message {
    color: #E2E8F0;
  }

  .secondary-text {
    color: #A0AEC0;
  }

  .highlight {
    color: var(--primary-light);
  }

  .change-file {
    color: var(--primary-light);
  }

  .file-item {
    background: #4a5568;
  }

  .file-size {
    color: #A0AEC0;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .drop-zone,
  .remove-file {
    transition: none;
  }
}

/* Soporte para navegación con teclado */
.drop-zone:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

@media (prefers-color-scheme: dark) {
  .drop-zone:focus {
    outline-color: var(--primary-light);
  }
}
</style>

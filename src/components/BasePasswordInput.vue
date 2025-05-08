<!-- Componente de campo de contraseña -->
<template>
  <div 
    :class="[
      'password-input',
      {
        'has-error': !!error,
        'has-success': success,
        'is-disabled': disabled,
        'is-readonly': readonly,
        'show-strength': showStrength
      }
    ]"
  >
    <!-- Campo de contraseña -->
    <div class="input-wrapper">
      <BaseInput
        :id="id"
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :error="error"
        :success="success"
        :autocomplete="autocomplete"
        @blur="handleBlur"
        @focus="handleFocus"
      >
        <!-- Botón de mostrar/ocultar -->
        <template #append>
          <button
            type="button"
            class="toggle-button"
            :title="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            @click="togglePassword"
          >
            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </button>
        </template>
      </BaseInput>
    </div>

    <!-- Indicador de fortaleza -->
    <div v-if="showStrength" class="strength-indicator">
      <div class="strength-bars">
        <div 
          v-for="n in 4" 
          :key="n"
          :class="[
            'strength-bar',
            { active: strengthScore >= n }
          ]"
          :style="{ backgroundColor: getStrengthColor }"
        ></div>
      </div>
      <span class="strength-label" :style="{ color: getStrengthColor }">
        {{ strengthLabel }}
      </span>
    </div>

    <!-- Requisitos de contraseña -->
    <div v-if="showRequirements" class="password-requirements">
      <div 
        v-for="(requirement, index) in requirements"
        :key="index"
        :class="[
          'requirement',
          { 
            'met': requirement.met,
            'unmet': !requirement.met
          }
        ]"
      >
        <i :class="requirement.met ? 'fas fa-check' : 'fas fa-times'"></i>
        {{ requirement.label }}
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

const props = defineProps({
  // ID único
  id: {
    type: String,
    required: true
  },
  // Modelo
  modelValue: {
    type: String,
    default: ''
  },
  // Placeholder
  placeholder: {
    type: String,
    default: 'Ingresa tu contraseña'
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
  // Si muestra indicador de fortaleza
  showStrength: {
    type: Boolean,
    default: true
  },
  // Si muestra requisitos
  showRequirements: {
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
  // Valor de autocompletado
  autocomplete: {
    type: String,
    default: 'new-password'
  }
});

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus']);

// Estado
const password = ref(props.modelValue);
const showPassword = ref(false);

// Requisitos de contraseña
const requirements = computed(() => [
  {
    label: 'Al menos 8 caracteres',
    met: password.value.length >= 8
  },
  {
    label: 'Al menos una letra mayúscula',
    met: /[A-Z]/.test(password.value)
  },
  {
    label: 'Al menos una letra minúscula',
    met: /[a-z]/.test(password.value)
  },
  {
    label: 'Al menos un número',
    met: /[0-9]/.test(password.value)
  },
  {
    label: 'Al menos un carácter especial',
    met: /[!@#$%^&*(),.?":{}|<>]/.test(password.value)
  }
]);

// Puntuación de fortaleza (0-4)
const strengthScore = computed(() => {
  let score = 0;
  
  // Longitud
  if (password.value.length >= 8) score++;
  if (password.value.length >= 12) score++;
  
  // Complejidad
  if (/[A-Z]/.test(password.value) && /[a-z]/.test(password.value)) score++;
  if (/[0-9]/.test(password.value)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password.value)) score++;
  
  return Math.min(score, 4);
});

// Etiqueta de fortaleza
const strengthLabel = computed(() => {
  const labels = ['Muy débil', 'Débil', 'Moderada', 'Fuerte', 'Muy fuerte'];
  return labels[strengthScore.value];
});

// Color de fortaleza
const getStrengthColor = computed(() => {
  const colors = [
    'var(--error-color)',      // Muy débil
    '#ffa500',                 // Débil
    '#ffd700',                 // Moderada
    '#90ee90',                 // Fuerte
    'var(--success-color)'     // Muy fuerte
  ];
  return colors[strengthScore.value];
});

// Métodos
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const handleBlur = (event) => {
  emit('blur', event);
};

const handleFocus = (event) => {
  emit('focus', event);
};

// Observadores
watch(password, (newValue) => {
  emit('update:modelValue', newValue);
  emit('change', newValue);
});

watch(() => props.modelValue, (newValue) => {
  password.value = newValue;
});
</script>

<style scoped>
.password-input {
  width: 100%;
}

/* Botón de mostrar/ocultar */
.toggle-button {
  background: none;
  border: none;
  color: var(--text-light);
  padding: 0.5rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.toggle-button:hover {
  color: var(--primary-color);
}

/* Indicador de fortaleza */
.strength-indicator {
  margin-top: 0.5rem;
}

.strength-bars {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.25rem;
}

.strength-bar {
  height: 4px;
  flex: 1;
  background: var(--secondary-color);
  border-radius: 2px;
  transition: background-color 0.3s ease;
}

.strength-bar.active {
  background: currentColor;
}

.strength-label {
  font-size: 0.75rem;
  transition: color 0.3s ease;
}

/* Requisitos */
.password-requirements {
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.requirement {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
  color: var(--text-light);
}

.requirement i {
  width: 1rem;
  text-align: center;
}

.requirement.met {
  color: var(--success-color);
}

.requirement.unmet {
  color: var(--text-light);
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
.password-input.is-disabled {
  opacity: 0.7;
  pointer-events: none;
}

.password-input.is-readonly {
  opacity: 0.7;
  pointer-events: none;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .toggle-button {
    color: #A0AEC0;
  }

  .toggle-button:hover {
    color: var(--primary-light);
  }

  .strength-bar {
    background: #4a5568;
  }

  .requirement {
    color: #A0AEC0;
  }

  .requirement.unmet {
    color: #A0AEC0;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .toggle-button,
  .strength-bar,
  .strength-label {
    transition: none;
  }
}

/* Soporte para navegación con teclado */
.toggle-button:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
  border-radius: 4px;
}

@media (prefers-color-scheme: dark) {
  .toggle-button:focus {
    outline-color: var(--primary-light);
  }
}
</style>

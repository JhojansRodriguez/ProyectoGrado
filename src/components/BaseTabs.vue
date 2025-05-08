<!-- Componente de tabs -->
<template>
  <div 
    :class="[
      'tabs-container',
      variant,
      {
        'vertical': vertical,
        'mobile': mobile
      }
    ]"
  >
    <!-- Barra de tabs -->
    <div 
      class="tabs-bar"
      role="tablist"
      :aria-orientation="vertical ? 'vertical' : 'horizontal'"
    >
      <!-- Botones de tab -->
      <button
        v-for="(tab, index) in tabs"
        :key="tab.key || index"
        :class="[
          'tab-button',
          {
            'active': isTabActive(tab),
            'disabled': tab.disabled,
            'with-icon': tab.icon,
            'with-badge': tab.badge
          }
        ]"
        role="tab"
        :aria-selected="isTabActive(tab)"
        :aria-controls="`tab-panel-${tab.key || index}`"
        :disabled="tab.disabled"
        @click="selectTab(tab)"
      >
        <!-- Icono -->
        <i v-if="tab.icon" :class="tab.icon"></i>

        <!-- Etiqueta -->
        <span class="tab-label">{{ tab.label }}</span>

        <!-- Badge -->
        <BaseBadge
          v-if="tab.badge"
          v-bind="typeof tab.badge === 'object' ? tab.badge : { content: tab.badge }"
          size="sm"
        />
      </button>

      <!-- Indicador activo -->
      <div 
        v-if="!vertical"
        class="active-indicator"
        :style="indicatorStyle"
      ></div>
    </div>

    <!-- Contenido de los tabs -->
    <div class="tab-content">
      <TransitionGroup name="tab-panel">
        <div
          v-for="(tab, index) in tabs"
          :key="tab.key || index"
          v-show="isTabActive(tab)"
          :id="`tab-panel-${tab.key || index}`"
          class="tab-panel"
          role="tabpanel"
          :aria-labelledby="`tab-${tab.key || index}`"
        >
          <slot :name="tab.key || index" :tab="tab">
            {{ tab.content }}
          </slot>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import BaseBadge from './BaseBadge.vue';

const props = defineProps({
  // Tabs
  tabs: {
    type: Array,
    required: true,
    validator: (tabs) => {
      return tabs.every(tab => tab.label);
    }
  },
  // Tab activo
  modelValue: {
    type: [String, Number],
    default: null
  },
  // Variante (default, pills, underline)
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'pills', 'underline'].includes(value)
  },
  // Si es vertical
  vertical: {
    type: Boolean,
    default: false
  },
  // Si está en modo móvil
  mobile: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

// Estado
const activeTab = ref(props.modelValue || getFirstEnabledTab());
const indicatorStyle = ref({});

// Computed
const activeTabIndex = computed(() => {
  return props.tabs.findIndex(tab => 
    (tab.key || tab) === activeTab.value
  );
});

// Métodos
function getFirstEnabledTab() {
  const firstEnabled = props.tabs.find(tab => !tab.disabled);
  return firstEnabled ? (firstEnabled.key || firstEnabled) : null;
}

function isTabActive(tab) {
  return (tab.key || tab) === activeTab.value;
}

function selectTab(tab) {
  if (tab.disabled) return;

  const value = tab.key || tab;
  activeTab.value = value;
  emit('update:modelValue', value);
  emit('change', tab);
}

function updateIndicator() {
  if (props.vertical) return;

  nextTick(() => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const activeButton = tabButtons[activeTabIndex.value];

    if (activeButton) {
      indicatorStyle.value = {
        left: `${activeButton.offsetLeft}px`,
        width: `${activeButton.offsetWidth}px`
      };
    }
  });
}

// Observadores
watch(() => props.modelValue, (newValue) => {
  if (newValue !== activeTab.value) {
    activeTab.value = newValue;
  }
});

watch(activeTab, () => {
  updateIndicator();
});

// Lifecycle hooks
onMounted(() => {
  updateIndicator();
  window.addEventListener('resize', updateIndicator);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateIndicator);
});
</script>

<style scoped>
.tabs-container {
  display: flex;
  flex-direction: column;
}

/* Vertical */
.tabs-container.vertical {
  flex-direction: row;
}

/* Barra de tabs */
.tabs-bar {
  position: relative;
  display: flex;
  border-bottom: 1px solid var(--secondary-color);
}

.vertical .tabs-bar {
  flex-direction: column;
  border-bottom: none;
  border-right: 1px solid var(--secondary-color);
  min-width: 200px;
}

/* Botones de tab */
.tab-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: var(--text-color);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.tab-button:hover:not(.disabled) {
  color: var(--primary-color);
}

.tab-button.active {
  color: var(--primary-color);
  font-weight: 500;
}

.tab-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Variante pills */
.pills .tab-button {
  border-radius: var(--border-radius-md);
  margin: 0 0.25rem;
}

.pills .tab-button.active {
  background: var(--primary-color);
  color: white;
}

/* Variante underline */
.underline .tab-button {
  border-bottom: 2px solid transparent;
}

.underline .tab-button.active {
  border-bottom-color: var(--primary-color);
}

/* Indicador activo */
.active-indicator {
  position: absolute;
  bottom: -1px;
  height: 2px;
  background: var(--primary-color);
  transition: all 0.3s ease;
}

/* Contenido */
.tab-content {
  flex: 1;
  padding: 1rem 0;
}

.vertical .tab-content {
  padding: 0 0 0 1rem;
}

.tab-panel {
  animation: fadeIn 0.3s ease;
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.tab-panel-enter-active,
.tab-panel-leave-active {
  transition: opacity 0.3s ease;
}

.tab-panel-enter-from,
.tab-panel-leave-to {
  opacity: 0;
}

/* Modo móvil */
@media (max-width: 768px) {
  .tabs-container.mobile .tabs-bar {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .tabs-container.mobile.vertical {
    flex-direction: column;
  }

  .tabs-container.mobile.vertical .tabs-bar {
    flex-direction: row;
    border-right: none;
    border-bottom: 1px solid var(--secondary-color);
  }

  .tabs-container.mobile.vertical .tab-content {
    padding: 1rem 0;
  }
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .tab-button {
    color: #E2E8F0;
  }

  .tab-button:hover:not(.disabled) {
    color: var(--primary-light);
  }

  .tab-button.active {
    color: var(--primary-light);
  }

  .pills .tab-button.active {
    background: var(--primary-light);
    color: #2d3748;
  }

  .underline .tab-button.active,
  .active-indicator {
    border-bottom-color: var(--primary-light);
    background: var(--primary-light);
  }

  .tabs-bar {
    border-color: #4a5568;
  }

  .vertical .tabs-bar {
    border-color: #4a5568;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .tab-button,
  .active-indicator {
    transition: none;
  }

  .tab-panel {
    animation: none;
  }

  .tab-panel-enter-active,
  .tab-panel-leave-active {
    transition: none;
  }
}
</style>

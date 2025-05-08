<template>
  <div id="app">
    <!-- Barra de navegación -->
    <NavBar v-if="!isAuthPage" />

    <!-- Contenido principal -->
    <main :class="{ 'auth-page': isAuthPage }">
      <LoadingSpinner 
        v-if="authStore.loading" 
        fullscreen 
        message="Cargando..." 
      />
      <router-view v-else />
    </main>

    <!-- Barra de pie de página -->
    <FooterBar v-if="!isAuthPage" />

    <!-- Contenedor de notificaciones -->
    <NotificationContainer />

    <!-- Diálogo de confirmación global -->
    <ConfirmDialog
      v-if="dialogStore.dialogConfig"
      v-bind="dialogStore.dialogConfig"
      @confirm="dialogStore.handleConfirm"
      @cancel="dialogStore.handleCancel"
    />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from './store/auth';
import { useDialogStore } from './store/dialogs';
import NavBar from './components/NavBar.vue';
import FooterBar from './components/FooterBar.vue';
import LoadingSpinner from './components/LoadingSpinner.vue';
import NotificationContainer from './components/NotificationContainer.vue';
import ConfirmDialog from './components/ConfirmDialog.vue';

const route = useRoute();
const authStore = useAuthStore();
const dialogStore = useDialogStore();

// Computed properties
const isAuthPage = computed(() => {
  return ['/login', '/register', '/forgot-password'].includes(route.path);
});

// Lifecycle hooks
onMounted(async () => {
  // Verificar el estado de autenticación al cargar la aplicación
  await authStore.checkAuth();
});
</script>

<style>
/* Estilos globales */
:root {
  /* Colores principales */
  --primary-color: #5F7F79;
  --primary-dark: #2D4739;
  --primary-light: #B8D8D0;
  
  /* Colores secundarios */
  --secondary-color: #E8F1F2;
  --text-color: #2D4739;
  --text-light: #666666;
  
  /* Colores de estado */
  --success-color: #28a745;
  --error-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
  
  /* Espaciado */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Bordes */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  
  /* Sombras */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* Reset básico */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  height: 100%;
}

body {
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
               'Helvetica Neue', Arial, sans-serif;
  line-height: 1.5;
  color: var(--text-color);
  background-color: #f8f9fa;
  min-height: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  padding-top: 60px; /* Altura de la barra de navegación */
}

main.auth-page {
  padding-top: 0;
}

/* Enlaces */
a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.3s;
}

a:hover {
  color: var(--primary-dark);
}

/* Botones */
button {
  font-family: inherit;
}

/* Inputs */
input, textarea, select {
  font-family: inherit;
}

/* Utilidades */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

/* Scrollbar personalizada */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--secondary-color);
}

::-webkit-scrollbar-thumb {
  background: var(--primary-light);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}

/* Media queries */
@media (max-width: 768px) {
  html {
    font-size: 14px;
  }

  .container {
    padding: 0 var(--spacing-sm);
  }
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  :root {
    --primary-color: #7FA29B;
    --primary-dark: #3D5749;
    --primary-light: #C8E8E0;
    --secondary-color: #2D3748;
    --text-color: #E2E8F0;
    --text-light: #A0AEC0;
  }

  body {
    background-color: #1A202C;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>

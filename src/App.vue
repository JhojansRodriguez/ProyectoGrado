<template>
  <div id="app" class="min-h-screen flex flex-col bg-gray-50 text-text-color font-sans">
    <!-- Barra de navegación -->
    <NavBar v-if="!isAuthPage" />

    <!-- Contenido principal -->
    <main class="flex-1" :class="{ 'pt-[60px]': !isAuthPage }">
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


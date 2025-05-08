import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { onAuthStateChanged } from 'firebase/auth'
import { useAuthStore } from './store/auth'
import { auth, db } from './firebase/config'

// Crear la aplicación Vue
const app = createApp(App);

// Configurar Pinia
const pinia = createPinia();
app.use(pinia);

// Configurar el router
app.use(router);

// Manejar el estado de autenticación
let appInitialized = false;
onAuthStateChanged(auth, async (user) => {
  const authStore = useAuthStore();
  
  if (user) {
    await authStore.checkAuth();
  } else {
    authStore.user = null;
  }

  // Inicializar la aplicación solo una vez
  if (!appInitialized) {
    app.mount('#app');
    appInitialized = true;
  }
});

// Exportar las instancias de Firebase para uso en otros archivos
export { db, auth };

import { useAuthStore } from '../store/auth';
import { USER_ROLES } from '../firebase/auth';

// Middleware para verificar autenticación
export const requireAuth = async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Si aún no se ha verificado la autenticación
  if (authStore.loading) {
    await authStore.checkAuth();
  }

  if (!authStore.isAuthenticated) {
    // Guardar la ruta a la que intentaba acceder
    next({ 
      path: '/login', 
      query: { redirect: to.fullPath } 
    });
  } else {
    next();
  }
};

// Middleware para verificar rol de super administrador
export const requireSuperAdmin = async (to, from, next) => {
  const authStore = useAuthStore();
  
  if (authStore.loading) {
    await authStore.checkAuth();
  }

  if (!authStore.isAuthenticated) {
    next({ 
      path: '/login', 
      query: { redirect: to.fullPath } 
    });
  } else if (!authStore.isSuperAdmin) {
    next({ path: '/unauthorized' });
  } else {
    next();
  }
};

// Middleware para verificar rol de usuario farmacia
export const requireFarmaUser = async (to, from, next) => {
  const authStore = useAuthStore();
  
  if (authStore.loading) {
    await authStore.checkAuth();
  }

  if (!authStore.isAuthenticated) {
    next({ 
      path: '/login', 
      query: { redirect: to.fullPath } 
    });
  } else if (!authStore.isFarmaUser) {
    next({ path: '/unauthorized' });
  } else {
    next();
  }
};

// Middleware para redirigir usuarios autenticados
export const redirectIfAuthenticated = async (to, from, next) => {
  const authStore = useAuthStore();
  
  if (authStore.loading) {
    await authStore.checkAuth();
  }

  if (authStore.isAuthenticated) {
    // Redirigir según el rol
    if (authStore.isSuperAdmin) {
      next({ path: '/admin/dashboard' });
    } else if (authStore.isFarmaUser) {
      next({ path: '/farma/dashboard' });
    } else {
      next({ path: '/' });
    }
  } else {
    next();
  }
};

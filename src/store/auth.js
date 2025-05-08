import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { 
  loginWithEmail, 
  logout, 
  getCurrentUser,
  USER_ROLES,
  checkPermission
} from '../firebase/auth';

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref(null);
  const loading = ref(true);
  const error = ref(null);

// Getters
const isAuthenticated = computed(() => !!user.value);
const userRole = computed(() => user.value?.role || null);
const userType = computed(() => user.value?.userType || null);
const isSuperAdmin = computed(() => user.value?.role === USER_ROLES.SUPER_ADMIN);
const isFarmaUser = computed(() => user.value?.userType === 'farma_user');
const isRegularUser = computed(() => user.value?.userType === 'users');

  // Acciones
const login = async (email, password, userType = 'users') => {
  try {
    error.value = null;
    loading.value = true;
    const userData = await loginWithEmail(email, password, userType);
    user.value = userData;
    return userData;
  } catch (err) {
    error.value = translateFirebaseError(err.code);
    throw err;
  } finally {
    loading.value = false;
  }
};

  const logoutUser = async () => {
    try {
      error.value = null;
      loading.value = true;
      await logout();
      user.value = null;
    } catch (err) {
      error.value = 'Error al cerrar sesión';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const checkAuth = async () => {
    try {
      loading.value = true;
      const userData = await getCurrentUser();
      user.value = userData;
    } catch (err) {
      error.value = 'Error al verificar autenticación';
      user.value = null;
    } finally {
      loading.value = false;
    }
  };

  const hasPermission = (requiredRole) => {
    if (!user.value) return false;
    return checkPermission(user.value.role, requiredRole);
  };

  const clearError = () => {
    error.value = null;
  };

  // Función auxiliar para traducir errores de Firebase
  const translateFirebaseError = (errorCode) => {
    const errorMessages = {
      'auth/invalid-email': 'El correo electrónico no es válido',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/user-not-found': 'No existe una cuenta con este correo electrónico',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/email-already-in-use': 'Este correo electrónico ya está registrado',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
      'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde',
      'auth/requires-recent-login': 'Por favor, vuelve a iniciar sesión'
    };

    return errorMessages[errorCode] || 'Error de autenticación';
  };

return {
  // Estado
  user,
  loading,
  error,
  // Getters
  isAuthenticated,
  userRole,
  userType,
  isSuperAdmin,
  isFarmaUser,
  isRegularUser,
  // Acciones
  login,
  logoutUser,
  checkAuth,
  hasPermission,
  clearError
};
});

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { NOTIFICATION_TYPES } from '../utils/constants';

export const useNotificationStore = defineStore('notifications', () => {
  // Estado
  const notifications = ref([]);
  let notificationId = 0;

  // Acciones
  const addNotification = ({
    type = NOTIFICATION_TYPES.INFO,
    title = '',
    message,
    duration = 5000,
    hideClose = false,
    clickToClose = true
  }) => {
    const id = ++notificationId;
    
    notifications.value.push({
      id,
      type,
      title,
      message,
      duration,
      hideClose,
      clickToClose
    });

    // Si hay más de 5 notificaciones, remover la más antigua
    if (notifications.value.length > 5) {
      notifications.value.shift();
    }

    return id;
  };

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  };

  const clearNotifications = () => {
    notifications.value = [];
  };

  // Métodos de ayuda para tipos específicos de notificaciones
  const success = (message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      message,
      ...options
    });
  };

  const error = (message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      message,
      duration: 0, // Los errores no se cierran automáticamente
      ...options
    });
  };

  const warning = (message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      message,
      ...options
    });
  };

  const info = (message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.INFO,
      message,
      ...options
    });
  };

  // Método para manejar errores de Firebase
  const handleFirebaseError = (error) => {
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

    const message = errorMessages[error.code] || error.message || 'Ha ocurrido un error inesperado';
    return this.error(message, {
      title: 'Error de autenticación'
    });
  };

  return {
    // Estado
    notifications,
    // Acciones
    addNotification,
    removeNotification,
    clearNotifications,
    // Métodos de ayuda
    success,
    error,
    warning,
    info,
    handleFirebaseError
  };
});

import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDialogStore = defineStore('dialogs', () => {
  // Estado
  const dialogConfig = ref(null);
  const resolvePromise = ref(null);
  const rejectPromise = ref(null);

  // Acciones
  const confirm = ({
    type = 'danger',
    title,
    message,
    warning = '',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    loadingText = 'Procesando...',
    closeOnOverlay = true
  }) => {
    return new Promise((resolve, reject) => {
      dialogConfig.value = {
        show: true,
        type,
        title,
        message,
        warning,
        confirmText,
        cancelText,
        loadingText,
        closeOnOverlay,
        loading: false
      };
      resolvePromise.value = resolve;
      rejectPromise.value = reject;
    });
  };

  const handleConfirm = async () => {
    if (resolvePromise.value) {
      resolvePromise.value(true);
    }
    closeDialog();
  };

  const handleCancel = () => {
    if (rejectPromise.value) {
      rejectPromise.value(false);
    }
    closeDialog();
  };

  const closeDialog = () => {
    dialogConfig.value = null;
    resolvePromise.value = null;
    rejectPromise.value = null;
  };

  const setLoading = (loading) => {
    if (dialogConfig.value) {
      dialogConfig.value.loading = loading;
    }
  };

  // Métodos de ayuda para tipos específicos de confirmación
  const confirmDelete = ({
    title = '¿Eliminar elemento?',
    message = '¿Estás seguro de que deseas eliminar este elemento?',
    warning = 'Esta acción no se puede deshacer.',
    ...options
  } = {}) => {
    return confirm({
      type: 'danger',
      title,
      message,
      warning,
      confirmText: 'Eliminar',
      ...options
    });
  };

  const confirmDiscard = ({
    title = '¿Descartar cambios?',
    message = 'Tienes cambios sin guardar. ¿Estás seguro de que deseas descartarlos?',
    warning = 'Esta acción no se puede deshacer.',
    ...options
  } = {}) => {
    return confirm({
      type: 'warning',
      title,
      message,
      warning,
      confirmText: 'Descartar',
      ...options
    });
  };

  const confirmLogout = ({
    title = '¿Cerrar sesión?',
    message = '¿Estás seguro de que deseas cerrar sesión?',
    ...options
  } = {}) => {
    return confirm({
      type: 'info',
      title,
      message,
      confirmText: 'Cerrar Sesión',
      ...options
    });
  };

  const confirmAction = ({
    title = '¿Confirmar acción?',
    message = '¿Estás seguro de que deseas realizar esta acción?',
    ...options
  } = {}) => {
    return confirm({
      type: 'warning',
      title,
      message,
      ...options
    });
  };

  return {
    // Estado
    dialogConfig,
    // Acciones
    confirm,
    handleConfirm,
    handleCancel,
    closeDialog,
    setLoading,
    // Métodos de ayuda
    confirmDelete,
    confirmDiscard,
    confirmLogout,
    confirmAction
  };
});

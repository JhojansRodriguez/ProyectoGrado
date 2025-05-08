<!-- Contenedor de notificaciones -->
<template>
  <div class="notification-container">
    <TransitionGroup name="notification-list">
      <Notification
        v-for="notification in notificationStore.notifications"
        :key="notification.id"
        v-bind="notification"
        @close="notificationStore.removeNotification(notification.id)"
      />
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useNotificationStore } from '../store/notifications';
import Notification from './Notification.vue';

const notificationStore = useNotificationStore();
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}

.notification-container > * {
  pointer-events: auto;
}

/* Animaciones de la lista */
.notification-list-move, /* aplicar transición a elementos en movimiento */
.notification-list-enter-active,
.notification-list-leave-active {
  transition: all 0.3s ease;
}

.notification-list-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-list-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Asegurar que los elementos que salen no afecten el flujo */
.notification-list-leave-active {
  position: absolute;
}

/* Media queries */
@media (max-width: 768px) {
  .notification-container {
    top: auto;
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
  }
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .notification-container {
    filter: brightness(0.8);
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .notification-list-move,
  .notification-list-enter-active,
  .notification-list-leave-active {
    transition: opacity 0.3s ease;
    transform: none;
  }
}
</style>

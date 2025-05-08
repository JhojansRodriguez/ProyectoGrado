<!-- Vista de acceso no autorizado -->
<template>
  <div class="unauthorized">
    <div class="container">
      <div class="error-content">
        <div class="error-icon">
          <i class="fas fa-lock"></i>
        </div>
        <h1>Acceso No Autorizado</h1>
        <p>Lo sentimos, no tienes permisos para acceder a esta página.</p>
        
        <div class="actions">
          <router-link to="/" class="btn-primary">
            <i class="fas fa-home"></i>
            Volver al Inicio
          </router-link>
          
          <button 
            v-if="authStore.isAuthenticated" 
            @click="handleLogout" 
            class="btn-secondary"
          >
            <i class="fas fa-sign-out-alt"></i>
            Cerrar Sesión
          </button>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';

const router = useRouter();
const authStore = useAuthStore();
const error = ref(null);

const handleLogout = async () => {
  try {
    await authStore.logoutUser();
    router.push('/login');
  } catch (err) {
    error.value = 'Error al cerrar sesión. Por favor, intenta nuevamente.';
  }
};
</script>

<style scoped>
.unauthorized {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #E8F1F2;
  padding: 1rem;
}

.container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.error-content {
  background: white;
  padding: 3rem 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.error-icon {
  width: 80px;
  height: 80px;
  background: #fde8e8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
}

.error-icon i {
  font-size: 2.5rem;
  color: #dc3545;
}

h1 {
  color: #2D4739;
  font-size: 2rem;
  margin-bottom: 1rem;
}

p {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.btn-primary, .btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s;
  text-decoration: none;
}

.btn-primary {
  background: #5F7F79;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #4a6561;
}

.btn-secondary {
  background: transparent;
  color: #5F7F79;
  border: 2px solid #5F7F79;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #5F7F79;
  color: white;
}

.error-message {
  color: #dc3545;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fde8e8;
  border-radius: 4px;
}

@media (max-width: 480px) {
  .error-content {
    padding: 2rem 1rem;
  }

  .actions {
    flex-direction: column;
  }

  h1 {
    font-size: 1.5rem;
  }

  p {
    font-size: 1rem;
  }
}
</style>

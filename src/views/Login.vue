<!-- Vista de inicio de sesión -->
<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>PharmaLoc</h1>
          <p>Inicia sesión para continuar</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <!-- Mensaje de error -->
          <div v-if="authStore.error" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            {{ authStore.error }}
          </div>

          <!-- Campo de correo -->
          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <div class="input-with-icon">
              <i class="fas fa-envelope"></i>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                placeholder="tu@email.com"
                :disabled="authStore.loading"
              >
            </div>
          </div>

<!-- Campo de contraseña -->
          <div class="form-group">
            <label for="password">Contraseña</label>
            <div class="input-with-icon">
              <i class="fas fa-lock"></i>
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="Tu contraseña"
                :disabled="authStore.loading"
              >
              <button 
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>


          <!-- Botón de inicio de sesión -->
          <button 
            type="submit" 
            class="login-button"
            :disabled="authStore.loading"
          >
            <span v-if="!authStore.loading">Iniciar Sesión</span>
            <i v-else class="fas fa-spinner fa-spin"></i>
          </button>
        </form>

        <!-- Enlaces adicionales -->
        <div class="additional-links">
          <a href="#" @click.prevent="handleForgotPassword">
            ¿Olvidaste tu contraseña?
          </a>
          <router-link to="/register" class="register-link">
            ¿No tienes cuenta? Regístrate
          </router-link>
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

// Estado local
const email = ref('');
const password = ref('');
const showPassword = ref(false);

// Manejar inicio de sesión
const handleLogin = async () => {
  try {
    const userData = await authStore.login(email.value, password.value);
    
    // Redirigir según el tipo de usuario
    if (userData.userType === 'farma_user') {
      router.push('/farma/dashboard');
    } else {
      router.push('/');
    }
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
  }
};

// Manejar olvido de contraseña
const handleForgotPassword = () => {
  // Implementar lógica de recuperación de contraseña
  console.log('Recuperar contraseña');
};
</script>

<style scoped>
.user-type-select {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #E8F1F2;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
  background-color: white;
  appearance: none;
  cursor: pointer;
}

.user-type-select:focus {
  outline: none;
  border-color: #5F7F79;
}
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #5F7F79 0%, #2D4739 100%);
  padding: 1rem;
}

.login-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  color: #5F7F79;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #666;
  font-size: 1rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #2D4739;
  font-size: 0.9rem;
  font-weight: 500;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon i {
  position: absolute;
  left: 1rem;
  color: #5F7F79;
}

.input-with-icon input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #E8F1F2;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.input-with-icon input:focus {
  outline: none;
  border-color: #5F7F79;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #5F7F79;
  cursor: pointer;
  padding: 0;
}

.login-button {
  background: #5F7F79;
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover:not(:disabled) {
  background: #4a6561;
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  background: #fde8e8;
  color: #dc3545;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.additional-links {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.additional-links a {
  color: #5F7F79;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s;
}

.additional-links a:hover {
  color: #2D4739;
}

.register-link {
  font-weight: 500;
}

@media (max-width: 480px) {
  .login-card {
    padding: 1.5rem;
  }

  .login-header h1 {
    font-size: 1.75rem;
  }
}
</style>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-r from-primary to-primary-dark p-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-xl shadow-lg p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-primary mb-2">PharmaLoc</h1>
          <p class="text-text-light">Inicia sesión para continuar</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div v-if="authStore.error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
            <i class="fas fa-exclamation-circle mr-2"></i>
            <span class="block sm:inline">{{ authStore.error }}</span>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-text-color mb-1">Correo electrónico</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                <i class="fas fa-envelope text-primary"></i>
              </span>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                placeholder="tu@email.com"
                :disabled="authStore.loading"
                class="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-primary focus:border-primary transition"
              >
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-text-color mb-1">Contraseña</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                <i class="fas fa-lock text-primary"></i>
              </span>
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="Tu contraseña"
                :disabled="authStore.loading"
                class="w-full pl-10 pr-10 py-2 border-2 border-gray-200 rounded-lg focus:ring-primary focus:border-primary transition"
              >
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-primary"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span v-if="!authStore.loading">Iniciar Sesión</span>
            <i v-else class="fas fa-spinner fa-spin"></i>
          </button>
        </form>

        <div class="mt-6 text-center text-sm">
          <a href="#" @click.prevent="handleForgotPassword" class="font-medium text-primary hover:text-primary-dark">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
        <div class="mt-4 text-center text-sm">
          <router-link to="/register" class="font-medium text-primary hover:text-primary-dark">
            ¿No tienes cuenta? <span class="font-bold">Regístrate</span>
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

const email = ref('');
const password = ref('');
const showPassword = ref(false);

const handleLogin = async () => {
  try {
    const userData = await authStore.login(email.value, password.value);
    
    if (userData.userType === 'farma_user') {
      router.push('/farma/dashboard');
    } else {
      router.push('/');
    }
  } catch (error) {
    // Error is handled by the auth store
  }
};

const handleForgotPassword = () => {
  // Implementar lógica de recuperación de contraseña
  alert('Funcionalidad de recuperar contraseña no implementada.');
};
</script>

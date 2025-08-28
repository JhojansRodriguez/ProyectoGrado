
<template>
  <nav class="bg-white shadow-md py-4 fixed top-0 left-0 right-0 z-50">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
      <!-- Logo -->
      <router-link to="/" class="text-2xl font-bold text-primary">PharmaLoc</router-link>

      <!-- Hamburger Menu -->
      <div class="md:hidden">
        <button @click="toggleMobileMenu" class="text-primary focus:outline-none">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Desktop Menu -->
      <div class="hidden md:flex items-center space-x-8">
        <router-link to="/" class="nav-link">Inicio</router-link>
        <router-link to="/pharmacies" class="nav-link">Farmacias</router-link>
        <router-link to="/medicines" class="nav-link">Medicamentos</router-link>
        <router-link to="/contact" class="nav-link">Contacto</router-link>

        <!-- User Menu (Desktop) -->
        <div v-if="authStore.isAuthenticated" class="relative">
          <button @click="toggleDropdown" class="flex items-center space-x-2 text-primary hover:text-primary-dark focus:outline-none">
            <span>{{ authStore.user?.displayName || 'Usuario' }}</span>
            <i class="fas fa-chevron-down text-xs"></i>
          </button>
          <div v-if="showDropdown" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
            <router-link v-if="authStore.isSuperAdmin" to="/admin/dashboard" class="dropdown-item">Dashboard</router-link>
            <router-link v-if="authStore.isFarmaUser" to="/farma/dashboard" class="dropdown-item">Dashboard</router-link>
            <router-link to="/profile" class="dropdown-item">Mi Perfil</router-link>
            <a @click="handleLogout" class="dropdown-item cursor-pointer text-error">Cerrar Sesión</a>
          </div>
        </div>
        <router-link v-else to="/login" class="btn btn-primary">Iniciar Sesión</router-link>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="mobileMenuOpen" class="md:hidden bg-white">
        <router-link to="/" class="mobile-nav-link" @click="closeMobileMenu">Inicio</router-link>
        <router-link to="/pharmacies" class="mobile-nav-link" @click="closeMobileMenu">Farmacias</router-link>
        <router-link to="/medicines" class="mobile-nav-link" @click="closeMobileMenu">Medicamentos</router-link>
        <router-link to="/contact" class="mobile-nav-link" @click="closeMobileMenu">Contacto</router-link>

        <!-- User Menu (Mobile) -->
        <div v-if="authStore.isAuthenticated" class="border-t border-gray-200 pt-4 pb-3">
          <div class="px-5">
            <p class="text-base font-medium text-gray-800">{{ authStore.user?.displayName || 'Usuario' }}</p>
            <p class="text-sm font-medium text-gray-500">{{ authStore.user?.email }}</p>
          </div>
          <div class="mt-3 space-y-1">
            <router-link v-if="authStore.isSuperAdmin" to="/admin/dashboard" class="mobile-nav-link" @click="closeMobileMenu">Dashboard</router-link>
            <router-link v-if="authStore.isFarmaUser" to="/farma/dashboard" class="mobile-nav-link" @click="closeMobileMenu">Dashboard</router-link>
            <router-link to="/profile" class="mobile-nav-link" @click="closeMobileMenu">Mi Perfil</router-link>
            <a @click="handleLogout" class="mobile-nav-link cursor-pointer text-error">Cerrar Sesión</a>
          </div>
        </div>
        <router-link v-else to="/login" class="btn btn-primary mx-5 my-3" @click="closeMobileMenu">Iniciar Sesión</router-link>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';

const router = useRouter();
const authStore = useAuthStore();
const showDropdown = ref(false);
const mobileMenuOpen = ref(false);

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const closeDropdownOnOutsideClick = (event) => {
  if (!event.target.closest('.relative')) {
    showDropdown.value = false;
  }
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

const handleLogout = async () => {
  await authStore.logoutUser();
  closeMobileMenu();
  router.push('/login');
};

onMounted(() => {
  document.addEventListener('click', closeDropdownOnOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdownOnOutsideClick);
});
</script>

<style scoped>
.nav-link {
  @apply text-text-color font-medium hover:text-primary transition-colors duration-300;
}
.router-link-active.nav-link {
  @apply text-primary;
}
.dropdown-item {
  @apply block px-4 py-2 text-sm text-text-color hover:bg-secondary;
}
.mobile-nav-link {
  @apply block py-2 px-5 text-base font-medium text-text-color hover:bg-secondary hover:text-primary;
}
.btn {
    @apply inline-block px-4 py-2 rounded-md font-semibold text-center transition-colors duration-300;
}
.btn-primary {
    @apply bg-primary text-white hover:bg-primary-dark;
}
</style>

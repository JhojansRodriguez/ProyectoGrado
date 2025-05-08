<!-- Barra de navegación principal -->
<template>
  <nav class="navbar">
    <div class="container">
      <!-- Logo y nombre de la aplicación -->
      <router-link to="/" class="logo">PharmaLoc</router-link>
      
      <!-- Enlaces de navegación -->
      <div class="nav-links">
        <router-link to="/">Inicio</router-link>
        <router-link to="/pharmacies">Farmacias</router-link>
        <router-link to="/medicines">Medicamentos</router-link>
        <router-link to="/contact">Contacto</router-link>
      </div>

      <!-- Menú de usuario -->
      <div class="user-menu" v-if="authStore.isAuthenticated">
        <div class="dropdown">
          <button class="dropdown-toggle" @click="toggleDropdown">
            <span class="user-name">{{ authStore.user?.displayName || 'Usuario' }}</span>
            <i class="fas fa-chevron-down"></i>
          </button>
          
          <div class="dropdown-menu" :class="{ 'show': showDropdown }">
            <!-- Opciones para Super Admin -->
            <template v-if="authStore.isSuperAdmin">
              <router-link to="/admin/dashboard">
                <i class="fas fa-tachometer-alt"></i>
                Dashboard
              </router-link>
              <router-link to="/admin/users">
                <i class="fas fa-users"></i>
                Gestionar Usuarios
              </router-link>
              <router-link to="/admin/pharmacies">
                <i class="fas fa-clinic-medical"></i>
                Gestionar Farmacias
              </router-link>
            </template>

            <!-- Opciones para Farma User -->
            <template v-else-if="authStore.isFarmaUser">
              <router-link to="/farma/dashboard">
                <i class="fas fa-tachometer-alt"></i>
                Dashboard
              </router-link>
              <router-link to="/farma/medicines">
                <i class="fas fa-pills"></i>
                Mis Medicamentos
              </router-link>
              <router-link to="/farma/profile">
                <i class="fas fa-store"></i>
                Mi Farmacia
              </router-link>
            </template>

            <!-- Opciones para Usuario Regular -->
            <template v-else>
              <router-link to="/profile">
                <i class="fas fa-user"></i>
                Mi Perfil
              </router-link>
              <router-link to="/reviews">
                <i class="fas fa-star"></i>
                Mis Reseñas
              </router-link>
            </template>

            <!-- Opción de cerrar sesión para todos -->
            <div class="dropdown-divider"></div>
            <button @click="handleLogout" class="logout-button">
              <i class="fas fa-sign-out-alt"></i>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <!-- Botón de inicio de sesión -->
      <router-link 
        v-else 
        to="/login" 
        class="login-button"
      >
        <i class="fas fa-sign-in-alt"></i>
        Iniciar Sesión
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { onMounted, onUnmounted } from 'vue';

const router = useRouter();
const authStore = useAuthStore();
const showDropdown = ref(false);

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const closeDropdown = (event) => {
  if (!event.target.closest('.dropdown')) {
    showDropdown.value = false;
  }
};

const handleLogout = async () => {
  try {
    await authStore.logoutUser();
    router.push('/login');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};

// Event listeners para cerrar el dropdown al hacer clic fuera
onMounted(() => {
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
});
</script>

<style scoped>
.navbar {
  background: #FFFFFF;
  box-shadow: 0 2px 4px rgba(95, 127, 121, 0.1);
  padding: 1rem 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #5F7F79;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  text-decoration: none;
  color: #2D4739;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #5F7F79;
}

/* Estilos del menú de usuario */
.user-menu {
  position: relative;
}

.dropdown {
  position: relative;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 2px solid #5F7F79;
  border-radius: 8px;
  color: #5F7F79;
  cursor: pointer;
  transition: all 0.3s;
}

.dropdown-toggle:hover {
  background: #5F7F79;
  color: white;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-menu a,
.dropdown-menu button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  color: #2D4739;
  text-decoration: none;
  transition: background-color 0.3s;
  border-radius: 4px;
  width: 100%;
  text-align: left;
}

.dropdown-menu a:hover,
.dropdown-menu button:hover {
  background: #E8F1F2;
}

.dropdown-divider {
  height: 1px;
  background: #E8F1F2;
  margin: 0.5rem 0;
}

.logout-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #dc3545;
}

.logout-button:hover {
  background: #fde8e8 !important;
}

/* Botón de inicio de sesión */
.login-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #5F7F79;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.login-button:hover {
  background: #4a6561;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .container {
    justify-content: space-between;
  }

  .dropdown-menu {
    right: -20px;
  }
}
</style>

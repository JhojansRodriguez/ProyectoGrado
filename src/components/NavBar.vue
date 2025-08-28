
<template>
  <nav class="navbar">
    <div class="container">
      <!-- Logo y nombre de la aplicación -->
      <router-link to="/" class="logo">PharmaLoc</router-link>
      
      <!-- Botón hamburguesa para móviles -->
      <button
        class="hamburger"
        :class="{ open: mobileMenuOpen }"
        @click="toggleMobileMenu"
        aria-label="Abrir menú"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Enlaces de navegación -->
      <div
        class="nav-links"
        :class="{ 'show-mobile': mobileMenuOpen }"
      >
        <router-link to="/" @click="closeMobileMenu">Inicio</router-link>
        <router-link to="/pharmacies" @click="closeMobileMenu">Farmacias</router-link>
        <router-link to="/medicines" @click="closeMobileMenu">Medicamentos</router-link>
        <router-link to="/contact" @click="closeMobileMenu">Contacto</router-link>
        <!-- Menú de usuario en móvil -->
        <div
          class="user-menu mobile"
          v-if="authStore.isAuthenticated"
        >
          <div class="dropdown">
            <button class="dropdown-toggle" @click="toggleDropdown">
              <span class="user-name">{{ authStore.user?.displayName || 'Usuario' }}</span>
              <i class="fas fa-chevron-down"></i>
            </button>
            <div class="dropdown-menu" :class="{ 'show': showDropdown }">
              <template v-if="authStore.isSuperAdmin">
                <router-link to="/admin/dashboard" @click="closeMobileMenu">
                  <i class="fas fa-tachometer-alt"></i>
                  Dashboard
                </router-link>
                <router-link to="/admin/users" @click="closeMobileMenu">
                  <i class="fas fa-users"></i>
                  Gestionar Usuarios
                </router-link>
                <router-link to="/admin/pharmacies" @click="closeMobileMenu">
                  <i class="fas fa-clinic-medical"></i>
                  Gestionar Farmacias
                </router-link>
              </template>
              <template v-else-if="authStore.isFarmaUser">
                <router-link to="/farma/dashboard" @click="closeMobileMenu">
                  <i class="fas fa-tachometer-alt"></i>
                  Dashboard
                </router-link>
                <router-link to="/farma/medicines" @click="closeMobileMenu">
                  <i class="fas fa-pills"></i>
                  Mis Medicamentos
                </router-link>
                <router-link to="/farma/profile" @click="closeMobileMenu">
                  <i class="fas fa-store"></i>
                  Mi Farmacia
                </router-link>
              </template>
              <template v-else>
                <router-link to="/profile" @click="closeMobileMenu">
                  <i class="fas fa-user"></i>
                  Mi Perfil
                </router-link>
                <router-link to="/reviews" @click="closeMobileMenu">
                  <i class="fas fa-star"></i>
                  Mis Reseñas
                </router-link>
              </template>
              <div class="dropdown-divider"></div>
              <button @click="handleLogout" class="logout-button">
                <i class="fas fa-sign-out-alt"></i>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
        <router-link
          v-else
          to="/login"
          class="login-button mobile"
          @click="closeMobileMenu"
        >
          <i class="fas fa-sign-in-alt"></i>
          Iniciar Sesión
        </router-link>
      </div>

      <!-- Menú de usuario en escritorio -->
      <div class="user-menu desktop" v-if="authStore.isAuthenticated">
        <div class="dropdown">
          <button class="dropdown-toggle" @click="toggleDropdown">
            <span class="user-name">{{ authStore.user?.displayName || 'Usuario' }}</span>
            <i class="fas fa-chevron-down"></i>
          </button>
          <div class="dropdown-menu" :class="{ 'show': showDropdown }">
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
            <template v-else>
              <router-link to="/profile">
                <i class="fas fa-user"></i>
                Mi Perfil
              </router-link>  
            </template>
            <div class="dropdown-divider"></div>
            <button @click="handleLogout" class="logout-button">
              <i class="fas fa-sign-out-alt"></i>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
      <router-link
        v-else
        to="/login"
        class="login-button desktop"
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
const mobileMenuOpen = ref(false);

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const closeDropdown = (event) => {
  if (!event.target.closest('.dropdown')) {
    showDropdown.value = false;
  }
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
  if (!mobileMenuOpen.value) showDropdown.value = false;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
  showDropdown.value = false;
};

const handleLogout = async () => {
  try {
    await authStore.logoutUser();
    router.push('/login');
    closeMobileMenu();
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};

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
  position: relative;
}

/* Logo */
.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #5F7F79;
  text-decoration: none;
  z-index: 1101;
}

/* Hamburger */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 1101;
  padding: 0;
}
.hamburger span {
  display: block;
  height: 4px;
  width: 100%;
  background: #5F7F79;
  border-radius: 2px;
  margin: 4px 0;
  transition: all 0.3s;
}
.hamburger.open span:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}
.hamburger.open span:nth-child(2) {
  opacity: 0;
}
.hamburger.open span:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

/* Nav links */
.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
  transition: all 0.3s;
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

/* User menu */
.user-menu {
  position: relative;
}
.user-menu.mobile {
  display: none;
}
.user-menu.desktop {
  display: block;
}

/* Dropdown */
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
  z-index: 1102;
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
  background: none;
  border: none;
  font: inherit;
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
  cursor: pointer;
  font-size: 1rem;
  color: #dc3545;
}
.logout-button:hover {
  background: #fde8e8 !important;
}

/* Login button */
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
.login-button.mobile {
  display: none;
}
.login-button.desktop {
  display: flex;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .container {
    padding: 0 10px;
  }
  .nav-links {
    gap: 1.2rem;
  }
}

@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }
  .nav-links {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    background: #fff;
    box-shadow: 0 4px 12px rgba(95, 127, 121, 0.08);
    gap: 0;
    padding: 0.5rem 0;
    opacity: 0;
    pointer-events: none;
    transform: translateY(-10px);
    transition: all 0.3s;
    z-index: 1100;
  }
  .nav-links.show-mobile {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }
  .nav-links a,
  .nav-links .login-button.mobile {
    padding: 1rem 2rem;
    width: 100%;
    text-align: left;
    border-radius: 0;
    font-size: 1.1rem;
    border-bottom: 1px solid #E8F1F2;
  }
  .nav-links a:last-child,
  .nav-links .login-button.mobile:last-child {
    border-bottom: none;
  }
  .user-menu.desktop,
  .login-button.desktop {
    display: none !important;
  }
  .user-menu.mobile,
  .login-button.mobile {
    display: block !important;
    width: 100%;
  }
  .dropdown-menu {
    position: static;
    box-shadow: none;
    min-width: 0;
    padding: 0.2rem 0;
    border-radius: 0;
    background: #f8f8f8;
    margin-top: 0.2rem;
  }
  .dropdown-menu a,
  .dropdown-menu button {
    padding: 0.7rem 2.5rem;
    font-size: 1rem;
  }
}
</style>

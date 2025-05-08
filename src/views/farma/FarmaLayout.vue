<!-- Layout para usuarios de farmacia -->
<template>
  <div class="farma-layout">
    <!-- Barra lateral -->
    <aside class="sidebar" :class="{ 'collapsed': isSidebarCollapsed }">
      <div class="sidebar-header">
        <h2 v-if="!isSidebarCollapsed">Panel de Farmacia</h2>
        <button class="toggle-sidebar" @click="toggleSidebar">
          <i :class="isSidebarCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
        </button>
      </div>

      <!-- Información de la farmacia -->
      <div class="pharmacy-info" v-if="!isSidebarCollapsed">
        <div class="pharmacy-avatar">
          <img :src="authStore.user?.photo_url || '/placeholder-pharmacy.png'" :alt="authStore.user?.display_name">
        </div>
        <div class="pharmacy-details">
          <h3>{{ authStore.user?.display_name }}</h3>
          <p>{{ authStore.user?.farma_address }}</p>
        </div>
      </div>

      <!-- Menú de navegación -->
      <nav class="sidebar-nav">
        <router-link to="/farma/dashboard" class="nav-item">
          <i class="fas fa-tachometer-alt"></i>
          <span v-if="!isSidebarCollapsed">Dashboard</span>
        </router-link>
        
        <router-link to="/farma/medicines" class="nav-item">
          <i class="fas fa-pills"></i>
          <span v-if="!isSidebarCollapsed">Medicamentos</span>
        </router-link>
        
        <router-link to="/farma/profile" class="nav-item">
          <i class="fas fa-store"></i>
          <span v-if="!isSidebarCollapsed">Mi Farmacia</span>
        </router-link>
      </nav>
    </aside>

    <!-- Contenido principal -->
    <main class="main-content" :class="{ 'expanded': isSidebarCollapsed }">
      <!-- Barra superior -->
      <header class="top-bar">
        <div class="breadcrumb">
          <router-link to="/farma/dashboard">
            <i class="fas fa-home"></i>
          </router-link>
          <i class="fas fa-chevron-right"></i>
          <span>{{ currentRouteName }}</span>
        </div>

        <!-- Menú de usuario -->
        <div class="user-menu">
          <button class="user-menu-toggle" @click="toggleUserMenu">
            <span>{{ authStore.user?.display_name }}</span>
            <i class="fas fa-chevron-down"></i>
          </button>
          
          <div class="user-dropdown" v-if="showUserMenu">
            <router-link to="/farma/profile" class="dropdown-item">
              <i class="fas fa-user"></i>
              Mi Perfil
            </router-link>
            <div class="dropdown-divider"></div>
            <button @click="handleLogout" class="dropdown-item logout">
              <i class="fas fa-sign-out-alt"></i>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <!-- Contenido de la ruta actual -->
      <div class="content">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../store/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Estado local
const isSidebarCollapsed = ref(false);
const showUserMenu = ref(false);

// Nombre de la ruta actual
const currentRouteName = computed(() => {
  const routeNames = {
    'FarmaDashboard': 'Dashboard',
    'FarmaMedicines': 'Medicamentos',
    'FarmaProfile': 'Mi Farmacia'
  };
  return routeNames[route.name] || route.name;
});

// Métodos
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const closeUserMenu = (event) => {
  if (!event.target.closest('.user-menu')) {
    showUserMenu.value = false;
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

// Event listeners
onMounted(() => {
  document.addEventListener('click', closeUserMenu);
});

onUnmounted(() => {
  document.removeEventListener('click', closeUserMenu);
});
</script>

<style scoped>
.farma-layout {
  min-height: 100vh;
  display: flex;
}

/* Estilos de la barra lateral */
.sidebar {
  width: 260px;
  background: #2D4739;
  color: white;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.toggle-sidebar {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
}

.pharmacy-info {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.pharmacy-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 1rem;
}

.pharmacy-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pharmacy-details h3 {
  margin: 0;
  font-size: 1rem;
}

.pharmacy-details p {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  opacity: 0.7;
}

/* Estilos de la navegación lateral */
.sidebar-nav {
  padding: 1rem 0;
  flex-grow: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: white;
  text-decoration: none;
  transition: background-color 0.3s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-item.router-link-active {
  background: #5F7F79;
}

.nav-item i {
  width: 20px;
  text-align: center;
  margin-right: 1rem;
}

/* Estilos del contenido principal */
.main-content {
  flex-grow: 1;
  margin-left: 260px;
  transition: margin-left 0.3s;
}

.main-content.expanded {
  margin-left: 60px;
}

/* Estilos de la barra superior */
.top-bar {
  background: white;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

.breadcrumb a {
  color: #5F7F79;
  text-decoration: none;
}

/* Estilos del menú de usuario */
.user-menu {
  position: relative;
}

.user-menu-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #2D4739;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  margin-top: 0.5rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  color: #2D4739;
  text-decoration: none;
  transition: background-color 0.3s;
}

.dropdown-item:hover {
  background: #E8F1F2;
}

.dropdown-item.logout {
  color: #dc3545;
  width: 100%;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
}

.dropdown-item.logout:hover {
  background: #fde8e8;
}

.dropdown-divider {
  height: 1px;
  background: #E8F1F2;
  margin: 0.5rem 0;
}

/* Estilos del contenido */
.content {
  padding: 1.5rem;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    height: 100vh;
    z-index: 1000;
    transform: translateX(0);
    transition: transform 0.3s;
  }

  .sidebar.collapsed {
    transform: translateX(-100%);
  }

  .main-content {
    margin-left: 0 !important;
  }
}
</style>

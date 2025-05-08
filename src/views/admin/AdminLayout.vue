<!-- Layout para el panel de administración -->
<template>
  <div class="admin-layout">
    <!-- Barra lateral -->
    <aside class="sidebar" :class="{ 'collapsed': isSidebarCollapsed }">
      <div class="sidebar-header">
        <h2 v-if="!isSidebarCollapsed">Panel de Administración</h2>
        <button class="toggle-sidebar" @click="toggleSidebar">
          <i :class="isSidebarCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
        </button>
      </div>

      <!-- Información del administrador -->
      <div class="admin-info" v-if="!isSidebarCollapsed">
        <div class="admin-avatar">
          <img :src="authStore.user?.photo_url || '/placeholder-admin.png'" :alt="authStore.user?.display_name">
        </div>
        <div class="admin-details">
          <h3>{{ authStore.user?.display_name }}</h3>
          <span class="admin-role">Super Administrador</span>
        </div>
      </div>

      <!-- Menú de navegación -->
      <nav class="sidebar-nav">
        <router-link to="/admin/dashboard" class="nav-item">
          <i class="fas fa-tachometer-alt"></i>
          <span v-if="!isSidebarCollapsed">Dashboard</span>
        </router-link>
        
        <router-link to="/admin/users" class="nav-item">
          <i class="fas fa-users"></i>
          <span v-if="!isSidebarCollapsed">Usuarios</span>
        </router-link>
        
        <router-link to="/admin/pharmacies" class="nav-item">
          <i class="fas fa-clinic-medical"></i>
          <span v-if="!isSidebarCollapsed">Farmacias</span>
        </router-link>

        <router-link to="/admin/medicines" class="nav-item">
          <i class="fas fa-pills"></i>
          <span v-if="!isSidebarCollapsed">Medicamentos</span>
        </router-link>

        <router-link to="/admin/reviews" class="nav-item">
          <i class="fas fa-star"></i>
          <span v-if="!isSidebarCollapsed">Reseñas</span>
        </router-link>

        <router-link to="/admin/settings" class="nav-item">
          <i class="fas fa-cog"></i>
          <span v-if="!isSidebarCollapsed">Configuración</span>
        </router-link>
      </nav>
    </aside>

    <!-- Contenido principal -->
    <main class="main-content" :class="{ 'expanded': isSidebarCollapsed }">
      <!-- Barra superior -->
      <header class="top-bar">
        <div class="breadcrumb">
          <router-link to="/admin/dashboard">
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
            <router-link to="/admin/profile" class="dropdown-item">
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
    'AdminDashboard': 'Dashboard',
    'AdminUsers': 'Gestión de Usuarios',
    'AdminPharmacies': 'Gestión de Farmacias',
    'AdminMedicines': 'Gestión de Medicamentos',
    'AdminReviews': 'Gestión de Reseñas',
    'AdminSettings': 'Configuración'
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
.admin-layout {
  min-height: 100vh;
  display: flex;
}

/* Estilos de la barra lateral */
.sidebar {
  width: 260px;
  background: #1a1c23;
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
  color: #5F7F79;
}

.toggle-sidebar {
  background: none;
  border: none;
  color: #5F7F79;
  cursor: pointer;
  padding: 0.5rem;
}

.admin-info {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 1rem;
}

.admin-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.admin-details h3 {
  margin: 0;
  font-size: 1rem;
  color: white;
}

.admin-role {
  font-size: 0.9rem;
  color: #5F7F79;
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
  color: #a0aec0;
  text-decoration: none;
  transition: all 0.3s;
}

.nav-item:hover {
  background: rgba(95, 127, 121, 0.1);
  color: white;
}

.nav-item.router-link-active {
  background: #5F7F79;
  color: white;
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
  background: #f7fafc;
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

  .top-bar {
    padding: 1rem;
  }
}
</style>

<!-- Vista de gestión de usuarios -->
<template>
  <div class="users-management">
    <div class="page-header">
      <h1>Gestión de Usuarios</h1>
      <button class="btn-add" @click="showAddModal = true">
        <i class="fas fa-user-plus"></i>
        Agregar Usuario
      </button>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="filters-section">
      <div class="search-bar">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Buscar usuario por nombre o correo..."
          @input="filterUsers"
        >
      </div>

      <div class="filter-options">
        <select v-model="roleFilter" @change="filterUsers">
          <option value="all">Todos los roles</option>
          <option value="super_admin">Super Administrador</option>
          <option value="farma_user">Usuario Farmacia</option>
          <option value="user">Usuario Regular</option>
        </select>

        <select v-model="statusFilter" @change="filterUsers">
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>
    </div>

    <!-- Tabla de usuarios -->
    <div class="users-table-container">
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Cargando usuarios...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button @click="loadUsers" class="btn-retry">
          Reintentar
        </button>
      </div>

      <div v-else-if="filteredUsers.length === 0" class="empty-state">
        <i class="fas fa-users"></i>
        <p>No se encontraron usuarios</p>
      </div>

      <table v-else class="users-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Fecha Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td class="user-cell">
              <img 
                :src="user.photo_url || '/placeholder-user.png'" 
                :alt="user.display_name"
                class="user-avatar"
              >
              <div class="user-info">
                <span class="user-name">{{ user.display_name }}</span>
                <span class="user-phone">{{ user.phone_number || 'No registrado' }}</span>
              </div>
            </td>
            <td>{{ user.email }}</td>
            <td>
              <span class="role-badge" :class="user.role">
                {{ getRoleName(user.role) }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="{ active: user.is_active }">
                {{ user.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td class="actions-cell">
              <button class="btn-icon" @click="editUser(user)" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button 
                class="btn-icon" 
                @click="toggleUserStatus(user)"
                :title="user.is_active ? 'Desactivar' : 'Activar'"
              >
                <i :class="user.is_active ? 'fas fa-ban' : 'fas fa-check'"></i>
              </button>
              <button class="btn-icon delete" @click="confirmDelete(user)" title="Eliminar">
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para agregar/editar usuario -->
    <div v-if="showAddModal || editingUser" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ editingUser ? 'Editar' : 'Agregar' }} Usuario</h2>
          <button class="btn-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="user-form">
          <div class="form-group">
            <label for="displayName">Nombre Completo</label>
            <input 
              id="displayName"
              v-model="userForm.display_name"
              type="text"
              required
            >
          </div>

          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input 
              id="email"
              v-model="userForm.email"
              type="email"
              required
              :readonly="!!editingUser"
            >
          </div>

          <div class="form-group" v-if="!editingUser">
            <label for="password">Contraseña</label>
            <input 
              id="password"
              v-model="userForm.password"
              type="password"
              required
              minlength="6"
            >
          </div>

          <div class="form-group">
            <label for="phone">Teléfono</label>
            <input 
              id="phone"
              v-model="userForm.phone_number"
              type="tel"
            >
          </div>

          <div class="form-group">
            <label for="role">Rol</label>
            <select 
              id="role"
              v-model="userForm.role"
              required
            >
              <option value="user">Usuario Regular</option>
              <option value="farma_user">Usuario Farmacia</option>
              <option value="super_admin">Super Administrador</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeModal">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear Usuario') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de confirmación para eliminar -->
    <div v-if="userToDelete" class="modal-overlay">
      <div class="modal-content confirm-dialog">
        <div class="modal-header">
          <h2>Confirmar Eliminación</h2>
          <button class="btn-close" @click="userToDelete = null">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="confirm-body">
          <i class="fas fa-exclamation-triangle"></i>
          <p>¿Estás seguro de que deseas eliminar al usuario "{{ userToDelete.display_name }}"?</p>
          <p class="warning">Esta acción no se puede deshacer.</p>
        </div>

        <div class="confirm-actions">
          <button class="btn-secondary" @click="userToDelete = null">
            Cancelar
          </button>
          <button 
            class="btn-danger" 
            @click="deleteUser" 
            :disabled="deleting"
          >
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Mensaje de estado -->
    <div v-if="statusMessage" :class="['status-message', statusMessage.type]">
      {{ statusMessage.text }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';
import { db } from '../../firebase/config';

// Estado
const users = ref([]);
const filteredUsers = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');
const roleFilter = ref('all');
const statusFilter = ref('all');
const showAddModal = ref(false);
const editingUser = ref(null);
const userToDelete = ref(null);
const submitting = ref(false);
const deleting = ref(false);
const statusMessage = ref(null);

// Formulario
const userForm = ref({
  display_name: '',
  email: '',
  password: '',
  phone_number: '',
  role: 'user',
  is_active: true
});

// Cargar usuarios
const loadUsers = async () => {
  try {
    loading.value = true;
    error.value = null;
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    users.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    filterUsers();
  } catch (err) {
    error.value = 'Error al cargar los usuarios';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Filtrar usuarios
const filterUsers = () => {
  let filtered = [...users.value];

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(user => 
      user.display_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  }

  // Filtrar por rol
  if (roleFilter.value !== 'all') {
    filtered = filtered.filter(user => user.role === roleFilter.value);
  }

  // Filtrar por estado
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(user => 
      statusFilter.value === 'active' ? user.is_active : !user.is_active
    );
  }

  filteredUsers.value = filtered;
};

// Gestión de usuarios
const editUser = (user) => {
  editingUser.value = user;
  userForm.value = {
    display_name: user.display_name,
    email: user.email,
    phone_number: user.phone_number,
    role: user.role,
    is_active: user.is_active
  };
  showAddModal.value = true;
};

const closeModal = () => {
  showAddModal.value = false;
  editingUser.value = null;
  userForm.value = {
    display_name: '',
    email: '',
    password: '',
    phone_number: '',
    role: 'user',
    is_active: true
  };
};

const handleSubmit = async () => {
  try {
    submitting.value = true;
    
    if (editingUser.value) {
      // Actualizar usuario existente
      const userRef = doc(db, 'users', editingUser.value.id);
      await updateDoc(userRef, {
        display_name: userForm.value.display_name,
        phone_number: userForm.value.phone_number,
        role: userForm.value.role,
        updated_at: serverTimestamp()
      });
    } else {
      // Crear nuevo usuario
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userForm.value.email,
        userForm.value.password
      );

      await addDoc(collection(db, 'users'), {
        uid: userCredential.user.uid,
        display_name: userForm.value.display_name,
        email: userForm.value.email,
        phone_number: userForm.value.phone_number,
        role: userForm.value.role,
        is_active: true,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
    }

    showStatus('success', `Usuario ${editingUser.value ? 'actualizado' : 'creado'} correctamente`);
    closeModal();
    await loadUsers();
  } catch (error) {
    console.error('Error:', error);
    showStatus('error', `Error al ${editingUser.value ? 'actualizar' : 'crear'} usuario`);
  } finally {
    submitting.value = false;
  }
};

const toggleUserStatus = async (user) => {
  try {
    const userRef = doc(db, 'users', user.id);
    await updateDoc(userRef, {
      is_active: !user.is_active,
      updated_at: serverTimestamp()
    });
    
    showStatus('success', `Usuario ${user.is_active ? 'desactivado' : 'activado'} correctamente`);
    await loadUsers();
  } catch (error) {
    console.error('Error:', error);
    showStatus('error', 'Error al cambiar el estado del usuario');
  }
};

const confirmDelete = (user) => {
  userToDelete.value = user;
};

const deleteUser = async () => {
  if (!userToDelete.value) return;

  try {
    deleting.value = true;
    const userRef = doc(db, 'users', userToDelete.value.id);
    await deleteDoc(userRef);
    
    showStatus('success', 'Usuario eliminado correctamente');
    userToDelete.value = null;
    await loadUsers();
  } catch (error) {
    console.error('Error:', error);
    showStatus('error', 'Error al eliminar usuario');
  } finally {
    deleting.value = false;
  }
};

// Utilidades
const getRoleName = (role) => {
  const roles = {
    super_admin: 'Super Admin',
    farma_user: 'Farmacia',
    user: 'Usuario'
  };
  return roles[role] || role;
};

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const showStatus = (type, text) => {
  statusMessage.value = { type, text };
  setTimeout(() => {
    statusMessage.value = null;
  }, 3000);
};

// Cargar datos iniciales
onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.users-management {
  padding: 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  color: #2D4739;
}

/* Filtros */
.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-bar {
  flex: 1;
  min-width: 300px;
  position: relative;
}

.search-bar i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #5F7F79;
}

.search-bar input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #E8F1F2;
  border-radius: 8px;
  font-size: 1rem;
}

.filter-options {
  display: flex;
  gap: 1rem;
}

select {
  padding: 0.75rem 1rem;
  border: 2px solid #E8F1F2;
  border-radius: 8px;
  background: white;
  color: #2D4739;
  min-width: 200px;
}

/* Tabla de usuarios */
.users-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #E8F1F2;
}

.users-table th {
  background: #f8f9fa;
  color: #2D4739;
  font-weight: 600;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  color: #2D4739;
  font-weight: 500;
}

.user-phone {
  color: #666;
  font-size: 0.9rem;
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
}

.role-badge.super_admin {
  background: #cce5ff;
  color: #004085;
}

.role-badge.farma_user {
  background: #d4edda;
  color: #155724;
}

.role-badge.user {
  background: #e2e3e5;
  color: #383d41;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
  background: #fde8e8;
  color: #dc3545;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  color: #5F7F79;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
}

.btn-icon:hover {
  background: #E8F1F2;
}

.btn-icon.delete {
  color: #dc3545;
}

.btn-icon.delete:hover {
  background: #fde8e8;
}

/* Estados de carga y error */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.loading-state i,
.error-state i,
.empty-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
  display: block;
}

.error-state {
  color: #dc3545;
}

/* Botones */
.btn-add,
.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-add {
  background: #5F7F79;
  color: white;
  border: none;
}

.btn-add:hover {
  background: #4a6561;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #E8F1F2;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #2D4739;
}

.btn-close {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
}

/* Formulario */
.user-form {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2D4739;
  font-weight: 500;
}

input, select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #E8F1F2;
  border-radius: 8px;
  font-size: 1rem;
}

input:focus, select:focus {
  outline: none;
  border-color: #5F7F79;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

/* Mensaje de estado */
.status-message {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 2rem;
  border-radius: 8px;
  animation: slideIn 0.3s ease-out;
}

.status-message.success {
  background: #d4edda;
  color: #155724;
}

.status-message.error {
  background: #f8d7da;
  color: #721c24;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .filters-section {
    flex-direction: column;
  }

  .search-bar {
    min-width: 100%;
  }

  .filter-options {
    flex-direction: column;
  }

  select {
    width: 100%;
  }

  .users-table {
    display: block;
    overflow-x: auto;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>

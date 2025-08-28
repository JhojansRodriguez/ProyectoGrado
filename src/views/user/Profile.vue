<!-- Vista de perfil de usuario regular -->
<template>
  <div class="profile">
    <div class="profile-header">
      <h1>Mi Perfil</h1>
      <button class="btn-edit" @click="enableEditing" v-if="!isEditing">
        <i class="fas fa-edit"></i>
        Editar Perfil
      </button>
    </div>

    <div class="profile-content">
      <!-- Formulario de perfil -->
      <form @submit.prevent="handleSubmit" class="profile-form">
        <!-- Foto de perfil -->
        <div class="photo-section">
          <div class="photo-container">
            <img 
              :src="formData.photo_url || '/placeholder-user.png'" 
              :alt="formData.display_name"
              class="profile-photo"
            >
            <div class="photo-overlay" v-if="isEditing">
              <input 
                type="file" 
                ref="photoInput"
                accept="image/*"
                @change="handlePhotoChange"
                class="photo-input"
              >
              <i class="fas fa-camera"></i>
              <span>Cambiar foto</span>
            </div>
          </div>
        </div>

        <!-- Información personal -->
        <div class="form-section">
          <h2>Información Personal</h2>
          
          <div class="form-group">
            <label for="displayName">Nombre Completo</label>
            <input 
              id="displayName"
              v-model="formData.display_name"
              type="text"
              :readonly="!isEditing"
              required
            >
          </div>

          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input 
              id="email"
              v-model="formData.email"
              type="email"
              readonly
            >
          </div>

          <div class="form-group">
            <label for="phone">Teléfono</label>
            <input 
              id="phone"
              v-model="formData.phone_number"
              type="tel"
              :readonly="!isEditing"
            >
          </div>
        </div>

        <!-- Preferencias -->
        <div class="form-section">
          <h2>Preferencias</h2>
          
          <div class="form-group">
            <label for="notifications">Notificaciones</label>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox"
                  v-model="formData.preferences.emailNotifications"
                  :disabled="!isEditing"
                >
                Recibir notificaciones por correo
              </label>
              <label class="checkbox-label">
                <input 
                  type="checkbox"
                  v-model="formData.preferences.stockAlerts"
                  :disabled="!isEditing"
                >
                Alertas de disponibilidad de medicamentos
              </label>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="form-actions" v-if="isEditing">
          <button type="button" class="btn-secondary" @click="cancelEditing">
            Cancelar
          </button>
          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </form>

      <!-- Sección de reseñas 
      <div class="reviews-section">
        <h2>Mis Reseñas</h2>
        <div v-if="loadingReviews" class="loading">
          <i class="fas fa-spinner fa-spin"></i>
          Cargando reseñas...
        </div>
        <div v-else-if="reviews.length === 0" class="empty-state">
          <i class="fas fa-star"></i>
          <p>Aún no has realizado ninguna reseña</p>
          <router-link to="/pharmacies" class="btn-primary">
            Explorar Farmacias
          </router-link>
        </div>
        <div v-else class="reviews-list">
          <div v-for="review in reviews" :key="review.id" class="review-card">
            <div class="review-header">
              <h3>{{ review.pharmacyName }}</h3>
              <div class="review-rating">
                <i v-for="n in 5" 
                   :key="n" 
                   class="fas fa-star"
                   :class="{ 'active': n <= review.rating }"
                ></i>
              </div>
            </div>
            <p class="review-text">{{ review.comment }}</p>
            <span class="review-date">{{ formatDate(review.created_at) }}</span>
          </div>
        </div>
      </div>-->
    </div>

    <!-- Mensaje de estado -->
    <div v-if="statusMessage" :class="['status-message', statusMessage.type]">
      {{ statusMessage.text }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../store/auth';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const authStore = useAuthStore();
const isEditing = ref(false);
const loading = ref(false);
const loadingReviews = ref(true);
const statusMessage = ref(null);
const reviews = ref([]);

// Datos del formulario
const formData = ref({
  display_name: '',
  email: '',
  phone_number: '',
  photo_url: '',
  preferences: {
    emailNotifications: false,
    stockAlerts: false
  }
});

// Cargar datos del usuario y reseñas
onMounted(async () => {
  const userData = authStore.user;
  if (userData) {
    formData.value = {
      display_name: userData.display_name || '',
      email: userData.email || '',
      phone_number: userData.phone_number || '',
      photo_url: userData.photo_url || '',
      preferences: userData.preferences || {
        emailNotifications: false,
        stockAlerts: false
      }
    };
  }
  await loadUserReviews();
});

// Métodos
const loadUserReviews = async () => {
  try {
    loadingReviews.value = true;
    // TODO: Implementar carga de reseñas desde Firestore
    reviews.value = [];
  } catch (error) {
    console.error('Error al cargar reseñas:', error);
  } finally {
    loadingReviews.value = false;
  }
};

const enableEditing = () => {
  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
  const userData = authStore.user;
  if (userData) {
    formData.value = {
      display_name: userData.display_name || '',
      email: userData.email || '',
      phone_number: userData.phone_number || '',
      photo_url: userData.photo_url || '',
      preferences: userData.preferences || {
        emailNotifications: false,
        stockAlerts: false
      }
    };
  }
};

const handlePhotoChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const storage = getStorage();
    const fileRef = storageRef(storage, `user-photos/${authStore.user.uid}/${file.name}`);
    
    await uploadBytes(fileRef, file);
    const photoUrl = await getDownloadURL(fileRef);
    formData.value.photo_url = photoUrl;
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    showStatus('error', 'Error al subir la imagen. Por favor, intenta nuevamente.');
  }
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    const userRef = doc(db, 'users', authStore.user.uid);
    
    await updateDoc(userRef, {
      display_name: formData.value.display_name,
      phone_number: formData.value.phone_number,
      photo_url: formData.value.photo_url,
      preferences: formData.value.preferences
    });

    showStatus('success', 'Perfil actualizado correctamente');
    isEditing.value = false;
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    showStatus('error', 'Error al actualizar el perfil. Por favor, intenta nuevamente.');
  } finally {
    loading.value = false;
  }
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-ES', {
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
</script>

<style scoped>
.profile {
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.profile-header h1 {
  margin: 0;
  color: #2D4739;
}

/* Sección de foto */
.photo-section {
  text-align: center;
  margin-bottom: 2rem;
}

.photo-container {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto;
  border-radius: 50%;
  overflow: hidden;
}

.profile-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s;
}

.photo-container:hover .photo-overlay {
  opacity: 1;
}

.photo-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

/* Formulario */
.profile-form {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
}

.form-section {
  padding: 1.5rem;
  border-bottom: 1px solid #E8F1F2;
}

.form-section:last-child {
  border-bottom: none;
}

.form-section h2 {
  color: #2D4739;
  font-size: 1.25rem;
  margin: 0 0 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2D4739;
  font-weight: 500;
}

input[type="text"],
input[type="email"],
input[type="tel"] {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #E8F1F2;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #5F7F79;
}

input:read-only {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

/* Checkboxes */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
}

/* Botones */
.btn-edit,
.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.btn-edit {
  background: #5F7F79;
  color: white;
  border: none;
}

.btn-edit:hover {
  background: #4a6561;
}

.form-actions {
  padding: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background: #f8f9fa;
}

.btn-primary {
  background: #5F7F79;
  color: white;
  border: none;
  text-decoration: none;
}

.btn-primary:hover:not(:disabled) {
  background: #4a6561;
}

.btn-secondary {
  background: white;
  color: #5F7F79;
  border: 2px solid #5F7F79;
}

.btn-secondary:hover {
  background: #E8F1F2;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Sección de reseñas */
.reviews-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.reviews-section h2 {
  color: #2D4739;
  font-size: 1.25rem;
  margin: 0 0 1.5rem;
}

.reviews-list {
  display: grid;
  gap: 1rem;
}

.review-card {
  padding: 1rem;
  border: 1px solid #E8F1F2;
  border-radius: 8px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.review-header h3 {
  margin: 0;
  color: #2D4739;
}

.review-rating i {
  color: #ddd;
  font-size: 0.9rem;
}

.review-rating i.active {
  color: #ffc107;
}

.review-text {
  color: #666;
  margin: 0.5rem 0;
}

.review-date {
  color: #999;
  font-size: 0.8rem;
}

/* Estados de carga y vacío */
.loading, .empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.loading i {
  margin-right: 0.5rem;
}

.empty-state i {
  font-size: 2rem;
  color: #B8D8D0;
  margin-bottom: 1rem;
}

.empty-state p {
  margin-bottom: 1rem;
}

/* Mensajes de estado */
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

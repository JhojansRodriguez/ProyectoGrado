<!-- Vista de perfil de farmacia -->
<template>
  <div class="profile">
    <div class="profile-header">
      <h1>Perfil de la Farmacia</h1>
      <button class="btn-edit" @click="enableEditing" v-if="!isEditing">
        <i class="fas fa-edit"></i>
        Editar Perfil
      </button>
    </div>

    <div class="profile-content">
      <!-- Formulario de perfil -->
      <form @submit.prevent="handleSubmit" class="profile-form">
        <!-- Imagen de la farmacia -->
        <div class="photo-section">
          <div class="photo-container">
            <img 
              :src="formData.photo_url || '/placeholder-pharmacy.png'" 
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

        <!-- Información básica -->
        <div class="form-section">
          <h2>Información Básica</h2>
          
          <div class="form-group">
            <label for="displayName">Nombre de la Farmacia</label>
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
              required
            >
          </div>
        </div>

        <!-- Ubicación -->
        <div class="form-section">
          <h2>Ubicación</h2>
          
          <div class="form-group">
            <label for="address">Dirección</label>
            <input 
              id="address"
              v-model="formData.farma_address"
              type="text"
              :readonly="!isEditing"
              required
            >
          </div>

          <div class="form-group">
            <label>Coordenadas</label>
            <div class="coordinates-input">
              <input 
                v-model="formData.farma_location[0]"
                type="number"
                step="any"
                placeholder="Latitud"
                :readonly="!isEditing"
                required
              >
              <input 
                v-model="formData.farma_location[1]"
                type="number"
                step="any"
                placeholder="Longitud"
                :readonly="!isEditing"
                required
              >
            </div>
          </div>
        </div>

        <!-- Horario -->
        <div class="form-section">
          <h2>Horario de Atención</h2>
          
          <div class="schedule-inputs">
            <div class="form-group">
              <label for="openHrs">Hora de Apertura</label>
              <input 
                id="openHrs"
                v-model="formData.open_hrs"
                type="time"
                :readonly="!isEditing"
                required
              >
            </div>

            <div class="form-group">
              <label for="closeHrs">Hora de Cierre</label>
              <input 
                id="closeHrs"
                v-model="formData.close_hrs"
                type="time"
                :readonly="!isEditing"
                required
              >
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
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const authStore = useAuthStore();
const isEditing = ref(false);
const loading = ref(false);
const statusMessage = ref(null);
const photoInput = ref(null);

// Datos del formulario
const formData = ref({
  display_name: '',
  email: '',
  phone_number: '',
  farma_address: '',
  farma_location: [0, 0],
  open_hrs: '',
  close_hrs: '',
  photo_url: ''
});

// Cargar datos del usuario
onMounted(() => {
  const userData = authStore.user;
  if (userData) {
    formData.value = {
      display_name: userData.display_name || '',
      email: userData.email || '',
      phone_number: userData.phone_number || '',
      farma_address: userData.farma_address || '',
      farma_location: userData.farma_location || [0, 0],
      open_hrs: userData.open_hrs || '08:00',
      close_hrs: userData.close_hrs || '20:00',
      photo_url: userData.photo_url || ''
    };
  }
});

// Métodos
const enableEditing = () => {
  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
  // Restaurar datos originales
  const userData = authStore.user;
  if (userData) {
    formData.value = {
      display_name: userData.display_name || '',
      email: userData.email || '',
      phone_number: userData.phone_number || '',
      farma_address: userData.farma_address || '',
      farma_location: userData.farma_location || [0, 0],
      open_hrs: userData.open_hrs || '08:00',
      close_hrs: userData.close_hrs || '20:00',
      photo_url: userData.photo_url || ''
    };
  }
};

const handlePhotoChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const storage = getStorage();
    const fileRef = storageRef(storage, `pharmacy-photos/${authStore.user.uid}/${file.name}`);
    
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
    const userRef = doc(db, 'farma_user', authStore.user.uid);
    
    await updateDoc(userRef, {
      display_name: formData.value.display_name,
      phone_number: formData.value.phone_number,
      farma_address: formData.value.farma_address,
      farma_location: formData.value.farma_location,
      open_hrs: formData.value.open_hrs,
      close_hrs: formData.value.close_hrs,
      photo_url: formData.value.photo_url
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

input {
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

.coordinates-input {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.schedule-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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
  .coordinates-input,
  .schedule-inputs {
    grid-template-columns: 1fr;
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

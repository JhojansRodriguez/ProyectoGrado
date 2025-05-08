<!-- Vista de gestión de reseñas para usuarios -->
<template>
  <div class="reviews-management">
    <div class="page-header">
      <h1>Mis Reseñas</h1>
    </div>

    <div class="reviews-content">
      <!-- Estado de carga -->
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Cargando reseñas...</p>
      </div>

      <!-- Estado de error -->
      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button @click="loadReviews" class="btn-retry">
          Reintentar
        </button>
      </div>

      <!-- Sin reseñas -->
      <div v-else-if="reviews.length === 0" class="empty-state">
        <i class="fas fa-star"></i>
        <p>Aún no has realizado ninguna reseña</p>
        <router-link to="/pharmacies" class="btn-primary">
          <i class="fas fa-search"></i>
          Explorar Farmacias
        </router-link>
      </div>

      <!-- Lista de reseñas -->
      <div v-else class="reviews-grid">
        <div v-for="review in reviews" :key="review.id" class="review-card">
          <div class="review-header">
            <div class="pharmacy-info">
              <img 
                :src="review.pharmacyPhoto || '/placeholder-pharmacy.png'" 
                :alt="review.pharmacyName"
                class="pharmacy-photo"
              >
              <div>
                <h3>{{ review.pharmacyName }}</h3>
                <p class="pharmacy-address">{{ review.pharmacyAddress }}</p>
              </div>
            </div>
            <div class="review-actions">
              <button @click="editReview(review)" class="btn-icon">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="confirmDelete(review)" class="btn-icon delete">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>

          <div class="review-body">
            <div class="rating">
              <i v-for="n in 5" 
                 :key="n" 
                 class="fas fa-star"
                 :class="{ 'active': n <= review.rating }"
              ></i>
            </div>
            <p class="review-text">{{ review.comment }}</p>
            <div class="review-meta">
              <span class="review-date">
                <i class="fas fa-calendar-alt"></i>
                {{ formatDate(review.created_at) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para editar reseña -->
    <div v-if="editingReview" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Editar Reseña</h2>
          <button class="btn-close" @click="closeEditModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="review-form">
          <div class="form-group">
            <label>Calificación</label>
            <div class="rating-input">
              <button 
                v-for="n in 5" 
                :key="n"
                type="button"
                class="rating-star"
                :class="{ 'active': n <= reviewForm.rating }"
                @click="reviewForm.rating = n"
              >
                <i class="fas fa-star"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="comment">Comentario</label>
            <textarea 
              id="comment"
              v-model="reviewForm.comment"
              required
              rows="4"
              placeholder="Comparte tu experiencia..."
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeEditModal">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de confirmación para eliminar -->
    <div v-if="reviewToDelete" class="modal-overlay">
      <div class="modal-content confirm-dialog">
        <div class="modal-header">
          <h2>Confirmar Eliminación</h2>
          <button class="btn-close" @click="reviewToDelete = null">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="confirm-body">
          <i class="fas fa-exclamation-triangle"></i>
          <p>¿Estás seguro de que deseas eliminar esta reseña?</p>
          <p class="warning">Esta acción no se puede deshacer.</p>
        </div>

        <div class="confirm-actions">
          <button class="btn-secondary" @click="reviewToDelete = null">
            Cancelar
          </button>
          <button 
            class="btn-danger" 
            @click="deleteReview" 
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
import { useAuthStore } from '../../store/auth';
import { db } from '../../firebase/config';

const loading = ref(true);
const statusMessage = ref(null);
const error = ref(null);
const reviews = ref([]);
const editingReview = ref(null);
const reviewToDelete = ref(null);
const submitting = ref(false);
const deleting = ref(false);

// Formulario de reseña
const reviewForm = ref({
  rating: 0,
  comment: ''
});

// Cargar reseñas del usuario
const loadReviews = async () => {
  try {
    loading.value = true;
    error.value = null;
    // TODO: Implementar carga de reseñas desde Firestore
    reviews.value = [];
  } catch (err) {
    error.value = 'Error al cargar las reseñas. Por favor, intenta nuevamente.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Editar reseña
const editReview = (review) => {
  editingReview.value = review;
  reviewForm.value = {
    rating: review.rating,
    comment: review.comment
  };
};

const closeEditModal = () => {
  editingReview.value = null;
  reviewForm.value = {
    rating: 0,
    comment: ''
  };
};

const handleSubmit = async () => {
  if (!editingReview.value) return;

  try {
    submitting.value = true;
    // TODO: Implementar actualización de reseña en Firestore
    showStatus('success', 'Reseña actualizada correctamente');
    closeEditModal();
    await loadReviews();
  } catch (error) {
    console.error('Error al actualizar reseña:', error);
    showStatus('error', 'Error al actualizar la reseña. Por favor, intenta nuevamente.');
  } finally {
    submitting.value = false;
  }
};

// Eliminar reseña
const confirmDelete = (review) => {
  reviewToDelete.value = review;
};

const deleteReview = async () => {
  if (!reviewToDelete.value) return;

  try {
    deleting.value = true;
    // TODO: Implementar eliminación de reseña en Firestore
    showStatus('success', 'Reseña eliminada correctamente');
    reviewToDelete.value = null;
    await loadReviews();
  } catch (error) {
    console.error('Error al eliminar reseña:', error);
    showStatus('error', 'Error al eliminar la reseña. Por favor, intenta nuevamente.');
  } finally {
    deleting.value = false;
  }
};

// Utilidades
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

// Cargar datos iniciales
onMounted(() => {
  loadReviews();
});
</script>

<style scoped>
.reviews-management {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  color: #2D4739;
  margin: 0;
}

/* Grid de reseñas */
.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.review-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.review-header {
  padding: 1rem;
  border-bottom: 1px solid #E8F1F2;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.pharmacy-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.pharmacy-photo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.pharmacy-info h3 {
  margin: 0;
  color: #2D4739;
  font-size: 1.1rem;
}

.pharmacy-address {
  margin: 0.25rem 0 0;
  color: #666;
  font-size: 0.9rem;
}

.review-actions {
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

.review-body {
  padding: 1rem;
}

.rating {
  margin-bottom: 0.5rem;
}

.rating i {
  color: #ddd;
  font-size: 1rem;
}

.rating i.active {
  color: #ffc107;
}

.review-text {
  color: #2D4739;
  margin: 0 0 1rem;
  line-height: 1.5;
}

.review-meta {
  color: #666;
  font-size: 0.9rem;
}

.review-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.btn-retry {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #5F7F79;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
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

/* Formulario de reseña */
.review-form {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.rating-input {
  display: flex;
  gap: 0.5rem;
}

.rating-star {
  background: none;
  border: none;
  color: #ddd;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0.25rem;
}

.rating-star.active {
  color: #ffc107;
}

textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #E8F1F2;
  border-radius: 8px;
  resize: vertical;
}

/* Botones */
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
  transition: all 0.3s;
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

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Diálogo de confirmación */
.confirm-dialog {
  max-width: 400px;
}

.confirm-body {
  padding: 2rem;
  text-align: center;
}

.confirm-body i {
  font-size: 3rem;
  color: #ffc107;
  margin-bottom: 1rem;
}

.confirm-body .warning {
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.confirm-actions {
  padding: 1rem;
  border-top: 1px solid #E8F1F2;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
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
  .reviews-grid {
    grid-template-columns: 1fr;
  }

  .confirm-actions {
    flex-direction: column-reverse;
  }

  .btn-primary,
  .btn-secondary,
  .btn-danger {
    width: 100%;
    justify-content: center;
  }
}
</style>

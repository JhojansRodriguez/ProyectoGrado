
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
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  orderBy
} from 'firebase/firestore';

const loading = ref(true);
const statusMessage = ref(null);
const error = ref(null);
const reviews = ref([]);
const editingReview = ref(null);
const reviewToDelete = ref(null);
const submitting = ref(false);
const deleting = ref(false);

const authStore = useAuthStore();

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
    reviews.value = [];
    const userId = authStore.user?.id || authStore.user?.uid;
    if (!userId) {
      error.value = 'No se pudo obtener el usuario actual.';
      return;
    }
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('userId', '==', userId),
      orderBy('created_at', 'desc')
    );
    const querySnapshot = await getDocs(q);
    reviews.value = querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
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
    const reviewRef = doc(db, 'reviews', editingReview.value.id);
    await updateDoc(reviewRef, {
      rating: reviewForm.value.rating,
      comment: reviewForm.value.comment
    });
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
    const reviewRef = doc(db, 'reviews', reviewToDelete.value.id);
    await deleteDoc(reviewRef);
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
  // Si es un timestamp de Firestore, conviértelo a Date
  if (typeof date === 'object' && date.seconds) {
    date = new Date(date.seconds * 1000);
  }
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
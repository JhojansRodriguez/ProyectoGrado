<!-- Dashboard para usuarios de farmacia -->
<template>
  <div class="dashboard">
    <!-- Tarjetas de resumen -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-pills"></i>
        </div>
        <div class="stat-info">
          <h3>Total Medicamentos</h3>
          <p class="stat-value">{{ totalMedicines }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon warning">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="stat-info">
          <h3>Stock Bajo</h3>
          <p class="stat-value">{{ lowStockCount }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon success">
          <i class="fas fa-star"></i>
        </div>
        <div class="stat-info">
          <h3>Reseñas</h3>
          <p class="stat-value">{{ totalReviews }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon info">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-info">
          <h3>Horario</h3>
          <p class="stat-value">{{ pharmacySchedule }}</p>
        </div>
      </div>
    </div>

    <!-- Sección principal -->
    <div class="dashboard-grid">
      <!-- Lista de medicamentos con stock bajo -->
      <div class="dashboard-card low-stock-list">
        <div class="card-header">
          <h2>Medicamentos con Stock Bajo</h2>
          <router-link to="/farma/medicines" class="view-all">
            Ver todos
            <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>
        
        <div class="card-content">
          <div v-if="loading" class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            Cargando medicamentos...
          </div>
          <div v-else-if="error" class="error">
            {{ error }}
          </div>
          <div v-else>
            <div v-if="lowStockMedicines.length === 0" class="empty-state">
              <i class="fas fa-check-circle"></i>
              <p>¡Todos los medicamentos tienen stock suficiente!</p>
            </div>
            <ul v-else class="medicines-list">
              <li v-for="medicine in lowStockMedicines" :key="medicine.id" class="medicine-item">
                <div class="medicine-info">
                  <h4>{{ medicine.name }}</h4>
                  <p>{{ medicine.specifications }}</p>
                </div>
                <div class="medicine-stock">
                  <span class="stock-badge" :class="getStockClass(medicine.stock)">
                    {{ medicine.stock }} unidades
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Últimas reseñas -->
      <div class="dashboard-card recent-reviews">
        <div class="card-header">
          <h2>Últimas Reseñas</h2>
        </div>
        
        <div class="card-content">
          <div v-if="loadingReviews" class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            Cargando reseñas...
          </div>
          <div v-else-if="reviewError" class="error">
            {{ reviewError }}
          </div>
          <div v-else>
            <div v-if="recentReviews.length === 0" class="empty-state">
              <i class="fas fa-comments"></i>
              <p>¡Aún no hay reseñas!</p>
            </div>
            <ul v-else class="reviews-list">
              <li v-for="review in recentReviews" :key="review.id" class="review-item">
                <div class="review-header">
                  <div class="review-user">
                    <i class="fas fa-user"></i>
                    <span>{{ review.userName }}</span>
                  </div>
                  <div class="review-rating">
                    <i v-for="n in 5" 
                       :key="n" 
                       class="fas fa-star"
                       :class="{ 'active': n <= review.rating }"
                    ></i>
                  </div>
                </div>
                <p class="review-text">{{ review.comment }}</p>
                <span class="review-date">{{ formatDate(review.created_time) }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../../store/auth';
import { getMedicines } from '../../firebase/services';

const authStore = useAuthStore();

// Estado
const medicines = ref([]);
const recentReviews = ref([]);
const loading = ref(true);
const loadingReviews = ref(true);
const error = ref(null);
const reviewError = ref(null);

// Computed properties
const totalMedicines = computed(() => medicines.value.length);
const lowStockCount = computed(() => medicines.value.filter(m => m.stock <= 20).length);
const totalReviews = computed(() => recentReviews.value.length);
const pharmacySchedule = computed(() => {
  const openHrs = authStore.user?.open_hrs || '08:00';
  const closeHrs = authStore.user?.close_hrs || '20:00';
  return `${openHrs} - ${closeHrs}`;
});

const lowStockMedicines = computed(() => 
  medicines.value
    .filter(m => m.stock <= 20)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5)
);

// Métodos
const loadMedicines = async () => {
  try {
    loading.value = true;
    medicines.value = await getMedicines();
  } catch (err) {
    error.value = 'Error al cargar los medicamentos';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const loadReviews = async () => {
  try {
    loadingReviews.value = true;
    // TODO: Implementar carga de reseñas desde Firestore
    recentReviews.value = [];
  } catch (err) {
    reviewError.value = 'Error al cargar las reseñas';
    console.error(err);
  } finally {
    loadingReviews.value = false;
  }
};

const getStockClass = (stock) => {
  if (stock <= 10) return 'critical';
  if (stock <= 20) return 'warning';
  return 'normal';
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Lifecycle hooks
onMounted(() => {
  loadMedicines();
  loadReviews();
});
</script>

<style scoped>
.dashboard {
  padding: 1rem;
}

/* Grid de estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #5F7F79;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.warning {
  background: #ffc107;
}

.stat-icon.success {
  background: #28a745;
}

.stat-icon.info {
  background: #17a2b8;
}

.stat-info h3 {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.stat-value {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2D4739;
}

/* Grid del dashboard */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.dashboard-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #E8F1F2;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #2D4739;
}

.view-all {
  color: #5F7F79;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.card-content {
  padding: 1.5rem;
}

/* Lista de medicamentos */
.medicines-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.medicine-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #E8F1F2;
}

.medicine-item:last-child {
  border-bottom: none;
}

.medicine-info h4 {
  margin: 0;
  color: #2D4739;
}

.medicine-info p {
  margin: 0.25rem 0 0;
  color: #666;
  font-size: 0.9rem;
}

.stock-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 500;
}

.stock-badge.critical {
  background: #fde8e8;
  color: #dc3545;
}

.stock-badge.warning {
  background: #fff3cd;
  color: #856404;
}

.stock-badge.normal {
  background: #d4edda;
  color: #155724;
}

/* Lista de reseñas */
.reviews-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.review-item {
  padding: 1rem;
  border-bottom: 1px solid #E8F1F2;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.review-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2D4739;
  font-weight: 500;
}

.review-rating i {
  color: #ddd;
  font-size: 0.9rem;
}

.review-rating i.active {
  color: #ffc107;
}

.review-text {
  margin: 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.review-date {
  color: #999;
  font-size: 0.8rem;
}

/* Estados de carga y error */
.loading, .error, .empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.loading i {
  margin-right: 0.5rem;
}

.error {
  color: #dc3545;
}

.empty-state {
  color: #666;
}

.empty-state i {
  font-size: 2rem;
  color: #B8D8D0;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }
}
</style>

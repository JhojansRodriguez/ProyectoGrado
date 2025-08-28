
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
                    <span>{{ review.review }}</span>
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
import { getMedicines, getPharmacyReviews ,getRecentReviews  } from '../../firebase/services';

const authStore = useAuthStore();

// Estado
const medicines = ref([]);
const recentReviews = ref([]);
const loading = ref(true);
const loadingReviews = ref(true);
const error = ref(null);
const reviewError = ref(null);
const searchQuery = ref('');
const stockFilter = ref('all');
const sortBy = ref('name');
const filteredMedicines = ref([]);

// Computed properties
const totalMedicines = computed(() => medicines.value.length);
const lowStockCount = computed(() => medicines.value.filter(m => m.stock <= 20).length);
const totalReviews = computed(() => recentReviews.value.length);

const pharmacySchedule = computed(() => {
  const openHrs = authStore.user?.open_hrs || '08:00';
  const closeHrs = authStore.user?.close_hrs || '20:00';
  return `${openHrs} - ${closeHrs}`;
});

const pharmacyMedicines = computed(() => {
  return medicines.value.filter(medicine => medicine.pharmacyId === authStore.user?.uid);
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
    error.value = null;
    if (!authStore.user?.uid) {
      throw new Error('Usuario no autenticado');
    }
    medicines.value = await getMedicines(authStore.user.uid);
    filterMedicines();
  } catch (err) {
    error.value = 'Error al cargar los medicamentos';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const filterMedicines = () => {
  let filtered = [...pharmacyMedicines.value];

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(medicine => 
      medicine.name.toLowerCase().includes(query) ||
      medicine.description.toLowerCase().includes(query)
    );
  }

  // Filtrar por stock
  switch (stockFilter.value) {
    case 'inStock':
      filtered = filtered.filter(m => m.stock > 20);
      break;
    case 'lowStock':
      filtered = filtered.filter(m => m.stock > 0 && m.stock <= 20);
      break;
    case 'outOfStock':
      filtered = filtered.filter(m => m.stock === 0);
      break;
  }

  // Ordenar
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'priceAsc':
        return a.price - b.price;
      case 'priceDesc':
        return b.price - a.price;
      case 'stock':
        return b.stock - a.stock;
      default:
        return 0;
    }
  });

  filteredMedicines.value = filtered;
};

const loadReviews = async () => {
  try {
    loadingReviews.value = true;
    reviewError.value = null;
    recentReviews.value = await getPharmacyReviews(authStore.user.uid, 5);
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
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 20px;
}

/* Grid de estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 1.2rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.2rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #5F7F79;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
}

.stat-icon.warning {
  background: #ffc107;
  color: #fff;
}

.stat-icon.success {
  background: #28a745;
  color: #fff;
}

.stat-icon.info {
  background: #17a2b8;
  color: #fff;
}

.stat-info h3 {
  margin: 0;
  font-size: 0.95rem;
  color: #666;
  font-weight: 500;
}

.stat-value {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2D4739;
  line-height: 1.1;
}

/* Grid del dashboard */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 1.5rem;
}

.dashboard-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-header {
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid #E8F1F2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.card-header h2 {
  margin: 0;
  font-size: 1.15rem;
  color: #2D4739;
  font-weight: 600;
}

.view-all {
  color: #5F7F79;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  transition: color 0.2s;
}
.view-all:hover {
  color: #2D4739;
}

.card-content {
  padding: 1.2rem 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* Lista de medicamentos */
.medicines-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-x: auto;
}

.medicine-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.9rem 0;
  border-bottom: 1px solid #E8F1F2;
  gap: 1rem;
  min-width: 0;
}

.medicine-item:last-child {
  border-bottom: none;
}

.medicine-info h4 {
  margin: 0;
  color: #2D4739;
  font-size: 1.05rem;
  font-weight: 600;
  word-break: break-word;
}

.medicine-info p {
  margin: 0.25rem 0 0;
  color: #666;
  font-size: 0.93rem;
  word-break: break-word;
}

.medicine-stock {
  flex-shrink: 0;
}

.stock-badge {
  padding: 0.25rem 0.8rem;
  border-radius: 999px;
  font-size: 0.93rem;
  font-weight: 600;
  white-space: nowrap;
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
  overflow-x: auto;
}

.review-item {
  padding: 0.9rem 0;
  border-bottom: 1px solid #E8F1F2;
  min-width: 0;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
  gap: 1rem;
}

.review-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2D4739;
  font-weight: 500;
  font-size: 0.98rem;
}

.review-rating i {
  color: #ddd;
  font-size: 0.95rem;
}

.review-rating i.active {
  color: #ffc107;
}

.review-text {
  margin: 0.4rem 0;
  color: #666;
  font-size: 0.97rem;
  word-break: break-word;
}

.review-date {
  color: #999;
  font-size: 0.85rem;
}

/* Estados de carga y error */
.loading, .error, .empty-state {
  text-align: center;
  padding: 2rem 0.5rem;
  color: #666;
  font-size: 1.05rem;
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

/* Responsividad */
@media (max-width: 1100px) {
  .dashboard {
    padding: 0.5rem;
  }
  .stats-grid {
    gap: 0.8rem;
  }
  .dashboard-grid {
    gap: 1rem;
  }
}

@media (max-width: 900px) {
  .dashboard {
    padding: 0.5rem;
  }
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 0.7rem;
  }
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .stat-card {
    padding: 1rem;
    font-size: 0.97rem;
  }
  .card-header, .card-content {
    padding: 1rem;
  }
}

@media (max-width: 600px) {
  .dashboard {
    padding: 0.2rem;
  }
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  .stat-card {
    padding: 0.7rem 0.8rem;
    font-size: 0.95rem;
  }
  .stat-icon {
    width: 36px;
    height: 36px;
    font-size: 1.1rem;
  }
  .stat-value {
    font-size: 1.1rem;
  }
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 0.7rem;
  }
  .dashboard-card {
    border-radius: 8px;
  }
  .card-header, .card-content {
    padding: 0.7rem;
  }
  .medicine-info h4 {
    font-size: 0.98rem;
  }
  .medicine-info p {
    font-size: 0.9rem;
  }
  .review-user {
    font-size: 0.95rem;
  }
  .review-text {
    font-size: 0.95rem;
  }
  .review-date {
    font-size: 0.8rem;
  }
}
</style>
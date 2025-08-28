<!-- Dashboard del panel de administración -->
<template>
  <div class="admin-dashboard">
    <!-- Tarjetas de resumen -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon users">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-info">
          <h3>Total Usuarios</h3>
          <p class="stat-value">{{ stats.totalUsers }}</p>
          <span class="stat-change" :class="{ 'positive': stats.userGrowth > 0 }">
            <i :class="stats.userGrowth > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
            {{ Math.abs(stats.userGrowth) }}% este mes
          </span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon pharmacies">
          <i class="fas fa-clinic-medical"></i>
        </div>
        <div class="stat-info">
          <h3>Farmacias Activas</h3>
          <p class="stat-value">{{ stats.activePharmacies }}</p>
          <span class="stat-label">de {{ stats.totalPharmacies }} registradas</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon medicines">
          <i class="fas fa-pills"></i>
        </div>
        <div class="stat-info">
          <h3>Total Medicamentos</h3>
          <p class="stat-value">{{ stats.totalMedicines }}</p>
          <span class="stat-label">en {{ stats.pharmaciesWithMedicines }} farmacias</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon reviews">
          <i class="fas fa-star"></i>
        </div>
        <div class="stat-info">
          <h3>Reseñas Nuevas</h3>
          <p class="stat-value">{{ stats.newReviews }}</p>
          <span class="stat-label">en los últimos 7 días</span>
        </div>
      </div>
    </div>

    <!-- Gráficos y tablas -->
    <div class="dashboard-grid">
      <!-- Actividad reciente -->
      <div class="dashboard-card recent-activity">
        <div class="card-header">
          <h2>Actividad Reciente</h2>
          <button class="btn-link" @click="loadMoreActivity">
            Ver todo
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
        
        <div class="card-content">
          <div v-if="loading.activity" class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            Cargando actividad...
          </div>
          <div v-else>
            <div class="activity-timeline">
              <div v-for="activity in recentActivity" 
                   :key="activity.id" 
                   class="activity-item"
              >
                <div class="activity-icon" :class="activity.type">
                  <i :class="getActivityIcon(activity.type)"></i>
                </div>
                <div class="activity-content">
                  <p>{{ activity.description }}</p>
                  <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Últimas farmacias registradas -->
      <div class="dashboard-card new-pharmacies">
        <div class="card-header">
          <h2>Nuevas Farmacias</h2>
          <router-link to="/admin/pharmacies" class="btn-link">
            Ver todas
            <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>
        
        <div class="card-content">
          <div v-if="loading.pharmacies" class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            Cargando farmacias...
          </div>
          <div v-else>
            <div class="pharmacies-list">
              <div v-for="pharmacy in newPharmacies" 
                   :key="pharmacy.id" 
                   class="pharmacy-item"
              >
                <img 
                  :src="pharmacy.photo_url || '/placeholder-pharmacy.png'" 
                  :alt="pharmacy.display_name"
                  class="pharmacy-photo"
                >
                <div class="pharmacy-info">
                  <h3>{{ pharmacy.display_name }}</h3>
                  <p>{{ pharmacy.farma_address }}</p>
                  <span class="pharmacy-status" :class="{ 'active': pharmacy.farma_activate }">
                    {{ pharmacy.farma_activate ? 'Activa' : 'Pendiente' }}
                  </span>
                </div>
                <button 
                  v-if="!pharmacy.farma_activate"
                  class="btn-activate"
                  @click="activatePharmacy(pharmacy.id)"
                >
                  Activar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../../store/auth';
import { getMedicines, getPharmacyReviews } from '../../firebase/services';

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
    if (!authStore.user?.uid) {
      throw new Error('Usuario no autenticado');
    }
    // Cargar las últimas 5 reseñas de la farmacia logueada
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
.admin-dashboard {
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
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-icon.users { background: #4299e1; }
.stat-icon.pharmacies { background: #48bb78; }
.stat-icon.medicines { background: #ed8936; }
.stat-icon.reviews { background: #ecc94b; }

.stat-info h3 {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.stat-value {
  margin: 0.25rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2D4739;
}

.stat-change {
  font-size: 0.9rem;
  color: #dc3545;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stat-change.positive {
  color: #28a745;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
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

.btn-link {
  color: #5F7F79;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  background: none;
  border: none;
  cursor: pointer;
}

.card-content {
  padding: 1.5rem;
}

/* Timeline de actividad */
.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.activity-item {
  display: flex;
  gap: 1rem;
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.activity-icon.user { background: #4299e1; }
.activity-icon.pharmacy { background: #48bb78; }
.activity-icon.medicine { background: #ed8936; }
.activity-icon.review { background: #ecc94b; }

.activity-content {
  flex-grow: 1;
}

.activity-content p {
  margin: 0;
  color: #2D4739;
}

.activity-time {
  font-size: 0.9rem;
  color: #666;
}

/* Lista de farmacias */
.pharmacies-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pharmacy-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #E8F1F2;
  border-radius: 8px;
}

.pharmacy-photo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.pharmacy-info {
  flex-grow: 1;
}

.pharmacy-info h3 {
  margin: 0;
  color: #2D4739;
  font-size: 1rem;
}

.pharmacy-info p {
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
}

.pharmacy-status {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.8rem;
  background: #fde8e8;
  color: #dc3545;
}

.pharmacy-status.active {
  background: #d4edda;
  color: #155724;
}

.btn-activate {
  padding: 0.5rem 1rem;
  background: #5F7F79;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.btn-activate:hover {
  background: #4a6561;
}

/* Estados de carga */
.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.loading i {
  margin-right: 0.5rem;
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

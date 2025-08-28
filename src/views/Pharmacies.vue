
<!-- Vista de listado de farmacias -->
<template>
  <div class="pharmacies">
    <header class="page-header">
      <div class="container">
        <h1>Farmacias</h1>
        <p>Encuentra las farmacias más cercanas a tu ubicación</p>
      </div>
    </header>

    <section class="pharmacies-list">
      <div class="container">
        <div class="search-bar">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Buscar farmacia por nombre o dirección..."
            @input="filterPharmacies"
          >
        </div>

        <div v-if="loading" class="loading">
          Cargando farmacias...
        </div>
        <div v-else-if="error" class="error">
          {{ error }}
        </div>
        <div v-else>
          <div v-if="filteredPharmacies.length === 0" class="no-results">
            No se encontraron farmacias que coincidan con tu búsqueda.
          </div>
          <div v-else class="grid">
            <PharmacyCard 
              v-for="pharmacy in filteredPharmacies" 
              :key="pharmacy.id" 
              :pharmacy="pharmacy" 
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import PharmacyCard from '../components/PharmacyCard.vue'
import { getPharmacies } from '../firebase/services'

export default {
  name: 'PharmaciesView',
  components: {
    PharmacyCard
  },
  data() {
    return {
      pharmacies: [],
      filteredPharmacies: [],
      searchQuery: '',
      loading: true,
      error: null
    }
  },
  async created() {
    try {
      // Solo farmacias con state === true
      const allPharmacies = await getPharmacies();
      this.pharmacies = allPharmacies.filter(pharmacy => pharmacy.state === true);
      this.filteredPharmacies = this.pharmacies;
      this.loading = false;
    } catch (error) {
      this.error = "Error al cargar las farmacias. Por favor, intente más tarde.";
      this.loading = false;
    }
  },
  methods: {
    filterPharmacies() {
      const query = this.searchQuery.toLowerCase();
      // Solo farmacias con state === true
      this.filteredPharmacies = this.pharmacies.filter(pharmacy => 
        (pharmacy.name && pharmacy.name.toLowerCase().includes(query)) ||
        (pharmacy.address && pharmacy.address.toLowerCase().includes(query))
      );
    }
  }
}
</script>

<style scoped>
.pharmacies {
  padding-top: 20px;
  min-height: 100vh;
  background: #f8fafb;
}
.page-header {
  background: linear-gradient(135deg, #5F7F79 0%, #2D4739 100%);
  color: white;
  padding: 2.5rem 0 1.5rem 0;
  text-align: center;
}
.page-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}
.page-header p {
  font-size: 1.1rem;
  opacity: 0.95;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 18px;
}
.search-bar {
  margin: 2rem 0 1.5rem 0;
  display: flex;
  justify-content: center;
}
.search-bar input {
  width: 100%;
  max-width: 420px;
  padding: 0.7rem 1.2rem;
  border: 1.5px solid #5F7F79;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}
.search-bar input:focus {
  border-color: #2D4739;
}
.loading, .error, .no-results {
  text-align: center;
  padding: 2rem 0.5rem;
  color: #2D4739;
  font-size: 1.1rem;
}
.error {
  color: #dc3545;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

/* Responsive */
@media (max-width: 900px) {
  .container {
    padding: 0 8px;
  }
  .grid {
    gap: 1.2rem;
  }
}
@media (max-width: 600px) {
  .page-header {
    padding: 1.2rem 0 0.7rem 0;
  }
  .page-header h1 {
    font-size: 1.2rem;
  }
  .page-header p {
    font-size: 0.98rem;
  }
  .search-bar {
    margin: 1rem 0 1rem 0;
  }
  .search-bar input {
    font-size: 0.98rem;
    padding: 0.5rem 0.8rem;
    max-width: 100%;
  }
  .grid {
    grid-template-columns: 1fr;
    gap: 0.7rem;
  }
}
</style>
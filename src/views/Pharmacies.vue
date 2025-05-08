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
      this.pharmacies = await getPharmacies();
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
      this.filteredPharmacies = this.pharmacies.filter(pharmacy => 
        pharmacy.name.toLowerCase().includes(query) ||
        pharmacy.address.toLowerCase().includes(query)
      );
    }
  }
}
</script>

<style scoped>
/* Add your styles here */
</style>

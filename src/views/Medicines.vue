<!-- Vista de listado de medicamentos -->
<template>
  <div class="medicines">
    <header class="page-header">
      <div class="container">
        <h1>Medicamentos</h1>
        <p>Consulta la disponibilidad y precios de medicamentos</p>
      </div>
    </header>

    <section class="medicines-list">
      <div class="container">
        <div class="filters">
          <div class="search-bar">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Buscar medicamento por nombre..."
              @input="filterMedicines"
            />
          </div>
        </div>

        <div v-if="loading" class="loading">
          Cargando medicamentos...
        </div>
        <div v-else-if="error" class="error">
          {{ error }}
        </div>
        <div v-else>
          <div v-if="filteredMedicines.length === 0" class="no-results">
            No se encontraron medicamentos que coincidan con tu búsqueda.
          </div>
          <div v-else>
            <div class="grid">
              <MedicineCard 
                v-for="medicine in filteredMedicines" 
                :key="medicine.id" 
                :medicine="medicine" 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import MedicineCard from '../components/MedicineCard.vue'
import { getMedicines } from '../firebase/services'

export default {
  name: 'MedicinesView',
  components: {
    MedicineCard
  },
  data() {
    return {
      medicines: [],
      filteredMedicines: [],
      searchQuery: '',
      loading: true,
      error: null
    }
  },
  async created() {
    try {
      this.medicines = await getMedicines();
      this.filteredMedicines = this.medicines;
      this.loading = false;
    } catch (error) {
      this.error = "Error al cargar los medicamentos. Por favor, intente más tarde.";
      this.loading = false;
    }
  },
  methods: {
    filterMedicines() {
      const query = this.searchQuery.toLowerCase();
      this.filteredMedicines = this.medicines.filter(medicine => 
        medicine.name.toLowerCase().includes(query)
      );
    }
  }
}
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #5F7F79 0%, #2D4739 100%);
  padding: 20px;
  text-align: center;
}

.search-bar input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.search-bar input:focus {
  border-color: #80bdff;
  outline: none;
}

.loading {
  text-align: center;
  font-size: 18px;
  color: #007bff;
}

.error {
  text-align: center;
  font-size: 18px;
  color: #dc3545;
}

.no-results {
  text-align: center;
  font-size: 18px;
  color: #6c757d;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}
</style>

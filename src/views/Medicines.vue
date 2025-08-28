
<template>
  <div class="medicines-view">
    <header class="page-header">
      <div class="container">
        <h1>Medicamentos</h1>
        <p>Explora todos los medicamentos disponibles en la plataforma</p>
      </div>
    </header>

    <section class="medicines-list">
      <div class="container">
        <div v-if="loading" class="loading">
          Cargando medicamentos...
        </div>
        <div v-else-if="error" class="error">
          {{ error }}
        </div>
        <div v-else>
          <div v-if="medicines.length === 0" class="no-results">
            No hay medicamentos disponibles.
          </div>
          <div v-else class="grid">
            <MedicineCard
              v-for="medicine in medicines"
              :key="medicine.id"
              :medicine="medicine"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import MedicineCard from '../components/MedicineCard.vue'
import { getPharmacies, getMedicines } from '../firebase/services'

export default {
  name: 'MedicinesView',
  components: {
    MedicineCard
  },
  data() {
    return {
      medicines: [],
      loading: true,
      error: null
    }
  },
  async created() {
    try {
      // Obtener todas las farmacias y luego todas las medicinas de cada una
      const pharmacies = await getPharmacies();
      let allMedicines = [];
      for (const pharmacy of pharmacies) {
        const meds = await getMedicines(pharmacy.id);
        // Opcional: agrega el nombre de la farmacia a cada medicina
        meds.forEach(med => med.pharmacyName = pharmacy.name);
        allMedicines = allMedicines.concat(meds);
      }
      this.medicines = allMedicines;
    } catch (error) {
      this.error = "Error al cargar los medicamentos. Por favor, intente más tarde.";
    } finally {
      this.loading = false;
    }
  }
}
</script>

<style scoped>
.medicines-view {
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
.medicines-list{
  padding-top: 10px;
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
  .grid {
    grid-template-columns: 1fr;
    gap: 0.7rem;
  }
}
</style>

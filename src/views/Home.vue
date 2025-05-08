
<template>
  <div class="home">
    <!-- Hero Section (puedes personalizar el texto) -->
    <section class="hero">
      <h1>Bienvenido a PharmaLoc</h1>
      <p>Encuentra farmacias y medicamentos cerca de ti de manera rápida y sencilla.</p>
    </section>

    <!-- Farmacias destacadas -->
    <section class="featured-section">
      <div class="container">
        <div class="section-header">
          <h2>Farmacias destacadas</h2>
          <!-- Puedes agregar un botón "Ver todas" si lo deseas -->
        </div>
        <div v-if="loading" class="loading">Cargando farmacias...</div>
        <div v-else-if="error" class="error">Error: {{ error }}</div>
        <div v-else class="grid">
          <div
            v-for="pharmacy in randomPharmacies"
            :key="pharmacy.id"
            class="card"
            style="background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 1.5rem;"
          >
            <h3 style="margin-bottom: 0.5rem;">{{ pharmacy.name }}</h3>
            <p style="color: #5F7F79; font-size: 0.95rem;">
              {{ pharmacy.address }}
            </p>
            <!-- Puedes agregar más datos de la farmacia aquí -->
          </div>
        </div>
      </div>
    </section>

    <!-- Medicamentos destacados -->
    <section class="featured-section">
      <div class="container">
        <div class="section-header">
          <h2>Medicamentos destacados</h2>
        </div>
        <div v-if="loading" class="loading">Cargando medicamentos...</div>
        <div v-else-if="error" class="error">Error: {{ error }}</div>
        <div v-else class="grid">
          <div
            v-for="medicine in randomMedicines"
            :key="medicine.id"
            class="card"
            style="background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 1.5rem;"
          >
            <h3 style="margin-bottom: 0.5rem;">{{ medicine.name }}</h3>
            <p style="color: #5F7F79; font-size: 0.95rem;">
              {{ medicine.description || 'Sin descripción' }}
            </p>
            <div style="margin-top: 1rem; font-weight: bold;">
              {{ formatCurrency(medicine.price) }}
            </div>
            <!-- Puedes agregar más datos del medicamento aquí -->
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { getPharmacies, getMedicines } from '@/firebase/services';

function getRandomItems(array, count) {
  const shuffled = array.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export default {
  name: 'Home',
  data() {
    return {
      pharmacies: [],
      medicines: [],
      randomPharmacies: [],
      randomMedicines: [],
      loading: true,
      error: null,
    };
  },
  async created() {
    try {
      // Obtener todas las farmacias
      const pharmacies = await getPharmacies();
      this.pharmacies = pharmacies;
      this.randomPharmacies = getRandomItems(pharmacies, 3);

      // Obtener medicamentos de todas las farmacias y aplanar el array
      let allMedicines = [];
      for (const pharmacy of pharmacies) {
        const meds = await getMedicines(pharmacy.id);
        allMedicines = allMedicines.concat(meds);
      }
      this.medicines = allMedicines;
      this.randomMedicines = getRandomItems(allMedicines, 3);
    } catch (e) {
      this.error = e.message;
    } finally {
      this.loading = false;
    }
  },
  methods: {
    formatCurrency(value) {
      if (typeof value !== "number") return value;
      return "$" + value.toFixed(2);
    }
  }
};
</script>

<style scoped>
.home {
  padding-top: 60px;
}

.hero {
  background: linear-gradient(135deg, #5F7F79 0%, #2D4739 100%);
  color: white;
  padding: 4rem 0;
  text-align: center;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 800px;
  margin: 0 auto;
}

.featured-section {
  padding: 4rem 0;
  background-color: #E8F1F2;
}

.featured-section:nth-child(even) {
  background-color: #FFFFFF;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  color: #2D4739;
  font-size: 2rem;
  margin: 0;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #5F7F79;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background-color: rgba(95, 127, 121, 0.1);
}

.view-all-btn:hover {
  background-color: rgba(95, 127, 121, 0.2);
  color: #2D4739;
}

.view-all-btn i {
  transition: transform 0.3s;
}

.view-all-btn:hover i {
  transform: translateX(4px);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  color: #2D4739;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.error {
  color: #dc3545;
}

@media (max-width: 768px) {
  .hero {
    padding: 3rem 0;
  }

  .hero h1 {
    font-size: 2rem;
  }

  .hero p {
    font-size: 1rem;
  }

  .featured-section {
    padding: 2rem 0;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .section-header h2 {
    font-size: 1.5rem;
  }

  .grid {
    gap: 1rem;
  }
}
</style>

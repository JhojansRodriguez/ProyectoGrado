<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <h1>Bienvenido a PharmaLoc</h1>
      <p>Encuentra farmacias y medicamentos cerca de ti de manera rápida y sencilla.</p>
    </section>

    <!-- Farmacias destacadas -->
    <section class="featured-section">
      <div class="container">
        <div class="section-header">
          <h2>Farmacias destacadas</h2>
        </div>
        <div v-if="loading" class="loading">Cargando farmacias...</div>
        <div v-else-if="error" class="error">Error: {{ error }}</div>
        <div v-else class="grid">
          <div
            v-for="pharmacy in randomPharmacies"
            :key="pharmacy.id"
            class="card"
          >
          <img :src="pharmacy.photo_url" :alt="image-pharmacy" class="pharmacy-image">
            <h3>{{ pharmacy.name }}</h3>
            <p>
              {{ pharmacy.address }}
            </p>
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
          >
          <img :src="medicine.photo" :alt="image-pharmacy" class="medicine-image">
            <h3>{{ medicine.name }}</h3>
            <p>
              {{ medicine.description || 'Sin descripción' }}
            </p>
            <div class="price">
              {{ formatCurrency(medicine.price) }}
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { getPharmacies, getMedicines } from '@/firebase/services';
import PharmacyCard from '../components/PharmacyCard.vue'
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
/* GLOBAL RESET FOR THIS COMPONENT */
*, *::before, *::after {
  box-sizing: border-box;
}

.home {
  padding-top: 0px;
}

/* HERO SECTION */
.hero {
  background: linear-gradient(135deg, #5F7F79 0%, #2D4739 100%);
  color: white;
  padding: 3.5rem 0 2.5rem 0;
  text-align: center;
}
.hero h1 {
  font-size: 2.2rem;
  margin-bottom: 1rem;
  line-height: 1.1;
}
.hero p {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 800px;
  margin: 0 auto;
}
.pharmacy-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
.medicine-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

/* FEATURED SECTION */
.featured-section {
  padding: 3rem 0;
  background-color: #E8F1F2;
}
.featured-section:nth-of-type(even) {
  background-color: #FFFFFF;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}
.section-header h2 {
  color: #2D4739;
  font-size: 1.7rem;
  margin: 0;
}

/* CARD GRID */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 140px;
  max-width: 100%;
  transition: box-shadow 0.2s;
  word-break: break-word;
}
.card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
}
.card h3 {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  color: #2D4739;
}
.card p {
  color: #5F7F79;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}
.card .price {
  margin-top: 1rem;
  font-weight: bold;
  color: #2D4739;
  font-size: 1.05rem;
}

/* LOADING & ERROR */
.loading, .error {
  text-align: center;
  padding: 2rem 0.5rem;
  color: #2D4739;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1rem;
}
.error {
  color: #dc3545;
}

/* RESPONSIVE DESIGN */
@media (max-width: 1024px) {
  .container {
    max-width: 98vw;
    padding: 0 8px;
  }
  .hero {
    padding: 2.5rem 0 1.5rem 0;
  }
  .featured-section {
    padding: 2rem 0;
  }
  .section-header {
    margin-bottom: 1.2rem;
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 1.5rem 0 1rem 0;
  }
  .hero h1 {
    font-size: 1.5rem;
  }
  .hero p {
    font-size: 0.98rem;
    padding: 0 6px;
  }
  .featured-section {
    padding: 1rem 0;
  }
  .section-header {
    flex-direction: column;
    gap: 0.7rem;
    text-align: center;
  }
  .section-header h2 {
    font-size: 1.1rem;
  }
  .grid {
    gap: 0.7rem;
    grid-template-columns: 1fr;
  }
  .card {
    padding: 0.7rem;
    min-height: 90px;
    font-size: 0.93rem;
  }
}

@media (max-width: 480px) {
  .home {
    padding-top: 30px;
  }
  .hero {
    padding: 0.7rem 0 0.5rem 0;
  }
  .hero h1 {
    font-size: 1.1rem;
  }
  .hero p {
    font-size: 0.9rem;
    padding: 0 2px;
  }
  .featured-section {
    padding: 0.5rem 0;
  }
  .container {
    padding: 0 2px;
  }
  .card {
    padding: 0.4rem;
    font-size: 0.9rem;
    min-height: 60px;
  }
  .card h3 {
    font-size: 0.95rem;
  }
  .card .price {
    font-size: 0.95rem;
  }
}
</style>
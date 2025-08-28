<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-primary to-primary-dark text-white py-14 sm:py-20 text-center">
      <h1 class="text-4xl sm:text-5xl font-bold mb-4">Bienvenido a PharmaLoc</h1>
      <p class="text-lg sm:text-xl opacity-90 max-w-3xl mx-auto px-4">Encuentra farmacias y medicamentos cerca de ti de manera rápida y sencilla.</p>
    </section>

    <!-- Farmacias destacadas -->
    <section class="py-12 sm:py-16 bg-secondary">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center text-primary-dark mb-8">Farmacias destacadas</h2>
        <div v-if="loading" class="text-center text-gray-600">Cargando farmacias...</div>
        <div v-else-if="error" class="text-center text-red-500">Error: {{ error }}</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="pharmacy in randomPharmacies"
            :key="pharmacy.id"
            class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
          >
            <img :src="pharmacy.photo_url" :alt="pharmacy.name" class="w-full h-48 object-cover">
            <div class="p-6">
              <h3 class="text-xl font-semibold mb-2 text-primary-dark">{{ pharmacy.name }}</h3>
              <p class="text-text-light">{{ pharmacy.address }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Medicamentos destacados -->
    <section class="py-12 sm:py-16 bg-white">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center text-primary-dark mb-8">Medicamentos destacados</h2>
        <div v-if="loading" class="text-center text-gray-600">Cargando medicamentos...</div>
        <div v-else-if="error" class="text-center text-red-500">Error: {{ error }}</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="medicine in randomMedicines"
            :key="medicine.id"
            class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
          >
            <img :src="medicine.photo" :alt="medicine.name" class="w-full h-48 object-cover">
            <div class="p-6">
              <h3 class="text-xl font-semibold mb-2 text-primary-dark">{{ medicine.name }}</h3>
              <p class="text-text-light mb-4">{{ medicine.description || 'Sin descripción' }}</p>
              <div class="text-lg font-bold text-primary-dark">
                {{ formatCurrency(medicine.price) }}
              </div>
            </div>
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
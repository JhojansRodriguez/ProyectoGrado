<!-- Componente para mostrar información de una farmacia -->
<template>
  <div class="pharmacy-card">
    <img :src="pharmacy.image" :alt="pharmacy.name" class="pharmacy-image">
    <div class="card-content">
      <h3>{{ pharmacy.name }}</h3>
      <p class="address">
        <i class="fas fa-map-marker-alt"></i>
        {{ pharmacy.address }}
      </p>
      <p class="schedule">
        <i class="fas fa-clock"></i>
        {{ pharmacy.schedule }}
      </p>
      <p class="phone">
        <i class="fas fa-phone"></i>
        {{ pharmacy.phone }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PharmacyCard',
  props: {
    pharmacy: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.pharmacy-card {
  background: #FFFFFF;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(95, 127, 121, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.pharmacy-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(95, 127, 121, 0.2);
}

.pharmacy-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-content {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

h3 {
  color: #5F7F79;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}

p {
  color: #2D4739;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

i {
  color: #5F7F79;
  width: 20px;
}

.address, .schedule, .phone {
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .pharmacy-image {
    height: 150px;
  }
  
  .card-content {
    padding: 1rem;
  }
}
</style>

<!-- Componente para mostrar información de un medicamento -->
<template>
  <div class="medicine-card">
    <div class="card-content">
      <h3>{{ medicine.name }}</h3>
      <p class="description">{{ medicine.description }}</p>
      <div class="details">
        <p class="specifications" v-if="medicine.specifications">
          <i class="fas fa-pills"></i>
          {{ medicine.specifications }}
        </p>
        <p class="price">
          <i class="fas fa-tag"></i>
          ${{ formatPrice(medicine.price) }}
        </p>
        <p class="stock" :class="{ 'low-stock': isLowStock }">
          <i class="fas fa-boxes"></i>
          {{ stockStatus }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MedicineCard',
  props: {
    medicine: {
      type: Object,
      required: true,
      validator: function(obj) {
        return obj.name !== undefined && obj.price !== undefined;
      }
    }
  },
  computed: {
    isLowStock() {
      return this.medicine.stock < 20;
    },
    stockStatus() {
      if (this.medicine.stock === 0) {
        return 'Sin stock';
      } else if (this.isLowStock) {
        return `¡Stock bajo! Solo ${this.medicine.stock} unidades`;
      } else {
        return `Stock: ${this.medicine.stock} unidades`;
      }
    }
  },
  methods: {
    formatPrice(price) {
      try {
        return Number(price).toLocaleString('es-CO');
      } catch (error) {
        console.error('Error al formatear precio:', error);
        return '0';
      }
    }
  }
}
</script>

<style scoped>
.medicine-card {
  background: #FFFFFF;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(95, 127, 121, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.medicine-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(95, 127, 121, 0.2);
}

.card-content {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

h3 {
  color: #5F7F79;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.description {
  color: #2D4739;
  margin-bottom: 1rem;
  flex-grow: 1;
  font-size: 0.9rem;
  line-height: 1.4;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: auto;
}

.specifications, .price, .stock {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.2;
}

.specifications {
  color: #2D4739;
  font-style: italic;
}

.price {
  color: #5F7F79;
  font-size: 1.2rem;
  font-weight: bold;
}

.stock {
  color: #2D4739;
}

.low-stock {
  color: #dc3545;
  font-weight: 500;
}

i {
  color: #5F7F79;
  width: 20px;
  text-align: center;
}

.low-stock i {
  color: #dc3545;
}

@media (max-width: 768px) {
  .card-content {
    padding: 1rem;
  }
  
  .price {
    font-size: 1.1rem;
  }

  h3 {
    font-size: 1.1rem;
  }
}
</style>

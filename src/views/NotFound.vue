<!-- Vista de página no encontrada -->
<template>
  <div class="not-found">
    <div class="error-content">
      <div class="error-icon">
        <i class="fas fa-map-signs"></i>
      </div>
      <h1>404</h1>
      <h2>Página No Encontrada</h2>
      <p>Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
      
      <div class="actions">
        <button @click="goBack" class="btn-secondary">
          <i class="fas fa-arrow-left"></i>
          Volver Atrás
        </button>
        
        <router-link to="/" class="btn-primary">
          <i class="fas fa-home"></i>
          Ir al Inicio
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #5F7F79 0%, #2D4739 100%);
  padding: 1rem;
}

.error-content {
  background: white;
  padding: 3rem 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
}

.error-icon {
  width: 100px;
  height: 100px;
  background: #E8F1F2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
}

.error-icon i {
  font-size: 3rem;
  color: #5F7F79;
}

h1 {
  font-size: 4rem;
  color: #2D4739;
  margin: 0;
  line-height: 1;
}

h2 {
  color: #5F7F79;
  margin: 1rem 0;
  font-size: 1.5rem;
}

p {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s;
}

.btn-primary {
  background: #5F7F79;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #4a6561;
}

.btn-secondary {
  background: transparent;
  color: #5F7F79;
  border: 2px solid #5F7F79;
}

.btn-secondary:hover {
  background: #E8F1F2;
}

@media (max-width: 480px) {
  .error-content {
    padding: 2rem 1rem;
  }

  h1 {
    font-size: 3rem;
  }

  h2 {
    font-size: 1.25rem;
  }

  p {
    font-size: 1rem;
  }

  .actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>

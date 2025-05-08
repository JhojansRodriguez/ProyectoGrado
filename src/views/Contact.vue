<!-- Vista de contacto -->
<template>
  <div class="contact">
    <header class="page-header">
      <div class="container">
        <h1>Contacto</h1>
        <p>¿Tienes alguna pregunta o sugerencia? Estamos aquí para ayudarte.</p>
      </div>
    </header>

    <section class="contact-section">
      <div class="container">
        <div class="contact-grid">
          <!-- Información de contacto -->
          <div class="contact-info">
            <h2>Información de Contacto</h2>
            <p>Contáctanos a través de cualquiera de estos medios:</p>
            
            <div class="info-items">
              <div class="info-item">
                <i class="fas fa-envelope"></i>
                <div>
                  <h3>Correo Electrónico</h3>
                  <a href="mailto:support@pharmaloc.com">support@pharmaloc.com</a>
                </div>
              </div>

              <div class="info-item">
                <i class="fas fa-phone"></i>
                <div>
                  <h3>Teléfono</h3>
                  <a href="tel:+573001234567">+57 300 123 4567</a>
                </div>
              </div>

              <div class="info-item">
                <i class="fas fa-map-marker-alt"></i>
                <div>
                  <h3>Ubicación</h3>
                  <p>Bogotá, Colombia</p>
                </div>
              </div>

              <div class="info-item">
                <i class="fas fa-clock"></i>
                <div>
                  <h3>Horario de Atención</h3>
                  <p>Lunes a Viernes: 8:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>

            <div class="social-links">
              <h3>Síguenos en Redes Sociales</h3>
              <div class="social-icons">
                <a href="#" target="_blank" rel="noopener noreferrer" title="Facebook">
                  <i class="fab fa-facebook"></i>
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" title="Twitter">
                  <i class="fab fa-twitter"></i>
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" title="Instagram">
                  <i class="fab fa-instagram"></i>
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                  <i class="fab fa-linkedin"></i>
                </a>
              </div>
            </div>
          </div>

          <!-- Formulario de contacto -->
          <div class="contact-form">
            <h2>Envíanos un Mensaje</h2>
            <form @submit.prevent="handleSubmit">
              <div class="form-group">
                <label for="name">Nombre Completo</label>
                <input 
                  id="name"
                  v-model="form.name"
                  type="text"
                  required
                  :disabled="loading"
                >
              </div>

              <div class="form-group">
                <label for="email">Correo Electrónico</label>
                <input 
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  :disabled="loading"
                >
              </div>

              <div class="form-group">
                <label for="subject">Asunto</label>
                <input 
                  id="subject"
                  v-model="form.subject"
                  type="text"
                  required
                  :disabled="loading"
                >
              </div>

              <div class="form-group">
                <label for="message">Mensaje</label>
                <textarea 
                  id="message"
                  v-model="form.message"
                  rows="5"
                  required
                  :disabled="loading"
                ></textarea>
              </div>

              <button 
                type="submit" 
                class="submit-button"
                :disabled="loading"
              >
                <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                <span v-else>Enviar Mensaje</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useNotificationStore } from '../store/notifications';

const notificationStore = useNotificationStore();
const loading = ref(false);

// Estado del formulario
const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
});

// Manejar envío del formulario
const handleSubmit = async () => {
  try {
    loading.value = true;
    
    // TODO: Implementar lógica de envío del formulario
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulación de envío

    notificationStore.success('Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.');
    
    // Limpiar formulario
    form.value = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    notificationStore.error('Error al enviar el mensaje. Por favor, intenta nuevamente.');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.contact {
  padding-top: 60px;
}

.page-header {
  background: linear-gradient(135deg, #5F7F79 0%, #2D4739 100%);
  color: white;
  padding: 3rem 0;
  text-align: center;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.page-header p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.contact-section {
  padding: 4rem 0;
  background-color: #E8F1F2;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 3rem;
}

/* Información de contacto */
.contact-info {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
}

.contact-info h2 {
  color: #2D4739;
  margin-bottom: 1rem;
}

.info-items {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 2rem 0;
}

.info-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.info-item i {
  color: #5F7F79;
  font-size: 1.5rem;
  margin-top: 0.25rem;
}

.info-item h3 {
  color: #2D4739;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.info-item a,
.info-item p {
  color: #666;
  text-decoration: none;
  transition: color 0.3s;
}

.info-item a:hover {
  color: #5F7F79;
}

/* Redes sociales */
.social-links {
  margin-top: 2rem;
}

.social-links h3 {
  color: #2D4739;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.social-icons {
  display: flex;
  gap: 1rem;
}

.social-icons a {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #5F7F79;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.3s;
}

.social-icons a:hover {
  background: #2D4739;
  transform: translateY(-2px);
}

/* Formulario de contacto */
.contact-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
}

.contact-form h2 {
  color: #2D4739;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  color: #2D4739;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input,
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #E8F1F2;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #5F7F79;
}

.submit-button {
  width: 100%;
  padding: 1rem;
  background: #5F7F79;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  background: #4a6561;
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Media queries */
@media (max-width: 768px) {
  .page-header {
    padding: 2rem 0;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .page-header p {
    font-size: 1rem;
  }

  .contact-section {
    padding: 2rem 0;
  }

  .contact-grid {
    gap: 2rem;
  }
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .contact-info,
  .contact-form {
    background: #2d3748;
  }

  .contact-info h2,
  .contact-form h2,
  .info-item h3,
  .social-links h3,
  label {
    color: #E2E8F0;
  }

  .info-item a,
  .info-item p {
    color: #A0AEC0;
  }

  input,
  textarea {
    background: #1a202c;
    border-color: #4a5568;
    color: #E2E8F0;
  }

  input:focus,
  textarea:focus {
    border-color: #7FA29B;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .social-icons a {
    transform: none !important;
  }
}
</style>

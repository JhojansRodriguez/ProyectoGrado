<!-- Barra de pie de página -->
<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <!-- Logo y descripción -->
        <div class="footer-brand">
          <h2 class="footer-logo">PharmaLoc</h2>
          <p class="footer-description">
            Sistema de gestión de farmacias y medicamentos. Encuentra las farmacias más cercanas y consulta la disponibilidad de medicamentos.
          </p>
        </div>

        <!-- Enlaces rápidos -->
        <div class="footer-links">
          <h3>Enlaces Rápidos</h3>
          <nav>
            <router-link to="/">Inicio</router-link>
            <router-link to="/pharmacies">Farmacias</router-link>
            <router-link to="/medicines">Medicamentos</router-link>
            <router-link to="/contact">Contacto</router-link>
          </nav>
        </div>

        <!-- Contacto -->
        <div class="footer-contact">
          <h3>Contacto</h3>
          <div class="contact-info">
            <p>
              <i class="fas fa-envelope"></i>
              <a href="mailto:support@pharmaloc.com">support@pharmaloc.com</a>
            </p>
            <p>
              <i class="fas fa-phone"></i>
              <a href="tel:+573001234567">+57 300 123 4567</a>
            </p>
            <p>
              <i class="fas fa-map-marker-alt"></i>
              Bogotá, Colombia
            </p>
          </div>
        </div>

        <!-- Redes sociales -->
        <div class="footer-social">
          <h3>Síguenos</h3>
          <div class="social-links">
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

      <!-- Barra inferior -->
      <div class="footer-bottom">
        <p class="copyright">
          &copy; {{ currentYear }} PharmaLoc. Todos los derechos reservados.
        </p>
        <div class="legal-links">
          <router-link to="/privacy">Política de Privacidad</router-link>
          <router-link to="/terms">Términos de Uso</router-link>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.footer {
  background-color: #2D4739;
  color: white;
  padding: 4rem 0 1rem;
  margin-top: auto;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

/* Logo y descripción */
.footer-brand {
  max-width: 300px;
}

.footer-logo {
  color: #5F7F79;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.footer-description {
  color: #B8D8D0;
  font-size: 0.9rem;
  line-height: 1.6;
}

/* Enlaces */
.footer-links h3,
.footer-contact h3,
.footer-social h3 {
  color: #5F7F79;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.footer-links nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-links a {
  color: #B8D8D0;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: white;
}

/* Contacto */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.contact-info p {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #B8D8D0;
}

.contact-info a {
  color: #B8D8D0;
  text-decoration: none;
  transition: color 0.3s;
}

.contact-info a:hover {
  color: white;
}

/* Redes sociales */
.social-links {
  display: flex;
  gap: 1rem;
}

.social-links a {
  color: #B8D8D0;
  font-size: 1.25rem;
  transition: color 0.3s;
}

.social-links a:hover {
  color: white;
}

/* Barra inferior */
.footer-bottom {
  padding-top: 1.5rem;
  border-top: 1px solid rgba(184, 216, 208, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.copyright {
  color: #B8D8D0;
  font-size: 0.9rem;
}

.legal-links {
  display: flex;
  gap: 1.5rem;
}

.legal-links a {
  color: #B8D8D0;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s;
}

.legal-links a:hover {
  color: white;
}

/* Media queries */
@media (max-width: 768px) {
  .footer {
    padding: 3rem 0 1rem;
  }

  .footer-content {
    gap: 3rem;
  }

  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }

  .legal-links {
    justify-content: center;
  }
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .footer {
    background-color: #1A202C;
  }

  .footer-logo {
    color: #7FA29B;
  }

  .footer-links h3,
  .footer-contact h3,
  .footer-social h3 {
    color: #7FA29B;
  }
}

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .footer-links a,
  .contact-info a,
  .social-links a,
  .legal-links a {
    transition: none;
  }
}
</style>

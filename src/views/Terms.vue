<!-- Vista de términos de uso -->
<template>
  <div class="terms">
    <header class="page-header">
      <div class="container">
        <h1>Términos de Uso</h1>
        <p>Última actualización: {{ lastUpdate }}</p>
      </div>
    </header>

    <div class="content-section">
      <div class="container">
        <div class="legal-content">
          <section>
            <h2>1. Aceptación de los Términos</h2>
            <p>Al acceder y utilizar PharmaLoc, aceptas estar sujeto a estos términos de uso. Si no estás de acuerdo con alguna parte de los términos, no podrás acceder al servicio.</p>
          </section>

          <section>
            <h2>2. Descripción del Servicio</h2>
            <p>PharmaLoc es una plataforma que permite a los usuarios encontrar farmacias cercanas y consultar la disponibilidad de medicamentos. El servicio incluye:</p>
            <ul>
              <li>Búsqueda de farmacias por ubicación</li>
              <li>Consulta de disponibilidad de medicamentos</li>
              <li>Sistema de reseñas y calificaciones</li>
              <li>Gestión de inventario para farmacias</li>
            </ul>
          </section>

          <section>
            <h2>3. Cuentas de Usuario</h2>
            <p>Al crear una cuenta en nuestro servicio, debes proporcionar información precisa y completa. Eres responsable de mantener la seguridad de tu cuenta y contraseña.</p>
          </section>

          <section>
            <h2>4. Uso Aceptable</h2>
            <p>Te comprometes a no utilizar el servicio para:</p>
            <ul>
              <li>Violar leyes o regulaciones</li>
              <li>Publicar información falsa o engañosa</li>
              <li>Suplantar la identidad de otros</li>
              <li>Interferir con el funcionamiento del servicio</li>
            </ul>
          </section>

          <section>
            <h2>5. Contenido del Usuario</h2>
            <p>Al publicar contenido en PharmaLoc, garantizas que tienes los derechos necesarios sobre dicho contenido y otorgas a PharmaLoc una licencia para utilizarlo.</p>
          </section>

          <section>
            <h2>6. Propiedad Intelectual</h2>
            <p>El servicio y su contenido original son propiedad de PharmaLoc. No puedes copiar, modificar, distribuir o crear trabajos derivados sin autorización.</p>
          </section>

          <section>
            <h2>7. Limitación de Responsabilidad</h2>
            <p>PharmaLoc no se hace responsable de:</p>
            <ul>
              <li>La precisión de la información proporcionada por las farmacias</li>
              <li>La disponibilidad real de medicamentos</li>
              <li>Daños indirectos o consecuentes</li>
              <li>Pérdida de datos o interrupción del servicio</li>
            </ul>
          </section>

          <section>
            <h2>8. Modificaciones</h2>
            <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación.</p>
          </section>

          <section>
            <h2>9. Terminación</h2>
            <p>Podemos terminar o suspender tu acceso al servicio inmediatamente, sin previo aviso, por cualquier razón, incluyendo el incumplimiento de estos términos.</p>
          </section>

          <section>
            <h2>10. Contacto</h2>
            <p>Si tienes preguntas sobre estos términos, contáctanos en:</p>
            <p><a href="mailto:legal@pharmaloc.com">legal@pharmaloc.com</a></p>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const lastUpdate = '1 de Enero de 2024';
</script>

<style scoped>
.terms {
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

.content-section {
  padding: 4rem 0;
  background-color: #f8f9fa;
}

.legal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  max-width: 800px;
  margin: 0 auto;
}

section {
  margin-bottom: 2.5rem;
}

section:last-child {
  margin-bottom: 0;
}

h2 {
  color: #2D4739;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

ul {
  list-style-type: disc;
  margin-left: 1.5rem;
  margin-bottom: 1rem;
  color: #666;
}

li {
  margin-bottom: 0.5rem;
}

a {
  color: #5F7F79;
  text-decoration: none;
  transition: color 0.3s;
}

a:hover {
  color: #2D4739;
}

/* Media queries */
@media (max-width: 768px) {
  .page-header {
    padding: 2rem 0;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .content-section {
    padding: 2rem 0;
  }

  .legal-content {
    padding: 1.5rem;
  }

  h2 {
    font-size: 1.25rem;
  }
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .content-section {
    background-color: #1a202c;
  }

  .legal-content {
    background: #2d3748;
  }

  h2 {
    color: #E2E8F0;
  }

  p, ul, li {
    color: #A0AEC0;
  }

  a {
    color: #7FA29B;
  }

  a:hover {
    color: #B8D8D0;
  }
}
</style>

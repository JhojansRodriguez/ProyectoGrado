<!-- Vista de política de privacidad -->
<template>
  <div class="privacy">
    <header class="page-header">
      <div class="container">
        <h1>Política de Privacidad</h1>
        <p>Última actualización: {{ lastUpdate }}</p>
      </div>
    </header>

    <div class="content-section">
      <div class="container">
        <div class="legal-content">
          <section>
            <h2>1. Información que Recopilamos</h2>
            <p>En PharmaLoc, recopilamos diferentes tipos de información para proporcionar y mejorar nuestro servicio:</p>
            <h3>1.1 Información Personal</h3>
            <ul>
              <li>Nombre y apellidos</li>
              <li>Dirección de correo electrónico</li>
              <li>Número de teléfono</li>
              <li>Ubicación geográfica (con tu consentimiento)</li>
            </ul>
            <h3>1.2 Información de Uso</h3>
            <ul>
              <li>Historial de búsquedas</li>
              <li>Reseñas y calificaciones</li>
              <li>Interacciones con el servicio</li>
              <li>Datos técnicos del dispositivo</li>
            </ul>
          </section>

          <section>
            <h2>2. Uso de la Información</h2>
            <p>Utilizamos la información recopilada para:</p>
            <ul>
              <li>Proporcionar y mantener nuestro servicio</li>
              <li>Mejorar la experiencia del usuario</li>
              <li>Enviar notificaciones importantes</li>
              <li>Prevenir actividades fraudulentas</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </section>

          <section>
            <h2>3. Compartir Información</h2>
            <p>No vendemos tu información personal. Compartimos información solo en las siguientes circunstancias:</p>
            <ul>
              <li>Con tu consentimiento explícito</li>
              <li>Con proveedores de servicios que nos ayudan a operar</li>
              <li>Para cumplir con requisitos legales</li>
              <li>En caso de fusión o adquisición empresarial</li>
            </ul>
          </section>

          <section>
            <h2>4. Seguridad de Datos</h2>
            <p>Implementamos medidas de seguridad para proteger tu información:</p>
            <ul>
              <li>Encriptación de datos sensibles</li>
              <li>Acceso restringido a información personal</li>
              <li>Monitoreo regular de sistemas</li>
              <li>Copias de seguridad periódicas</li>
            </ul>
          </section>

          <section>
            <h2>5. Tus Derechos</h2>
            <p>Tienes derecho a:</p>
            <ul>
              <li>Acceder a tu información personal</li>
              <li>Corregir datos inexactos</li>
              <li>Solicitar la eliminación de datos</li>
              <li>Oponerte al procesamiento de datos</li>
              <li>Retirar tu consentimiento</li>
            </ul>
          </section>

          <section>
            <h2>6. Cookies y Tecnologías Similares</h2>
            <p>Utilizamos cookies y tecnologías similares para:</p>
            <ul>
              <li>Mantener tu sesión activa</li>
              <li>Recordar tus preferencias</li>
              <li>Analizar el uso del servicio</li>
              <li>Mejorar la seguridad</li>
            </ul>
          </section>

          <section>
            <h2>7. Menores de Edad</h2>
            <p>No recopilamos intencionalmente información de menores de 13 años. Si eres padre o tutor y crees que tu hijo nos ha proporcionado información, contáctanos para eliminarla.</p>
          </section>

          <section>
            <h2>8. Cambios en esta Política</h2>
            <p>Podemos actualizar nuestra política de privacidad ocasionalmente. Te notificaremos cualquier cambio publicando la nueva política en esta página y actualizando la fecha de "última actualización".</p>
          </section>

          <section>
            <h2>9. Contacto</h2>
            <p>Si tienes preguntas sobre esta política de privacidad, puedes contactarnos:</p>
            <ul>
              <li>Por correo electrónico: <a href="mailto:privacy@pharmaloc.com">privacy@pharmaloc.com</a></li>
              <li>Por teléfono: +57 300 123 4567</li>
              <li>Por correo postal: Bogotá, Colombia</li>
            </ul>
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
.privacy {
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

h3 {
  color: #2D4739;
  font-size: 1.2rem;
  margin: 1.5rem 0 1rem;
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

  h3 {
    font-size: 1.1rem;
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

  h2, h3 {
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

/* Soporte para preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  a {
    transition: none;
  }
}
</style>

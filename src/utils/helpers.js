// Formatear fecha
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  const finalOptions = { ...defaultOptions, ...options };
  
  if (date instanceof Date) {
    return date.toLocaleDateString('es-ES', finalOptions);
  }
  
  // Si es un timestamp de Firestore
  if (date?.toDate) {
    return date.toDate().toLocaleDateString('es-ES', finalOptions);
  }
  
  return new Date(date).toLocaleDateString('es-ES', finalOptions);
};

// Formatear precio
export const formatPrice = (price) => {
  if (!price && price !== 0) return '';
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

// Validar correo electrónico
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validar contraseña
export const validatePassword = (password) => {
  // Mínimo 6 caracteres, al menos una letra y un número
  const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  return re.test(password);
};

// Validar número de teléfono colombiano
export const validatePhone = (phone) => {
  const re = /^(\+57|57)?[1-9][0-9]{9}$/;
  return re.test(phone);
};

// Obtener el estado del stock
export const getStockStatus = (stock) => {
  if (stock === 0) return { label: 'Sin stock', class: 'out-of-stock' };
  if (stock <= 10) return { label: 'Stock crítico', class: 'critical' };
  if (stock <= 20) return { label: 'Stock bajo', class: 'warning' };
  return { label: 'En stock', class: 'in-stock' };
};

// Generar un color aleatorio para avatares
export const generateAvatarColor = (text) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 40%)`;
};

// Obtener iniciales de un nombre
export const getInitials = (name) => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Truncar texto
export const truncateText = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  
  return text.slice(0, length) + '...';
};

// Calcular tiempo transcurrido
export const timeAgo = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const past = date instanceof Date ? date : new Date(date);
  const diff = now - past;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 7) {
    return formatDate(date);
  }
  
  if (days > 0) {
    return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
  }
  
  if (hours > 0) {
    return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }
  
  if (minutes > 0) {
    return `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  }
  
  return 'hace un momento';
};

// Validar coordenadas geográficas
export const validateCoordinates = (lat, lng) => {
  const validLat = typeof lat === 'number' && lat >= -90 && lat <= 90;
  const validLng = typeof lng === 'number' && lng >= -180 && lng <= 180;
  
  return validLat && validLng;
};

// Calcular distancia entre dos puntos (en kilómetros)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
           Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
           Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Convertir grados a radianes
const toRad = (value) => {
  return value * Math.PI / 180;
};

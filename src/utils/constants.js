// Roles de usuario
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  FARMA_USER: 'farma_user',
  USER: 'user'
};

// Nombres de roles para mostrar
export const ROLE_NAMES = {
  [USER_ROLES.SUPER_ADMIN]: 'Super Administrador',
  [USER_ROLES.FARMA_USER]: 'Usuario Farmacia',
  [USER_ROLES.USER]: 'Usuario Regular'
};

// Estados de usuario
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending'
};

// Estados de stock
export const STOCK_STATUS = {
  OUT_OF_STOCK: 'out_of_stock',
  CRITICAL: 'critical',
  LOW: 'low',
  IN_STOCK: 'in_stock'
};

// Límites de stock
export const STOCK_LIMITS = {
  CRITICAL: 10,
  LOW: 20
};

// Tipos de notificación
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  INVALID_EMAIL: 'El correo electrónico no es válido',
  INVALID_PASSWORD: 'La contraseña debe tener al menos 6 caracteres, una letra y un número',
  INVALID_PHONE: 'El número de teléfono no es válido',
  INVALID_COORDINATES: 'Las coordenadas geográficas no son válidas',
  USER_NOT_FOUND: 'Usuario no encontrado',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción',
  NETWORK_ERROR: 'Error de conexión. Por favor, verifica tu internet',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado'
};

// Mensajes de éxito comunes
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Perfil actualizado correctamente',
  PASSWORD_CHANGED: 'Contraseña cambiada correctamente',
  ITEM_CREATED: 'Elemento creado correctamente',
  ITEM_UPDATED: 'Elemento actualizado correctamente',
  ITEM_DELETED: 'Elemento eliminado correctamente'
};

// Rutas de navegación
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  PHARMACIES: '/pharmacies',
  MEDICINES: '/medicines',
  REVIEWS: '/reviews',
  CONTACT: '/contact',
  // Rutas de administrador
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    PHARMACIES: '/admin/pharmacies',
    MEDICINES: '/admin/medicines',
    REVIEWS: '/admin/reviews',
    SETTINGS: '/admin/settings'
  },
  // Rutas de farmacia
  FARMA: {
    DASHBOARD: '/farma/dashboard',
    MEDICINES: '/farma/medicines',
    PROFILE: '/farma/profile'
  }
};

// Configuración de paginación
export const PAGINATION = {
  ITEMS_PER_PAGE: 10,
  MAX_PAGES_SHOWN: 5
};

// Tipos de ordenamiento
export const SORT_TYPES = {
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
  DATE_ASC: 'date_asc',
  DATE_DESC: 'date_desc',
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
  STOCK_ASC: 'stock_asc',
  STOCK_DESC: 'stock_desc'
};

// Filtros predefinidos
export const FILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock'
};

// Configuración de la aplicación
export const APP_CONFIG = {
  NAME: 'PharmaLoc',
  DESCRIPTION: 'Sistema de gestión de farmacias y medicamentos',
  VERSION: '1.0.0',
  COMPANY: 'PharmaLoc Inc.',
  SUPPORT_EMAIL: 'support@pharmaloc.com',
  DEFAULT_LANGUAGE: 'es',
  TIMEZONE: 'America/Bogota'
};

// Configuración de validación
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_REGEX: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
  PHONE_REGEX: /^(\+57|57)?[1-9][0-9]{9}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// Estados de carga
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Tipos de archivos permitidos
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/gif'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// Límites de archivos
export const FILE_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES: 5
};

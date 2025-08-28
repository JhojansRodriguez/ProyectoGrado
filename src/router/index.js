import { createRouter, createWebHistory } from 'vue-router';
import { 
  requireAuth, 
  requireSuperAdmin, 
  requireFarmaUser,
  redirectIfAuthenticated 
} from './middleware';
import { useAuthStore } from '../store/auth';

// Importar vistas
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Terms from '../views/Terms.vue';
import Privacy from '../views/Privacy.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    beforeEnter: redirectIfAuthenticated
  },
  // Rutas públicas
  {
    path: '/pharmacies',
    name: 'Pharmacies',
    component: () => import('../views/Pharmacies.vue')
  },
  {
    path: '/medicines',
    name: 'Medicines',
    component: () => import('../views/Medicines.vue')
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('../views/Contact.vue')
  },
  {
    path: '/terms',
    name: 'Terms',
    component: Terms
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: Privacy
  },
  // Rutas protegidas para usuarios regulares
  {
    path: '/profile',
    name: 'UserProfile',
    component: () => import('../views/user/Profile.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/reviews',
    name: 'Reviews',
    component: () => import('../views/user/Reviews.vue'),
    beforeEnter: requireAuth
  },
  // Rutas para usuarios de farmacia
  {
    path: '/farma',
    beforeEnter: requireFarmaUser,
    children: [
      {
        path: 'dashboard',
        name: 'FarmaDashboard',
        component: () => import('../views/farma/Dashboard.vue')
      },
      {
        path: 'medicines',
        name: 'FarmaMedicines',
        component: () => import('../views/farma/Medicines.vue')
      },
      {
        path: 'profile',
        name: 'FarmaProfile',
        component: () => import('../views/farma/Profile.vue')
      }
    ]
  },
  // Rutas para super administrador
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    beforeEnter: requireSuperAdmin,
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/Dashboard.vue')
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/admin/Users.vue')
      },
      {
        path: 'pharmacies',
        name: 'AdminPharmacies',
        component: () => import('../views/admin/Pharmacies.vue')
      }
    ]
  },
  // Página de error 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  },
  // Página de acceso no autorizado
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('../views/Unauthorized.vue')
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// Middleware global para verificar autenticación
router.beforeEach(async (to, from, next) => {
  // Si la ruta requiere autenticación
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const authStore = useAuthStore();
    if (authStore.loading) {
      await authStore.checkAuth();
    }
    
    if (!authStore.isAuthenticated) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;

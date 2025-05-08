import { 
  getAuth, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './config';

const auth = getAuth();

// Roles de usuario
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  FARMA_USER: 'farma_user',
  USER: 'users'
};

// Función para iniciar sesión
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Intentar obtener datos de ambas colecciones
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const farmaUserDoc = await getDoc(doc(db, 'farma_user', user.uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        uid: user.uid,
        email: user.email,
        role: userData.role,
        displayName: userData.displayName,
        userType: 'users',
        ...userData
      };
    } else if (farmaUserDoc.exists()) {
      const userData = farmaUserDoc.data();
      return {
        uid: user.uid,
        email: user.email,
        role: userData.role,
        displayName: userData.displayName,
        userType: 'farma_user',
        ...userData
      };
    }
    
    throw new Error('Usuario no encontrado en la base de datos');
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    throw error;
  }
};

// Función para cerrar sesión
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw error;
  }
};

// Función para obtener el usuario actual y sus datos
export const getCurrentUser = async () => {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    // Intentar obtener datos de ambas colecciones
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const farmaUserDoc = await getDoc(doc(db, 'farma_user', user.uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        uid: user.uid,
        email: user.email,
        role: userData.role,
        displayName: userData.displayName,
        userType: 'users',
        ...userData
      };
    } else if (farmaUserDoc.exists()) {
      const userData = farmaUserDoc.data();
      return {
        uid: user.uid,
        email: user.email,
        role: userData.role,
        displayName: userData.displayName,
        userType: 'farma_user',
        ...userData
      };
    }
    return null;
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return null;
  }
};

// Función para verificar permisos
export const checkPermission = (userRole, requiredRole) => {
  const roleHierarchy = {
    [USER_ROLES.SUPER_ADMIN]: 3,
    [USER_ROLES.FARMA_USER]: 2,
    [USER_ROLES.USER]: 1
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

// Observable para cambios en el estado de autenticación
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        // Intentar obtener datos de ambas colecciones
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const farmaUserDoc = await getDoc(doc(db, 'farma_user', user.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          callback({
            uid: user.uid,
            email: user.email,
            role: userData.role,
            displayName: userData.displayName,
            userType: 'users',
            ...userData
          });
        } else if (farmaUserDoc.exists()) {
          const userData = farmaUserDoc.data();
          callback({
            uid: user.uid,
            email: user.email,
            role: userData.role,
            displayName: userData.displayName,
            userType: 'farma_user',
            ...userData
          });
        } else {
          callback(null);
        }
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};

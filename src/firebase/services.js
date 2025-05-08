import { db } from './config';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';

// Servicio para obtener las farmacias
export const getPharmacies = async () => {
  try {
    const pharmaciesCollection = collection(db, 'farma_user');
    const pharmaciesSnapshot = await getDocs(pharmaciesCollection);
    const pharmacies = pharmaciesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.display_name || 'Farmacia',
        address: data.farma_address || 'Dirección no disponible',
        ...data
      };
    });
    console.log('Farmacias obtenidas:', pharmacies);
    return pharmacies;
  } catch (error) {
    console.error('Error obteniendo farmacias:', error);
    throw error;
  }
};

// Servicio para obtener los medicamentos del usuario farma
export const getMedicines = async (pharmacyId) => {
  try {
    console.log('Iniciando obtención de medicamentos para farmacia:', pharmacyId);
    
    const pharmacyRef = doc(db, 'farma_user', pharmacyId);
    const pharmacyDoc = await getDoc(pharmacyRef);
    
    if (!pharmacyDoc.exists()) {
      throw new Error('Farmacia no encontrada');
    }
    
    const pharmacyData = pharmacyDoc.data();
    const medicinesCollection = collection(pharmacyRef, 'medicamentos');
    const medicinesSnapshot = await getDocs(medicinesCollection);
    
    console.log('Snapshot obtenido, número de documentos:', medicinesSnapshot.size);
    
    const medicines = medicinesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        pharmacyId: pharmacyId,
        pharmacyName: pharmacyData.displayName || 'Farmacia',
        name: data.name || '',
        description: data.description || '',
        price: Number(data.price) || 0,
        specifications: data.specifications || '',
        stock: Number(data.stock) || 0,
        created_at: data.created_at?.toDate() || new Date(),
        updated_at: data.updated_at?.toDate() || new Date()
      };
    });

    console.log('Medicamentos procesados:', medicines.length);
    return medicines;
  } catch (error) {
    console.error("Error detallado al obtener medicamentos:", error);
    throw error;
  }
};


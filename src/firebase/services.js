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
  serverTimestamp,
  orderBy,
  limit 
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
        photo: data.photo_url || 'Photo',
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
        photo: data.photo || null,
        photoPath: data.photoPath || null,
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
export const getPharmacyReviews = async (pharmacyId, max = 5) => {
  const reviewsRef = collection(db, 'reviews'); // <-- asegúrate del nombre
  const q = query(
    reviewsRef,
    where('pharmacyId', '==', pharmacyId),
    orderBy('created_time', 'desc'),
    limit(max)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
export const addMedicine = async (pharmacyId, data) => {
  if (!pharmacyId) throw new Error('pharmacyId requerido');
  if (!data) throw new Error('Datos del medicamento requeridos');

  // Normaliza tipos
  const price = Number(String(data.price).toString().replace(',', '.'));
  const stock = Number(data.stock);

  const payload = {
    name: String(data.name || '').trim(),
    description: String(data.description || '').trim(),
    specifications: String(data.specifications || '').trim(),
    price: isNaN(price) ? 0 : price,
    stock: isNaN(stock) ? 0 : stock,
    photo: data.photo || null,
    photoPath: data.photoPath || null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  };

  const medicinesRef = collection(doc(db, 'farma_user', pharmacyId), 'medicamentos');
  const docRef = await addDoc(medicinesRef, payload);
  return docRef.id;
};

export const updateMedicine = async (pharmacyId, medicineId, data) => {
  if (!pharmacyId) throw new Error('pharmacyId requerido');
  if (!medicineId) throw new Error('medicineId requerido');
  if (!data) throw new Error('Datos del medicamento requeridos');

  const ref = doc(db, 'farma_user', pharmacyId, 'medicamentos', medicineId);

  // Construye un payload parcial evitando pisar campos que no tocas
  const partial = {};

  if (data.name !== undefined) partial.name = String(data.name).trim();
  if (data.description !== undefined) partial.description = String(data.description).trim();
  if (data.specifications !== undefined) partial.specifications = String(data.specifications).trim();

  if (data.photo !== undefined) partial.photo = data.photo || null;
  if (data.photoPath !== undefined) partial.photoPath = data.photoPath || null;

  if (data.price !== undefined) {
    const price = Number(String(data.price).toString().replace(',', '.'));
    partial.price = isNaN(price) ? 0 : price;
  }
  if (data.stock !== undefined) {
    const stock = Number(data.stock);
    partial.stock = isNaN(stock) ? 0 : stock;
  }

  partial.updated_at = serverTimestamp();

  await updateDoc(ref, partial);
};

export const deleteMedicine = async (pharmacyId, medicineId) => {
  if (!pharmacyId) throw new Error('pharmacyId requerido');
  if (!medicineId) throw new Error('medicineId requerido');

  const ref = doc(db, 'farma_user', pharmacyId, 'medicamentos', medicineId);
  await deleteDoc(ref);
};

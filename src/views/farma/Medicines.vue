<template>
  <div class="medicines-management">
    <!-- Encabezado con botón de agregar -->
    <div class="page-header">
      <h1>Gestión de Medicamentos</h1>
      <button class="btn-add" @click="showAddModal = true">
        <i class="fas fa-plus"></i>
        Agregar Medicamento
      </button>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="filters-section">
      <div class="search-bar">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Buscar medicamento..."
          @input="filterMedicines"
        >
      </div>

      <div class="filter-options">
        <select v-model="stockFilter" @change="filterMedicines">
          <option value="all">Todos los medicamentos</option>
          <option value="inStock">En stock</option>
          <option value="lowStock">Stock bajo</option>
          <option value="outOfStock">Sin stock</option>
        </select>

        <select v-model="sortBy" @change="filterMedicines">
          <option value="name">Ordenar por nombre</option>
          <option value="priceAsc">Precio: menor a mayor</option>
          <option value="priceDesc">Precio: mayor a menor</option>
          <option value="stock">Stock disponible</option>
        </select>
      </div>
    </div>

    <!-- Lista de medicamentos -->
    <div class="medicines-list">
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        Cargando medicamentos...
      </div>

      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        {{ error }}
        <button @click="loadMedicines" class="btn-retry">
          Reintentar
        </button>
      </div>

      <div v-else-if="filteredMedicines.length === 0" class="empty-state">
        <i class="fas fa-pills"></i>
        <p>No se encontraron medicamentos</p>
        <button class="btn-add" @click="showAddModal = true">
          Agregar Medicamento
        </button>
      </div>

      <div v-else class="medicines-grid">
        <div
          v-for="medicine in filteredMedicines" 
          :key="medicine.id" 
          class="medicine-card"
        >
          <!-- Foto del medicamento -->
          <div class="medicine-photo" v-if="medicine.photo">
            <img :src="medicine.photo" alt="Foto del medicamento" />
          </div>

          <div class="medicine-header">
            <div>
              <h3>{{ medicine.name }}</h3>
              <p class="pharmacy-name">{{ medicine.pharmacyName }}</p>
            </div>
            <div class="medicine-actions">
              <button @click="editMedicine(medicine)" class="btn-icon">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="confirmDelete(medicine)" class="btn-icon delete">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>

          <div class="medicine-body">
            <p class="description">{{ medicine.description }}</p>
            <p class="specifications">{{ medicine.specifications }}</p>
            
            <div class="medicine-details">
              <div class="price">
                <i class="fas fa-tag"></i>
                {{ formatPrice(medicine.price) }} COP
              </div>
              <div class="stock" :class="getStockClass(medicine.stock)">
                <i class="fas fa-boxes"></i>
                {{ medicine.stock }} unidades
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para agregar/editar medicamento -->
    <div v-if="showAddModal || editingMedicine" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ editingMedicine ? 'Editar' : 'Agregar' }} Medicamento</h2>
          <button class="btn-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="medicine-form">
          <div class="form-group">
            <label for="name">Nombre del Medicamento</label>
            <input 
              id="name"
              v-model="medicineForm.name"
              type="text"
              required
              placeholder="Nombre del medicamento"
            >
          </div>

          <div class="form-group">
            <label for="description">Descripción</label>
            <textarea 
              id="description"
              v-model="medicineForm.description"
              required
              placeholder="Descripción del medicamento"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="specifications">Especificaciones</label>
            <input 
              id="specifications"
              v-model="medicineForm.specifications"
              type="text"
              required
              placeholder="Ej: 500mg, tabletas"
            >
          </div>

          <!-- Foto del medicamento -->
          <div class="form-group">
            <label for="photo">Foto</label>
            <input
              id="photo"
              type="file"
              accept="image/*"
              @change="handlePhotoChange"
            />
            <div v-if="photoPreview" class="photo-preview">
              <img :src="photoPreview" alt="Previsualización" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="price">Precio</label>
              <input 
                id="price"
                v-model.number="medicineForm.price"
                type="number"
                required
                min="0"
                step="any"
                inputmode="decimal"
              >
            </div>

            <div class="form-group">
              <label for="stock">Stock</label>
              <input 
                id="stock"
                v-model.number="medicineForm.stock"
                type="number"
                required
                min="0"
                step="1"
                inputmode="numeric"
              >
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeModal">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Guardando...' : (editingMedicine ? 'Actualizar' : 'Agregar') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de confirmación para eliminar -->
    <div v-if="medicineToDelete" class="modal-overlay">
      <div class="modal-content confirm-dialog">
        <div class="modal-header">
          <h2>Confirmar Eliminación</h2>
          <button class="btn-close" @click="medicineToDelete = null">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="confirm-body">
          <i class="fas fa-exclamation-triangle"></i>
          <p>¿Estás seguro de que deseas eliminar el medicamento "{{ medicineToDelete.name }}"?</p>
          <p class="warning">Esta acción no se puede deshacer.</p>
        </div>

        <div class="confirm-actions">
          <button class="btn-secondary" @click="medicineToDelete = null">
            Cancelar
          </button>
          <button 
            class="btn-danger" 
            @click="handleDelete" 
            :disabled="deleting"
          >
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { getMedicines, addMedicine, updateMedicine, deleteMedicine as deleteFirebaseMedicine } from '../../firebase/services';
import { useAuthStore } from '../../store/auth';

// Firebase Storage para fotos
import { storage } from '../../firebase/config';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const authStore = useAuthStore();

// Estado
const medicines = ref([]);
const filteredMedicines = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');
const stockFilter = ref('all');
const sortBy = ref('name');
const showAddModal = ref(false);
const editingMedicine = ref(null);
const medicineToDelete = ref(null);
const submitting = ref(false);
const deleting = ref(false);

// Foto - estado
const photoFile = ref(null);
const photoPreview = ref('');

// Computed
const pharmacyMedicines = computed(() => {
  return medicines.value.filter(medicine => medicine.pharmacyId === authStore.user?.uid);
});

// Formulario
const medicineForm = ref({
  name: '',
  description: '',
  specifications: '',
  price: 0,
  stock: 0
});

// Métodos
const loadMedicines = async () => {
  try {
    loading.value = true;
    error.value = null;
    if (!authStore.user?.uid) {
      throw new Error('Usuario no autenticado');
    }
    medicines.value = await getMedicines(authStore.user.uid);
    filterMedicines();
  } catch (err) {
    error.value = 'Error al cargar los medicamentos';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const filterMedicines = () => {
  let filtered = [...pharmacyMedicines.value];

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(medicine => 
      medicine.name.toLowerCase().includes(query) ||
      medicine.description.toLowerCase().includes(query)
    );
  }

  // Filtrar por stock
  switch (stockFilter.value) {
    case 'inStock':
      filtered = filtered.filter(m => m.stock > 20);
      break;
    case 'lowStock':
      filtered = filtered.filter(m => m.stock > 0 && m.stock <= 20);
      break;
    case 'outOfStock':
      filtered = filtered.filter(m => m.stock === 0);
      break;
  }

  // Ordenar
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'priceAsc':
        return a.price - b.price;
      case 'priceDesc':
        return b.price - a.price;
      case 'stock':
        return b.stock - a.stock;
      default:
        return 0;
    }
  });

  filteredMedicines.value = filtered;
};

const formatPrice = (price) => {
  try {
    return Number(price || 0).toLocaleString('es-CO');
  } catch {
    return price;
  }
};

const getStockClass = (stock) => {
  if (stock === 0) return 'out-of-stock';
  if (stock <= 10) return 'critical';
  if (stock <= 20) return 'warning';
  return 'in-stock';
};

const handlePhotoChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) {
    photoFile.value = null;
    photoPreview.value = '';
    return;
  }
  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona una imagen válida.');
    return;
  }
  const maxMB = 5;
  if (file.size > maxMB * 1024 * 1024) {
    alert(`La imagen supera ${maxMB}MB.`);
    return;
  }
  photoFile.value = file;
  photoPreview.value = URL.createObjectURL(file);
};

async function uploadPhotoIfNeeded(uid) {
  if (!photoFile.value) return null;
  const file = photoFile.value;
  const safeName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  const path = `pharmacy-photos/${uid}/${safeName}`;
  const refObj = storageRef(storage, path);
  // Importante: enviar contentType para cumplir reglas de tipo en Storage
  await uploadBytes(refObj, file, { contentType: file.type || 'application/octet-stream' });
  const url = await getDownloadURL(refObj);
  return { url, path };
}

async function deleteExistingPhotoIfAny(path) {
  if (!path) return;
  try {
    const refObj = storageRef(storage, path);
    await deleteObject(refObj);
  } catch (e) {
    console.warn('No se pudo borrar la foto anterior o no existe:', e?.message || e);
  }
}

const editMedicine = (medicine) => {
  editingMedicine.value = medicine;
  // Copia solo campos editables, evitando id/pharmacyId/fechas/etc.
  medicineForm.value = {
    name: medicine.name || '',
    description: medicine.description || '',
    specifications: medicine.specifications || '',
    price: Number(medicine.price) || 0,
    stock: Number(medicine.stock) || 0
  };
  // Previsualiza la imagen existente
  photoPreview.value = medicine.photo || '';
  photoFile.value = null;
  showAddModal.value = true;
};

const confirmDelete = (medicine) => {
  medicineToDelete.value = medicine;
};

const closeModal = () => {
  showAddModal.value = false;
  editingMedicine.value = null;
  medicineForm.value = {
    name: '',
    description: '',
    specifications: '',
    price: 0,
    stock: 0
  };
  // Reset foto
  photoFile.value = null;
  photoPreview.value = '';
};

const handleSubmit = async () => {
  try {
    submitting.value = true;
    if (!authStore.user?.uid) {
      throw new Error('Usuario no autenticado');
    }

    // Normaliza y arma payload explícito
    const payload = {
      name: String(medicineForm.value.name || '').trim(),
      description: String(medicineForm.value.description || '').trim(),
      specifications: String(medicineForm.value.specifications || '').trim(),
      price: Number(String(medicineForm.value.price).toString().replace(',', '.')),
      stock: Number(medicineForm.value.stock)
    };

    if (editingMedicine.value) {
      // Si hay nueva foto, borra la anterior y sube la nueva
      if (photoFile.value) {
        await deleteExistingPhotoIfAny(editingMedicine.value.photoPath);
        const uploadRes = await uploadPhotoIfNeeded(authStore.user.uid);
        if (uploadRes) {
          payload.photo = uploadRes.url;
          payload.photoPath = uploadRes.path;
        }
      }
      await updateMedicine(authStore.user.uid, editingMedicine.value.id, payload);
    } else {
      // Creación: sube foto si se seleccionó
      const uploadRes = await uploadPhotoIfNeeded(authStore.user.uid);
      if (uploadRes) {
        payload.photo = uploadRes.url;
        payload.photoPath = uploadRes.path;
      } else {
        payload.photo = null;
      }
      await addMedicine(authStore.user.uid, payload);
    }
    
    await loadMedicines();
    closeModal();
  } catch (err) {
    error.value = 'Error al guardar el medicamento';
    console.error(err);
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async () => {
  try {
    deleting.value = true;
    if (!authStore.user?.uid || !medicineToDelete.value) {
      throw new Error('Usuario no autenticado o medicamento no seleccionado');
    }

    // Borra la foto del Storage si hay path guardado
    if (medicineToDelete.value.photoPath) {
      await deleteExistingPhotoIfAny(medicineToDelete.value.photoPath);
    }

    await deleteFirebaseMedicine(authStore.user.uid, medicineToDelete.value.id);
    await loadMedicines();
    medicineToDelete.value = null;
  } catch (err) {
    error.value = 'Error al eliminar el medicamento';
    console.error(err);
  } finally {
    deleting.value = false;
  }
};

// Cargar datos iniciales
loadMedicines();
</script>

<style scoped>
.medicines-management {
  padding: 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  color: #2D4739;
}

/* Estilos de filtros */
.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-bar {
  flex: 1;
  min-width: 300px;
  position: relative;
}

.search-bar i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #5F7F79;
}

.search-bar input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #E8F1F2;
  border-radius: 8px;
  font-size: 1rem;
}

.filter-options {
  display: flex;
  gap: 1rem;
}

select {
  padding: 0.75rem 1rem;
  border: 2px solid #E8F1F2;
  border-radius: 8px;
  background: white;
  color: #2D4739;
  min-width: 200px;
}

/* Grid de medicamentos */
.medicines-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.medicine-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

/* Foto en tarjeta */
.medicine-photo {
  width: 100%;
  height: 160px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
  background: #f4f6f8;
  display: flex;
  align-items: center;
  justify-content: center;
}
.medicine-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.medicine-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.medicine-header h3 {
  margin: 0;
  color: #2D4739;
}

.pharmacy-name {
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
  color: #666;
}

.medicine-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  color: #5F7F79;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
}

.btn-icon:hover {
  background: #E8F1F2;
}

.btn-icon.delete {
  color: #dc3545;
}

.btn-icon.delete:hover {
  background: #fde8e8;
}

.medicine-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.description {
  color: #666;
  margin: 0;
}

.specifications {
  color: #5F7F79;
  font-style: italic;
  margin: 0;
}

.medicine-details {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.price, .stock {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price {
  color: #5F7F79;
  font-weight: 600;
}

.stock {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
}

.stock.out-of-stock {
  background: #fde8e8;
  color: #dc3545;
}

.stock.critical {
  background: #fff3cd;
  color: #856404;
}

.stock.warning {
  background: #fff3cd;
  color: #856404;
}

.stock.in-stock {
  background: #d4edda;
  color: #155724;
}

/* Estados de carga y error */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.error-state {
  color: #dc3545;
}

.empty-state i,
.error-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

/* Modales */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* Previsualización de foto en formulario */
.photo-preview {
  margin-top: 0.75rem;
  width: 100%;
  max-height: 220px;
  border-radius: 8px;
  overflow: hidden;
  background: #f4f6f8;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #E8F1F2;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #2D4739;
}

.btn-close {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
}

/* Formulario */
.medicine-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2D4739;
}

input, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #E8F1F2;
  border-radius: 8px;
  font-size: 1rem;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #5F7F79;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

/* Botones */
.btn-primary,
.btn-secondary,
.btn-danger,
.btn-add {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.btn-primary {
  background: #5F7F79;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #4a6561;
}

.btn-secondary {
  background: white;
  color: #5F7F79;
  border: 2px solid #5F7F79;
}

.btn-secondary:hover {
  background: #E8F1F2;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-add {
  background: #5F7F79;
  color: white;
  border: none;
}

.btn-add:hover {
  background: #4a6561;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Diálogo de confirmación */
.confirm-dialog {
  max-width: 400px;
}

.confirm-body {
  padding: 2rem;
  text-align: center;
}

.confirm-body i {
  font-size: 3rem;
  color: #ffc107;
  margin-bottom: 1rem;
}

.confirm-body .warning {
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.confirm-actions {
  padding: 1.5rem;
  border-top: 1px solid #E8F1F2;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

@media (max-width: 768px) {
  .filters-section {
    flex-direction: column;
  }

  .search-bar {
    min-width: 100%;
  }

  .filter-options {
    flex-direction: column;
  }

  select {
    width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
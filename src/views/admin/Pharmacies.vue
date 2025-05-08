<!-- Vista de administración de farmacias -->
<template>
  <div class="admin-pharmacies">
    <header class="page-header">
      <h1>Administración de Farmacias</h1>
      <BaseButton @click="openCreateModal">
        <i class="fas fa-plus"></i>
        Nueva Farmacia
      </BaseButton>
    </header>

    <div class="content">
      <div v-if="loading" class="loading">
        <LoadingSpinner />
      </div>
      <div v-else-if="error" class="error">
        <BaseErrorState :message="error" />
      </div>
      <div v-else>
        <BaseTable
          :headers="tableHeaders"
          :items="pharmacies"
          :loading="loading"
        >
          <template #item-status="{ item }">
            <BaseBadge
              :variant="item.active ? 'success' : 'error'"
            >
              {{ item.active ? 'Activo' : 'Inactivo' }}
            </BaseBadge>
          </template>
          <template #item-actions="{ item }">
            <div class="actions">
              <BaseButton
                variant="primary"
                size="sm"
                @click="editPharmacy(item)"
              >
                <i class="fas fa-edit"></i>
              </BaseButton>
              <BaseButton
                variant="danger"
                size="sm"
                @click="deletePharmacy(item)"
              >
                <i class="fas fa-trash"></i>
              </BaseButton>
            </div>
          </template>
        </BaseTable>
      </div>
    </div>

    <!-- Modal de creación/edición -->
    <BaseModal
      v-if="showModal"
      :title="editingPharmacy ? 'Editar Farmacia' : 'Nueva Farmacia'"
      @close="closeModal"
    >
      <template #default>
        <BaseForm @submit="handleSubmit">
          <BaseFormGroup label="Nombre">
            <BaseInput
              v-model="form.name"
              required
              placeholder="Nombre de la farmacia"
            />
          </BaseFormGroup>

          <BaseFormGroup label="Dirección">
            <BaseInput
              v-model="form.address"
              required
              placeholder="Dirección de la farmacia"
            />
          </BaseFormGroup>

          <BaseFormGroup label="Teléfono">
            <BaseInput
              v-model="form.phone"
              type="tel"
              required
              placeholder="Teléfono de contacto"
            />
          </BaseFormGroup>

          <BaseFormGroup label="Estado">
            <BaseSelect
              v-model="form.active"
              :options="[
                { value: true, label: 'Activo' },
                { value: false, label: 'Inactivo' }
              ]"
            />
          </BaseFormGroup>
        </BaseForm>
      </template>
      <template #footer>
        <BaseButton
          variant="secondary"
          @click="closeModal"
        >
          Cancelar
        </BaseButton>
        <BaseButton
          variant="primary"
          :loading="submitting"
          @click="handleSubmit"
        >
          {{ editingPharmacy ? 'Guardar Cambios' : 'Crear Farmacia' }}
        </BaseButton>
      </template>
    </BaseModal>

    <!-- Diálogo de confirmación para eliminar -->
    <ConfirmDialog
      v-if="pharmacyToDelete"
      title="Eliminar Farmacia"
      message="¿Estás seguro de que deseas eliminar esta farmacia? Esta acción no se puede deshacer."
      confirm-text="Eliminar"
      cancel-text="Cancelar"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="pharmacyToDelete = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getPharmacies } from '../../firebase/services';
import { useNotificationStore } from '../../store/notifications';
import BaseButton from '../../components/BaseButton.vue';
import BaseTable from '../../components/BaseTable.vue';
import BaseBadge from '../../components/BaseBadge.vue';
import BaseModal from '../../components/BaseModal.vue';
import BaseForm from '../../components/BaseForm.vue';
import BaseFormGroup from '../../components/BaseFormGroup.vue';
import BaseInput from '../../components/BaseInput.vue';
import BaseSelect from '../../components/BaseSelect.vue';
import LoadingSpinner from '../../components/LoadingSpinner.vue';
import BaseErrorState from '../../components/BaseErrorState.vue';
import ConfirmDialog from '../../components/ConfirmDialog.vue';

const notificationStore = useNotificationStore();

// Estado
const pharmacies = ref([]);
const loading = ref(true);
const error = ref(null);
const showModal = ref(false);
const editingPharmacy = ref(null);
const pharmacyToDelete = ref(null);
const submitting = ref(false);
const deleting = ref(false);

// Formulario
const form = ref({
  name: '',
  address: '',
  phone: '',
  active: true
});

// Configuración de la tabla
const tableHeaders = [
  { key: 'name', label: 'Nombre' },
  { key: 'address', label: 'Dirección' },
  { key: 'phone', label: 'Teléfono' },
  { key: 'status', label: 'Estado' },
  { key: 'actions', label: 'Acciones' }
];

// Cargar datos
onMounted(async () => {
  try {
    const data = await getPharmacies();
    pharmacies.value = data;
  } catch (err) {
    error.value = 'Error al cargar las farmacias';
    console.error(err);
  } finally {
    loading.value = false;
  }
});

// Métodos
const openCreateModal = () => {
  editingPharmacy.value = null;
  form.value = {
    name: '',
    address: '',
    phone: '',
    active: true
  };
  showModal.value = true;
};

const editPharmacy = (pharmacy) => {
  editingPharmacy.value = pharmacy;
  form.value = { ...pharmacy };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingPharmacy.value = null;
  form.value = {
    name: '',
    address: '',
    phone: '',
    active: true
  };
};

const handleSubmit = async () => {
  try {
    submitting.value = true;
    // TODO: Implementar lógica de guardado
    notificationStore.success(
      editingPharmacy.value
        ? 'Farmacia actualizada correctamente'
        : 'Farmacia creada correctamente'
    );
    closeModal();
    await loadPharmacies();
  } catch (error) {
    console.error('Error:', error);
    notificationStore.error(
      editingPharmacy.value
        ? 'Error al actualizar la farmacia'
        : 'Error al crear la farmacia'
    );
  } finally {
    submitting.value = false;
  }
};

const deletePharmacy = (pharmacy) => {
  pharmacyToDelete.value = pharmacy;
};

const confirmDelete = async () => {
  try {
    deleting.value = true;
    // TODO: Implementar lógica de eliminación
    notificationStore.success('Farmacia eliminada correctamente');
    pharmacyToDelete.value = null;
    await loadPharmacies();
  } catch (error) {
    console.error('Error:', error);
    notificationStore.error('Error al eliminar la farmacia');
  } finally {
    deleting.value = false;
  }
};

const loadPharmacies = async () => {
  try {
    loading.value = true;
    const data = await getPharmacies();
    pharmacies.value = data;
  } catch (err) {
    error.value = 'Error al cargar las farmacias';
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.admin-pharmacies {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-color);
}

.content {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .content {
    background: #2d3748;
  }
}
</style>

<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { doc } from 'firebase/firestore';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toast-notification';
import Product from '@/db/Product';
import { db } from '@/config/firebaseConfig';
import { useAuthStore } from '@/store/auth';
import { useAdminStore } from '@/store/admin';
import { findSlugAndRedirect } from '@/util';
import { PktBreadcrumbs } from '@oslokommune/punkt-vue';
import { BtnSave } from '@/components/generic/form';

const toast = useToast();
const i18n = useI18n();

const { user, isSuperAdmin } = storeToRefs(useAuthStore());
const { users, departments } = storeToRefs(useAdminStore());
const loading = ref(false);

const breadcrumbs = computed(() => [
  { text: i18n.t('general.admin'), href: { name: 'Admin' } },
  { text: i18n.t('admin.product.create') },
]);

const departmentOptions = computed(() =>
  departments.value
    .filter((o) => isSuperAdmin.value || user.value.admin.includes(o.id))
    .map(({ id, name, organization }) => ({ id, name, organization_id: organization.id }))
);

async function save(values) {
  loading.value = true;
  try {
    const { name, missionStatement, department, team } = values;
    const productRef = await Product.create({
      name,
      missionStatement,
      department: doc(db, 'departments', department.id),
      organization: doc(db, 'organizations', department.organization_id),
      archived: false,
      team: team?.map(({ id }) => doc(db, 'users', id)) || [],
    });
    await findSlugAndRedirect(productRef);
    toast.success(i18n.t('toaster.add.product'));
  } catch {
    toast.error(i18n.t('toaster.error.product'));
    loading.value = false;
  }
}
</script>

<template>
  <PageLayout breakpoint="tablet">
    <template #header>
      <PktBreadcrumbs navigation-type="router" :breadcrumbs="breadcrumbs" />
    </template>

    <div class="card">
      <h1 class="title-1">{{ $t('admin.product.create') }}</h1>

      <FormSection>
        <FormComponent
          input-type="input"
          name="name"
          :label="$t('fields.name')"
          rules="required"
          type="text"
        />

        <FormComponent
          input-type="textarea"
          name="missionStatement"
          :label="$t('fields.missionStatement')"
          rules="required"
        />

        <FormComponent
          input-type="custom-select"
          name="department"
          :label="$t('admin.product.parentDepartment')"
          value-prop="id"
          label-prop="name"
          :store-object="true"
          rules="required"
          :options="departmentOptions"
          :can-clear="false"
        />

        <FormComponent
          input-type="custom-select"
          select-mode="tags"
          name="team"
          :label="$t('general.teamMembers')"
          value-prop="id"
          :tag-label="(o) => o.displayName || o.id"
          :option-label="(o) => (o.displayName ? `${o.displayName} (${o.id})` : o.id)"
          :store-object="true"
          :options="users"
        />

        <template #actions="{ submit, disabled }">
          <BtnSave
            :text="$t('btn.create')"
            :disabled="disabled || loading"
            @on-click="submit(save)"
          />
        </template>
      </FormSection>
    </div>
  </PageLayout>
</template>

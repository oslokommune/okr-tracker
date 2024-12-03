<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { doc } from 'firebase/firestore';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toast-notification';
import Department from '@/db/Department';
import { db } from '@/config/firebaseConfig';
import { findSlugAndRedirect } from '@/util';
import { useAuthStore } from '@/store/auth';
import { useAdminStore } from '@/store/admin';
import { PktBreadcrumbs } from '@oslokommune/punkt-vue';
import { BtnSave } from '@/components/generic/form';

const toast = useToast();
const i18n = useI18n();

const { user, isSuperAdmin } = storeToRefs(useAuthStore());
const { organizations, users } = storeToRefs(useAdminStore());
const loading = ref(false);

const breadcrumbs = computed(() => [
  { text: i18n.t('general.admin'), href: { name: 'Admin' } },
  { text: i18n.t('admin.department.create') },
]);

const organizationOptions = computed(() =>
  organizations.value
    .filter((o) => isSuperAdmin.value || user.value.admin.includes(o.id))
    .map(({ id, name }) => ({ id, name }))
);

async function save(values) {
  loading.value = true;
  try {
    const { name, missionStatement, organization, team } = values;
    const depRef = await Department.create({
      name,
      missionStatement,
      organization: doc(db, 'organizations', organization.id),
      archived: false,
      team: team?.map(({ id }) => doc(db, 'users', id)) || [],
    });
    await findSlugAndRedirect(depRef);
    toast.success(i18n.t('toaster.add.department'));
  } catch {
    toast.error(i18n.t('toaster.error.department'));
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
      <h1 class="title-1">{{ $t('admin.department.create') }}</h1>
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
          name="organization"
          :label="$t('admin.department.parentOrganisation')"
          value-prop="id"
          label-prop="name"
          :store-object="true"
          rules="required"
          :can-clear="false"
          :options="organizationOptions"
        />

        <FormComponent
          input-type="custom-select"
          select-mode="tags"
          name="team"
          :label="$t('general.teamMembers')"
          value-prop="id"
          :tag-label="(o) => o.displayName || o.id"
          :option-label="(o) => (o.displayName ? `${o.displayName} (${o.id})` : o.id)"
          :track-by="['displayName', 'id']"
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

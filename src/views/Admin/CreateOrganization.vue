<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { doc } from 'firebase/firestore';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toast-notification';
import Organization from '@/db/Organization';
import { db } from '@/config/firebaseConfig';
import { useAdminStore } from '@/store/admin';
import { findSlugAndRedirect } from '@/util';
import { PktBreadcrumbs } from '@oslokommune/punkt-vue';
import { BtnSave } from '@/components/generic/form';

const toast = useToast();
const i18n = useI18n();

const { users } = storeToRefs(useAdminStore());
const loading = ref(false);

const breadcrumbs = computed(() => [
  { text: i18n.t('general.admin'), href: { name: 'Admin' } },
  { text: i18n.t('admin.organization.create') },
]);

async function save(values) {
  loading.value = true;
  try {
    const { name, missionStatement, team } = values;
    const orgRef = await Organization.create({
      name,
      missionStatement,
      archived: false,
      team: team?.map(({ id }) => doc(db, 'users', id)) || [],
    });
    await findSlugAndRedirect(orgRef);
    toast.success(i18n.t('toaster.add.organization'));
  } catch {
    toast.error(i18n.t('toaster.error.organization'));
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
      <h1 class="title-1">{{ $t('admin.organization.create') }}</h1>

      <FormSection>
        <FormComponent
          input-type="input"
          name="name"
          rules="required"
          :label="$t('fields.name')"
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

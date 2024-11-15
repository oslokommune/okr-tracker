<script setup>
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useCollection } from 'vuefire';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toast-notification';
import { collection, doc } from 'firebase/firestore';
import { useTrackerStore } from '@/store/tracker';
import { useActiveItemStore } from '@/store/activeItem';
import { Organization, Department, Product } from '@/db/models';
import { db } from '@/config/firebaseConfig';
import { PktAlert, PktButton } from '@oslokommune/punkt-vue';
import { BtnSave, BtnDelete } from '@/components/generic/form';
import ArchivedRestore from '@/components/ArchivedRestore.vue';
import PagedDrawerWrapper from '@/components/drawers/PagedDrawerWrapper.vue';

const router = useRouter();
const i18n = useI18n();
const toast = useToast();

const { item, itemType, isOrganization, isDepartment, isProduct } = storeToRefs(
  useActiveItemStore()
);
const { organizations, departments } = storeToRefs(useTrackerStore());

const users = useCollection(collection(db, 'users'));

const drawer = ref(null);
const pageCount = ref(2);
const loading = ref(false);

const itemModel = computed(() => {
  if (isOrganization.value) {
    return Organization;
  }
  if (isDepartment.value) {
    return Department;
  }
  return Product;
});

async function save(values) {
  const { pageIndex, next } = drawer.value;

  if (pageIndex < pageCount.value) {
    next();
    return;
  }

  loading.value = true;

  try {
    const { name, missionStatement, targetAudience, parent, team } = values;

    const data = {
      name,
      missionStatement,
      targetAudience: targetAudience || '',
      team: team.map((user) => doc(db, 'users', user.id)),
    };

    if (isDepartment.value) {
      data.organization = doc(db, 'organizations', parent.id);
    } else if (isProduct.value) {
      data.department = doc(db, 'departments', parent.id);
    }

    await itemModel.value.update(item.value.id, data);
    next();
  } catch {
    next(false);
    toast.error(i18n.t('toaster.error.save'));
  }
  loading.value = true;
}

watch(item, (updatedItem, prevItem) => {
  // Watch for slug changes and redirect if needed
  if (updatedItem.id === prevItem.id && updatedItem.slug !== prevItem.slug) {
    const { name, params, query } = router.currentRoute.value;
    router.replace({
      name,
      params: { ...params, slug: updatedItem.slug },
      query,
    });
  }
});

async function archive() {
  loading.value = true;
  try {
    await itemModel.value.archive(item.value.id);
    drawer.value.reset();
  } catch (error) {
    toast.error(i18n.t('toaster.error.archive', { document: item.value.name }));
  }
  loading.value = false;
}

async function restore() {
  loading.value = true;
  try {
    await itemModel.value.restore(item.value.id);
  } catch {
    toast.error(i18n.t('toaster.error.restore', { document: item.value.name }));
  }
  loading.value = false;
}
</script>

<template>
  <PagedDrawerWrapper ref="drawer" :visible="!!drawer" :page-count="pageCount">
    <template #title="{ isDone, isSuccess }">
      <template v-if="!isDone">
        {{ $t('admin.item.change', { name: item.name }) }}
      </template>
      <template v-else-if="isSuccess">
        {{ $t('admin.item.updated', { name: item.name }) }}
      </template>
      <template v-else>{{ $t('toaster.error.save') }}</template>
    </template>

    <template #page="{ pageIndex, prev, cancel }">
      <FormSection>
        <template #default="{ values }">
          <template v-if="pageIndex === 1">
            <FormComponent
              input-type="input"
              name="name"
              :value="item.name"
              :disabled="item.archived"
              :label="$t('fields.name')"
              rules="required"
            />

            <PktAlert
              v-if="values.name && values.name !== item.name"
              skin="info"
              :compact="true"
            >
              {{ $t('admin.item.slugChangeInfo', { name: item.name }) }}
            </PktAlert>

            <FormComponent
              input-type="textarea"
              name="missionStatement"
              :value="item.missionStatement"
              :disabled="item.archived"
              :rows="5"
              :label="$t('fields.missionStatement')"
              rules="required"
            />

            <FormComponent
              input-type="textarea"
              name="targetAudience"
              :value="item.targetAudience"
              :disabled="item.archived"
              :rows="4"
              :label="$t('dashboard.targetAudience')"
            />
          </template>

          <template v-else-if="pageIndex === 2">
            <FormComponent
              v-if="isDepartment"
              input-type="custom-select"
              name="parent"
              :value="item.organization"
              :disabled="item.archived"
              :label="$t('admin.department.parentOrganisation')"
              rules="required"
              value-prop="id"
              label-prop="name"
              :store-object="true"
              :options="organizations.map(({ id, name }) => ({ id, name }))"
              :can-clear="false"
            />

            <FormComponent
              v-else-if="isProduct"
              input-type="custom-select"
              name="parent"
              :value="item.department"
              :disabled="item.archived"
              :label="$t('admin.product.parentDepartment')"
              rules="required"
              value-prop="id"
              label-prop="name"
              :store-object="true"
              :options="
                departments
                  .filter((d) => d.organization.id === item.organization.id)
                  .map(({ id, name }) => ({ id, name }))
              "
            />

            <FormComponent
              :value="item.team"
              input-type="custom-select"
              select-mode="tags"
              name="team"
              :disabled="item.archived"
              :label="$t('general.teamMembers')"
              value-prop="id"
              :tag-label="(o) => o.displayName || o.id"
              :option-label="(o) => (o.displayName ? `${o.displayName} (${o.id})` : o.id)"
              :store-object="true"
              :options="users"
            />

            <PktAlert v-if="item.secret" skin="warning" class="mb-size-32">
              <div class="mb-size-8">
                {{ $t('integration.warning.deprecation') }}
              </div>
              <FormComponent
                name="secret"
                label="Secret"
                :show-optional-tag="false"
                :copy-button="true"
                :value="item.secret"
                :disabled="true"
                :readonly="true"
              />
            </PktAlert>
          </template>
        </template>

        <template #actions="{ submit, disabled }">
          <PktButton
            v-if="pageIndex === 1"
            :text="$t('btn.cancel')"
            skin="tertiary"
            :disabled="loading || item.archived"
            @click="cancel"
          />
          <PktButton
            v-else
            :text="$t('btn.back')"
            skin="tertiary"
            :disabled="loading || item.archived"
            @click="prev"
          />
          <BtnSave
            :text="pageIndex === pageCount ? $t('btn.complete') : $t('btn.continue')"
            :disabled="disabled || loading || item.archived"
            variant="label-only"
            @click="submit(save)"
          />
        </template>
      </FormSection>
    </template>

    <template #footer="{ isDone }">
      <template v-if="!isDone">
        <ArchivedRestore
          v-if="item.archived"
          :restore="restore"
          :object-type="itemType"
        />
        <div v-else class="button-row">
          <BtnDelete
            :disabled="loading"
            :text="$t('admin.item.delete', { name: item.name })"
            @on-click="archive"
          />
        </div>
      </template>
    </template>
  </PagedDrawerWrapper>
</template>

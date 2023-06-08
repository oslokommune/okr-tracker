<template>
  <div class="editKeyResult">
    <content-loader-okr-details v-if="isLoadingDetails"></content-loader-okr-details>
    <span class="steps">{{ $t('general.step', { step: step }) }}</span>
    <h1 class="heading">
      {{ keyResult.id ? $t('admin.keyResult.change') : $t('admin.keyResult.new') }}
    </h1>
    <archived-restore
      v-if="keyResult && keyResult.archived"
      :restore="restore"
      :object-type="$t('archived.keyResult')"
    />
    <form-section>
      <div v-if="step === 1">
        <form-component
          v-model="keyResult.name"
          input-type="textarea"
          name="name"
          :rows="2"
          :label="$t('fields.name')"
          rules="required"
        />
        <form-component
          v-model="keyResult.description"
          input-type="textarea"
          name="description"
          :rows="2"
          :label="$t('fields.description')"
        />
        <form-component
          v-if="isOrganization || isDepartment"
          v-model="keyResult.parent"
          name="owner"
          input-type="select"
          :select-options="ownerOptions"
          :label="$t('fields.owner')"
          rules="required"
        />
      </div>

      <div v-if="step === 2">
        <form-component
          v-model="keyResult.unit"
          input-type="input"
          name="unit"
          :label="$t('keyResult.unit')"
          rules="required|max:25"
        />
        <div class="form-row">
          <form-component
            v-model.number="keyResult.startValue"
            input-type="input"
            name="startValue"
            :label="$t('keyResult.startValue')"
            rules="required"
            type="number"
            class="form-column"
          />

          <form-component
            v-model.number="keyResult.targetValue"
            input-type="input"
            name="targetValue"
            :label="$t('keyResult.targetValue')"
            rules="required"
            type="number"
            class="form-column"
          />
        </div>
      </div>
      <template v-if="!keyResult.archived" #actions="{ handleSubmit }">
        <div v-if="step === 1">
          <btn-cancel :disabled="loading" @click="TOGGLE_DRAWER({ show: false })" />
          <btn-save
            :label="$t('btn.continue')"
            :disabled="!changed || loading"
            variant="label-only"
            skin="primary"
            class="btn-continue"
            @click="handleSubmit(update)"
          />
        </div>
        <div v-if="step === 2" class="button-row">
          <pkt-button
            v-tooltip="$t('btn.back')"
            :text="$t('btn.back')"
            variant="tertiary"
            @onClick="$emit('click', back())"
          />
          <btn-save
            :label="$t('btn.complete')"
            :disabled="!changed || loading"
            variant="label-only"
            skin="primary"
            @click="handleSubmit(update)"
          />
        </div>
        <div v-if="keyResult.id" class="delete">
          <btn-delete :disabled="loading" @click="archive" />
        </div>
      </template>
    </form-section>
  </div>
</template>
<script>
import { mapMutations, mapState } from 'vuex';
import { db } from '@/config/firebaseConfig';
import getActiveItemType from '@/util/getActiveItemType';
import { PktButton } from '@oslokommune/punkt-vue2';
import { FormSection, BtnSave, BtnDelete, BtnCancel } from '@/components/generic/form';
import KeyResult from '@/db/KeyResult';

export default {
  name: 'EditKeyResult',

  components: {
    ArchivedRestore: () => import('@/components/ArchivedRestore.vue'),
    ContentLoaderOkrDetails: () =>
      import('@/components/ContentLoader/ContentLoaderItemAdminOKRDetails.vue'),
    PktButton,
    FormSection,
    BtnSave,
    BtnDelete,
    BtnCancel,
  },

  props: {
    data: {
      type: Object,
      required: false,
      default() {
        return {};
      },
    },
  },

  data: () => ({
    step: 1,
    keyResult: {},
    objective: {},
    loading: false,
    isLoadingDetails: false,
  }),

  computed: {
    ...mapState([
      'activeObjective',
      'activeItem',
      'activeItemRef',
      'keyResults',
      'organizations',
      'departments',
      'products',
    ]),
    isOrganization() {
      return getActiveItemType(this.activeItem) === 'organization';
    },
    isDepartment() {
      return getActiveItemType(this.activeItem) === 'department';
    },
    changed() {
      const nameEdited = this.keyResult?.name !== this.data?.keyResult?.name;
      const descriptionEdited =
        this.keyResult?.description !== this.data?.keyResult?.description;
      const ownerEdited = this.keyResult?.owner !== this.data?.keyResult?.owner;

      return !!(nameEdited || descriptionEdited || ownerEdited);
    },
    thisLevel() {
      if (this.isOrganization) {
        return this.organizations.find((o) => o.id === this.activeItem.id);
      }
      if (this.isDepartment) {
        return this.departments.find((d) => d.id === this.activeItem.id);
      }
      return {};
    },
    children() {
      if (this.isOrganization) {
        return this.departments.filter(
          (department) => department.organization.id === this.activeItem.id
        );
      }
      if (this.isDepartment) {
        return this.products.filter(
          (product) => product.department.id === this.activeItem.id
        );
      }
      return {};
    },
    thisLevelOption() {
      return {
        value: this.thisLevel.path,
        name: this.activeItem.name,
      };
    },
    ownerOptions() {
      const childrenOptions = this.children.map((child) => ({
        value: child.path,
        name: child.name,
      }));

      return [this.thisLevelOption, ...childrenOptions];
    },
  },

  watch: {
    data: {
      immediate: true,
      async handler() {
        this.isLoadingDetails = true;
        if (this.data?.keyResult?.id) {
          this.keyResult = { ...this.data.keyResult, id: this.data.keyResult.id };
        }
        this.isLoadingDetails = false;
      },
    },
    thisLevel: {
      immediate: true,
      async handler() {
        // Set currentLevel as default option for key result owner
        if (!this.keyResult.id) {
          this.keyResult.parent = this.thisLevelOption;
        }
      },
    },
  },
  methods: {
    ...mapMutations(['TOGGLE_DRAWER']),
    async update() {
      if (this.step === 1) {
        this.continue();
      } else {
        this.loading = true;
        this.newKeyResult = false;
        try {
          const { name, description, unit, weight, startValue, targetValue } =
            this.keyResult;
          const parent = this.activeItemRef;

          if (this.keyResult.id) {
            const data = {
              name,
              description: description || '',
              unit: unit || 1,
              weight: weight || 1,
              startValue,
              targetValue,
              parent,
            };
            await KeyResult.update(this.keyResult.id, data);
          } else {
            const { id } = await KeyResult.create({
              name,
              description: description || '',
              unit: unit || 1,
              weight: weight || 1,
              startValue,
              targetValue,
              objective: db.collection('objectives').doc(this.data.objective.id),
              parent,
            });
            this.keyResult = {
              ...db.collection('keyResults').doc(id),
              id,
            };
            this.newKeyResult = true;
          }

          this.TOGGLE_DRAWER({
            type: 'savedKeyResult',
            show: true,
            data: {
              objective: this.data.objective,
              keyResult: this.keyResult,
              newKeyResult: this.newKeyResult,
            },
          });
        } catch (error) {
          console.log('ERROR: ', error);
          this.$toasted.error(this.$t('toaster.error.save'));
        }

        this.loading = false;
      }
    },
    async archive() {
      this.loading = true;
      try {
        this.keyResult.archived = true;
        await KeyResult.archive(this.keyResult.id);
      } catch (error) {
        this.$toasted.error(
          this.$t('toaster.error.archive', { document: this.keyResult.name })
        );
      }
      this.loading = false;
    },
    async restore() {
      try {
        await KeyResult.restore(this.keyResult.id);
        this.keyResult.archived = false;
      } catch {
        this.$toasted.error(
          this.$t('toaster.error.restore', { document: this.keyResult.id })
        );
      }
    },
    continue() {
      this.step = 2;
    },
    back() {
      this.step = 1;
    },
  },
};
</script>
<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.editKeyResult {
  padding: 0 2.5rem 2.5rem 2.5rem;
}

.heading {
  padding-bottom: 1rem;
  @include get-text('pkt-txt-30-medium');
  color: var(--color-text);
}

.steps {
  @include get-text('pkt-txt-16-medium');
  color: var(--color-grayscale-40);
}

.form-row {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  width: 100%;

  .form-column {
    flex: 1;
  }
}

.button-row {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  width: 100%;
}

.btn-continue {
  margin-left: 1rem;
}

.delete {
  position: absolute;
  right: 2rem;
  bottom: 2rem;
}
</style>

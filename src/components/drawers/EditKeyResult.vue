<template>
  <paged-drawer-wrapper
    ref="drawer"
    :visible="visible"
    :page-count="pageCount"
    @close="close"
  >
    <template #title="{ isDone, isSuccess }">
      <template v-if="!isDone">
        {{ $t(keyResult ? 'admin.keyResult.change' : 'admin.keyResult.new') }}
      </template>
      <template v-else-if="isSuccess">
        {{ $t(keyResult ? 'keyResult.updated' : 'keyResult.created') }}
      </template>
      <template v-else>{{ $t('toaster.error.save') }}</template>
    </template>

    <template #page="{ pageIndex, prev }">
      <form-section :hide-errors="true">
        <template v-if="pageIndex === 1">
          <form-component
            v-model="thisKeyResult.name"
            input-type="textarea"
            name="name"
            :disabled="keyResult?.archived"
            :rows="2"
            :label="$t('fields.name')"
            rules="required"
          />
          <form-component
            v-model="thisKeyResult.description"
            input-type="textarea"
            name="description"
            :disabled="keyResult?.archived"
            :rows="2"
            :label="$t('fields.description')"
          />
          <!-- TODO: Include when related views have been implemented -->
          <!--form-component
            v-if="isOrganization || isDepartment"
            v-model="thisKeyResult.parent"
            name="owner"
            input-type="select"
            :select-options="ownerOptions"
            :label="$t('fields.owner')"
            rules="required"
          /-->
        </template>

        <template v-else-if="pageIndex === 2">
          <form-component
            v-model="thisKeyResult.unit"
            input-type="input"
            name="unit"
            :label="$t('keyResult.unit')"
            rules="required|max:25"
          />

          <div class="pkt-grid">
            <form-component
              v-model.number="thisKeyResult.startValue"
              input-type="input"
              name="startValue"
              :label="$t('keyResult.startValue')"
              rules="required"
              type="number"
              class="pkt-cell pkt-cell--span6"
            />

            <form-component
              v-model.number="thisKeyResult.targetValue"
              input-type="input"
              name="targetValue"
              :label="$t('keyResult.targetValue')"
              rules="required"
              type="number"
              class="pkt-cell pkt-cell--span6"
            />
          </div>
        </template>

        <template v-if="!keyResult?.archived" #actions="{ handleSubmit }">
          <pkt-button
            v-if="pageIndex === 1"
            :text="$t('btn.cancel')"
            skin="tertiary"
            :disabled="loading"
            @onClick="close"
          />
          <pkt-button
            v-else
            :text="$t('btn.back')"
            skin="tertiary"
            :disabled="loading"
            @onClick="prev"
          />

          <btn-save
            :label="pageIndex === pageCount ? $t('btn.complete') : $t('btn.continue')"
            :disabled="loading"
            variant="label-only"
            @click="handleSubmit(save)"
          />
        </template>
      </form-section>
    </template>

    <template #done="{ isSuccess, reset }">
      <div class="button-row button-row--left">
        <template v-if="!isSuccess">
          <pkt-button skin="secondary" @onClick="reset">
            {{ $t('btn.back') }}
          </pkt-button>
        </template>
        <template v-else-if="!keyResult">
          <pkt-button skin="tertiary" @onClick="close">
            {{ $t('btn.close') }}
          </pkt-button>
          <pkt-button
            skin="secondary"
            @onClick="
              thisKeyResult = {};
              reset();
            "
          >
            {{ $t('btn.createKeyResult') }}
          </pkt-button>
        </template>
      </div>
    </template>

    <template #footer="{ isDone }">
      <template v-if="keyResult && !isDone">
        <archived-restore
          v-if="keyResult.archived"
          :restore="restore"
          object-type="keyResult"
        />
        <div v-else class="button-row">
          <btn-delete :disabled="loading" @click="archive" />
        </div>
      </template>
    </template>
  </paged-drawer-wrapper>
</template>

<script>
import { mapState } from 'vuex';
import { db } from '@/config/firebaseConfig';
import KeyResult from '@/db/KeyResult';
import { isDepartment, isOrganization } from '@/util/getActiveItemType';
import { PktButton } from '@oslokommune/punkt-vue2';
import { FormSection, BtnSave, BtnDelete } from '@/components/generic/form';
import PagedDrawerWrapper from '@/components/drawers/PagedDrawerWrapper.vue';

export default {
  name: 'EditKeyResult',

  components: {
    ArchivedRestore: () => import('@/components/ArchivedRestore.vue'),
    PktButton,
    PagedDrawerWrapper,
    FormSection,
    BtnSave,
    BtnDelete,
  },

  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false,
    },

    objective: {
      type: Object,
      required: true,
    },

    keyResult: {
      type: Object,
      required: false,
      default: null,
    },
  },

  data: () => ({
    thisKeyResult: null,
    pageCount: 2,
    loading: false,
  }),

  computed: {
    ...mapState([
      'activeItem',
      'activeItemRef',
      'organizations',
      'departments',
      'products',
    ]),
    thisLevel() {
      if (isOrganization(this.activeItem)) {
        return this.organizations.find((o) => o.id === this.activeItem.id);
      }
      if (isDepartment(this.activeItem)) {
        return this.departments.find((d) => d.id === this.activeItem.id);
      }
      return {};
    },
    children() {
      if (isOrganization(this.activeItem)) {
        return this.departments.filter(
          (department) => department.organization.id === this.activeItem.id
        );
      }
      if (isDepartment(this.activeItem)) {
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
    visible: {
      immediate: true,
      async handler(visible) {
        if (!visible) {
          this.thisKeyResult = null;
          return;
        }
        this.thisKeyResult = this.keyResult ? { ...this.keyResult } : {};
      },
    },
    // thisLevel: {
    //   immediate: true,
    //   async handler() {
    //     // Set currentLevel as default option for key result owner
    //     if (!this.keyResult.id) {
    //       this.thisKeyResult.parent = this.thisLevelOption;
    //     }
    //   },
    // },
  },

  methods: {
    async save() {
      const { pageIndex, next } = this.$refs.drawer;

      if (pageIndex < this.pageCount) {
        next();
      } else {
        this.loading = true;

        try {
          const { name, description, unit, weight, startValue, targetValue } =
            this.thisKeyResult;
          const parent = this.activeItemRef;
          const data = {
            name,
            description: description || '',
            unit: unit || 1,
            weight: weight || 1,
            startValue,
            targetValue,
            parent,
          };

          if (this.keyResult) {
            await KeyResult.update(this.keyResult.id, data);
          } else {
            await KeyResult.create({
              ...data,
              objective: db.collection('objectives').doc(this.objective.id),
            });
          }
          this.$refs.drawer.next();
        } catch (error) {
          this.$refs.drawer.next(false);
          this.$toasted.error(this.$t('toaster.error.save'));
        }

        this.loading = false;
      }
    },

    async archive() {
      this.loading = true;
      try {
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
      } catch {
        this.$toasted.error(
          this.$t('toaster.error.restore', { document: this.keyResult.id })
        );
      }
    },

    close(e) {
      this.$emit('close', e);
    },
  },
};
</script>

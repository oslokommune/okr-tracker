<template>
  <paged-drawer-wrapper ref="drawer" :visible="visible" @close="close">
    <template #title="{ isDone, isSuccess }">
      <template v-if="!isDone">
        {{ $t(objective ? 'admin.objective.change' : 'admin.objective.new') }}
      </template>
      <template v-else-if="isSuccess">
        {{ $t(objective ? 'objective.updated' : 'admin.objective.created') }}
      </template>
      <template v-else>{{ $t('toaster.error.save') }}</template>
    </template>

    <template #page>
      <form-section :hide-errors="true">
        <form-component
          v-model="thisObjective.name"
          input-type="textarea"
          name="name"
          :disabled="objective?.archived"
          :rows="2"
          :label="$t('fields.name')"
          rules="required"
        />

        <form-component
          v-model="thisObjective.description"
          input-type="textarea"
          :disabled="objective?.archived"
          :rows="2"
          name="description"
          :label="$t('fields.description')"
        />

        <form-component
          v-model="periodRange"
          input-type="date"
          name="period"
          :disabled="objective?.archived"
          :label="$t('fields.period')"
          :placeholder="$t('general.selectRange')"
          :date-picker-config="flatPickerConfig"
          rules="required"
        />

        <pkt-button
          v-if="newestObjective?.startDate && newestObjective?.endDate"
          class="period-suggestion"
          skin="secondary"
          size="small"
          @onClick="useSuggestedPeriod"
        >
          {{ formattedPeriod(newestObjective) }}
        </pkt-button>

        <!--
          XXX: Comment this in when the rest of the UI concerning objective contribuors has landed.
        -->
        <!--div class="pkt-form-group">
          <span class="pkt-form-label" for="contributors">
            {{ $t('fields.contributors') }}
            <span class="pkt-badge">{{ $t('validation.optional') }}</span>
          </span>
          <v-select
            id="contributors"
            v-model="contributors"
            multiple
            :options="teams"
            :get-option-label="(option) => option.name || option.id"
          >
            <template #option="option">
              {{ option.name || option.id }}
            </template>
          </v-select>
        </div-->

        <template v-if="!objective?.archived" #actions="{ handleSubmit }">
          <btn-cancel :disabled="loading" @click="close" />
          <btn-save
            :label="objective ? $t('btn.updateObjective') : $t('btn.createObjective')"
            variant="label-only"
            :disabled="loading"
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
        <template v-else-if="!objective">
          <pkt-button skin="tertiary" @onClick="close">
            {{ $t('btn.close') }}
          </pkt-button>
          <pkt-button
            v-if="thisObjective.id"
            skin="secondary"
            @onClick="
              $router.push({
                name: 'ObjectiveHome',
                params: { objectiveId: thisObjective.id },
                query: { createKeyResult: '1' },
              })
            "
          >
            {{ $t('btn.createKeyResult') }}
          </pkt-button>
        </template>
      </div>
    </template>

    <template #footer="{ isDone }">
      <template v-if="objective && !isDone">
        <archived-restore
          v-if="objective.archived"
          :restore="restore"
          :object-type="$t('archived.objective')"
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
import formattedPeriod from '@/util/okr';
import Objective from '@/db/Objective';
import ObjectiveContributors from '@/db/ObjectiveContributors';
import firebase from 'firebase/compat/app';
import locale from 'flatpickr/dist/l10n/no';
import { db } from '@/config/firebaseConfig';
import { isDepartment, isOrganization } from '@/util/getActiveItemType';
import { PktButton } from '@oslokommune/punkt-vue2';
import { FormSection, BtnSave, BtnDelete, BtnCancel } from '@/components/generic/form';
import { sortByLocale } from '@/store/actions/actionUtils';
import PagedDrawerWrapper from '@/components/drawers/PagedDrawerWrapper.vue';

export default {
  name: 'EditObjective',

  components: {
    ArchivedRestore: () => import('@/components/ArchivedRestore.vue'),
    PktButton,
    PagedDrawerWrapper,
    FormSection,
    BtnSave,
    BtnDelete,
    BtnCancel,
  },

  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false,
    },

    objective: {
      type: Object,
      required: false,
      default: null,
    },

    newestObjective: {
      type: Object,
      required: false,
      default: null,
    },
  },

  data: () => ({
    thisObjective: null,
    flatPickerConfig: {
      altFormat: 'j M Y',
      altInput: true,
      minDate: null,
      mode: 'range',
      maxDate: null,
      locale: locale.no,
    },
    periodRange: null,
    loading: false,
    contributors: [],
  }),

  computed: {
    ...mapState(['activeItem', 'activeItemRef', 'departments', 'products']),

    childCollection() {
      if (isOrganization(this.activeItem)) {
        return 'departments';
      }
      if (isDepartment(this.activeItem)) {
        return 'products';
      }
      return null;
    },

    children() {
      if (isOrganization(this.activeItem)) {
        return this.departments.filter((d) => d.organization.id === this.activeItem.id);
      }
      if (isDepartment(this.activeItem)) {
        return this.products.filter((p) => p.department.id === this.activeItem.id);
      }
      return [];
    },

    teams() {
      return this.children.map(({ name, id }) => ({ name, id }));
    },
  },

  watch: {
    visible: {
      immediate: true,
      async handler(visible) {
        if (!visible) {
          this.thisObjective = null;
          this.periodRange = null;
          return;
        }

        if (this.objective) {
          this.thisObjective = { ...this.objective };
          this.periodRange = this.getCurrentDateRange();
          this.contributors = await this.getObjectiveContributors();
          this.existingContributorIDs = this.contributors.map((c) => c.id);
        } else {
          this.thisObjective = {};
          this.periodRange = null;
        }
      },
    },
  },

  methods: {
    formattedPeriod,

    getCurrentDateRange() {
      if (this.thisObjective.startDate && this.thisObjective.endDate) {
        return [this.objective.startDate.toDate(), this.objective.endDate.toDate()];
      }
      if (this.thisObjective.period) {
        return [
          this.objective.period.startDate.toDate(),
          this.objective.period.endDate.toDate(),
        ];
      }
      return null;
    },

    async getObjectiveContributors() {
      const objectiveRef = await db.doc(`objectives/${this.objective.id}`);

      const objectiveContributorsRef = db
        .collection('objectiveContributors')
        .where('objective', '==', objectiveRef);

      const contributors = Promise.all(
        await objectiveContributorsRef.get().then((snapshot) =>
          snapshot.docs.map(async (doc) => {
            const item = await doc.data().item.get();
            return { id: item.id, name: item.data().name };
          })
        )
      );

      return sortByLocale(await contributors);
    },

    async createObjectiveContributor(itemId, objectiveId) {
      const itemRef = await db.doc(`${this.childCollection}/${itemId}`);
      const objectiveRef = await db.doc(`objectives/${objectiveId}`);
      return ObjectiveContributors.create(itemRef, objectiveRef);
    },

    async removeObjectiveContributor(itemId, objectiveId) {
      const itemRef = await db.doc(`${this.childCollection}/${itemId}`);
      const objectiveRef = await db.doc(`objectives/${objectiveId}`);
      return ObjectiveContributors.remove(itemRef, objectiveRef);
    },

    async save() {
      this.loading = true;

      try {
        const { name, description, weight, period } = this.thisObjective;
        const [start, end] = this.periodRange;

        if (this.objective) {
          const { id } = this.objective;

          const data = {
            name,
            description: description || '',
            weight: weight || 1,
          };
          if (start && end) {
            data.startDate = start;
            data.endDate = end;
            if (period) {
              const { FieldValue } = firebase.firestore;
              data.period = FieldValue.delete();
            }
          } else {
            data.period = period;
          }
          await Objective.update(id, data);

          // Create new `ObjectiveContributor` documents ...
          this.contributors.forEach(async (c) => {
            if (!this.existingContributorIDs.includes(c.id)) {
              this.createObjectiveContributor(c.id, id);
            }
          });

          // ... and delete removed ones.
          const contributorIDs = this.contributors.map((c) => c.id);
          this.existingContributorIDs.forEach((cid) => {
            if (!contributorIDs.includes(cid)) {
              this.removeObjectiveContributor(cid, id);
            }
          });
        } else {
          const { id } = await Objective.create({
            name,
            description: description || '',
            weight: weight || 1,
            parent: this.activeItemRef,
            startDate: start,
            endDate: end,
          });
          this.thisObjective.id = id;

          this.contributors.forEach((c) => this.createObjectiveContributor(c.id, id));
        }
        this.$refs.drawer.next();
      } catch (error) {
        this.$refs.drawer.next(false);
        this.$toasted.error(this.$t('toaster.error.save'));
      }
      this.loading = false;
    },

    async archive() {
      this.loading = true;
      try {
        await Objective.archive(this.objective.id);
      } catch (error) {
        this.$toasted.error(
          this.$t('toaster.error.archive', { document: this.objective.name })
        );
      }
      this.loading = false;
    },

    async restore() {
      try {
        await Objective.restore(this.objective.id);
      } catch {
        this.$toasted.error(
          this.$t('toaster.error.restore', { document: this.objective.id })
        );
      }
    },

    close(e) {
      this.$emit('close', e);
    },

    async useSuggestedPeriod() {
      this.periodRange = [
        this.newestObjective.startDate.toDate(),
        this.newestObjective.endDate.toDate(),
      ];
    },
  },
};
</script>

<style lang="scss" scoped>
.period-suggestion {
  margin-bottom: 1rem;
}
</style>

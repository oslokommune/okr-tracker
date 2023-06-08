<template>
  <div class="editObjective">
    <div class="body">
      <content-loader-okr-details v-if="isLoadingDetails"></content-loader-okr-details>
      <div v-else-if="!isLoadingDetails">
        <h1 class="heading">
          {{ objective.id ? $t('admin.objective.change') : $t('admin.objective.new') }}
        </h1>
        <form-section :hide-errors="true">
          <form-component
            v-model="objective.name"
            input-type="textarea"
            name="name"
            :rows="2"
            :label="$t('fields.name')"
            rules="required"
          />

          <form-component
            v-model="objective.description"
            input-type="textarea"
            :rows="2"
            name="description"
            :label="$t('fields.description')"
          />

          <form-component
            v-model="periodRange"
            input-type="date"
            name="period"
            :label="$t('fields.period')"
            :placeholder="$t('general.selectRange')"
            :date-picker-config="flatPickerConfig"
            rules="required"
          />

          <template v-if="!objective.archived" #actions="{ handleSubmit }">
            <btn-cancel :disabled="loading" @click="TOGGLE_DRAWER({ show: false })" />
            <btn-save
              :label="
                objective.id ? $t('btn.updateObjective') : $t('btn.createObjective')
              "
              variant="label-only"
              skin="primary"
              :disabled="!changed || loading"
              @click="handleSubmit(update)"
            />
          </template>
        </form-section>
      </div>
    </div>
    <div class="footer">
      <archived-restore
        v-if="objective && objective.archived"
        :restore="restore"
        :object-type="$t('archived.objective')"
      />
      <btn-delete
        v-if="objective.id && !objective.archived"
        :disabled="loading"
        @click="archive"
      />
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import store from '@/store';
import Objective from '@/db/Objective';
import { db } from '@/config/firebaseConfig';
import firebase from 'firebase/app';
import locale from 'flatpickr/dist/l10n/no';
import { FormSection, BtnSave, BtnDelete, BtnCancel } from '@/components/generic/form';

export default {
  name: 'EditObjective',

  components: {
    ArchivedRestore: () => import('@/components/ArchivedRestore.vue'),
    ContentLoaderOkrDetails: () =>
      import('@/components/ContentLoader/ContentLoaderItemAdminOKRDetails.vue'),
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
    objective: {},
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
    isLoadingDetails: false,
    periodEdited: false,
  }),

  computed: {
    ...mapState(['activeItemRef', 'periods']),
    changed() {
      const nameEdited = this.objective?.name !== this.data?.name;
      const descriptionEdited = this.objective?.description !== this.data?.description;
      const periodEdited = this.objective?.period !== this.data?.period;
      const startEndEdited =
        this.periodRange?.[0].getTime() !== this.data?.startDate?.toDate().getTime() ||
        this.periodRange?.[1].getTime() !== this.data?.endDate?.toDate().getTime();

      return !!(nameEdited || descriptionEdited || periodEdited || startEndEdited);
    },
  },

  watch: {
    data: {
      immediate: true,
      async handler() {
        this.isLoadingDetails = true;
        if (this.data?.objective.id) {
          this.objective = { ...this.data.objective, id: this.data.objective.id };
          this.periodRange = this.getCurrentDateRange();
        }
        this.isLoadingDetails = false;
      },
    },
  },

  methods: {
    ...mapMutations(['TOGGLE_DRAWER']),

    getCurrentDateRange() {
      if (this.objective.startDate && this.objective.endDate) {
        return [this.objective.startDate.toDate(), this.objective.endDate.toDate()];
      }
      if (this.objective.period) {
        return [
          this.objective.period.startDate.toDate(),
          this.objective.period.endDate.toDate(),
        ];
      }
      return null;
    },
    async update() {
      this.loading = true;
      this.newObjective = false;
      try {
        const { name, description, weight, period } = this.objective;
        const [start, end] = this.periodRange;

        if (this.objective.id) {
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
          await Objective.update(this.objective.id, data);
        } else {
          const { id } = await Objective.create({
            name,
            description: description || '',
            weight: weight || 1,
            parent: this.activeItemRef,
            startDate: start,
            endDate: end,
          });
          this.objective = {
            ...db.collection('objectives').doc(id),
            id,
          };
          this.newObjective = true;
          await store.dispatch('set_active_objective', id);
        }

        this.TOGGLE_DRAWER({
          type: 'savedObjective',
          show: true,
          data: {
            objective: this.objective,
            newObjective: this.newObjective,
          },
        });
      } catch (error) {
        this.$toasted.error(this.$t('toaster.error.save'));
      }
      this.loading = false;
    },

    async archive() {
      this.loading = true;
      try {
        await Objective.archive(this.objective.id);
        this.objective.archived = true;
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
        this.objective.archived = false;
      } catch {
        this.$toasted.error(
          this.$t('toaster.error.restore', { document: this.objective.id })
        );
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.editObjective {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 4rem);
  min-height: 100%;
  padding: 0 2.5rem 2.5rem 2.5rem;
}

.heading {
  padding-bottom: 1rem;
  @include get-text('pkt-txt-30-medium');
  color: var(--color-text);
}

.body {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.details {
  padding: 0 2rem 0 2rem;
}

.footer {
  display: flex;
  flex-direction: row;
  justify-content: end;
}
</style>

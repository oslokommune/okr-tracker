<template>
  <content-loader-okr-details v-if="isLoadingDetails"></content-loader-okr-details>
  <div v-else-if="objective" class="details">
    <archived-restore v-if="objective.archived" :restore="restore" />

    <form-section>
      <form-component
        v-model="objective.name"
        input-type="input"
        name="name"
        :label="$t('fields.name')"
        rules="required"
      />

      <form-component
        v-model="objective.description"
        input-type="input"
        name="description"
        :label="$t('fields.description')"
      />

      <form-component
        v-model.number="objective.weight"
        input-type="input"
        name="weight"
        :label="$t('fields.weight')"
        rules="required|decimal|positiveNotZero"
        type="text"
      />

      <form-component
        v-model="objective.period"
        input-type="select"
        :label="$t('fields.period')"
        name="period"
        rules="required"
        :select-options="periods"
        @select="changedPeriod = true"
      />

      <form-component
        v-model="range"
        input-type="date"
        name="period"
        :label="$t('period.dateRange')"
        :placeholder="$t('general.selectRange')"
        :date-picker-config="flatPickerConfig"
      />

      <template #actions="{ handleSubmit, submitDisabled }">
        <btn-delete v-if="!objective.archived" :disabled="loading" @click="archive" />
        <btn-save :disabled="submitDisabled || loading" @click="handleSubmit(update)" />
      </template>
    </form-section>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import locale from 'flatpickr/dist/l10n/no';
import Objective from '@/db/Objective';
import { toastArchiveAndRevert } from '@/util';
import { FormSection, BtnSave, BtnDelete } from '@/components/generic/form';

export default {
  name: 'ItemAdminObjective',

  components: {
    ArchivedRestore: () => import('@/components/ArchivedRestore.vue'),
    ContentLoaderOkrDetails: () =>
      import('@/components/ContentLoader/ContentLoaderItemAdminOKRDetails.vue'),
    FormSection,
    BtnSave,
    BtnDelete,
  },

  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    objective: null,
    periods: [],
    changedPeriod: false,
    flatPickerConfig: {
      altFormat: 'j M Y',
      altInput: true,
      minDate: null,
      mode: 'range',
      maxDate: null,
      locale: locale.no,
    },
    range: null,
    loading: false,
    isLoadingDetails: false,
  }),

  watch: {
    data: {
      immediate: true,
      async handler() {
        this.isLoadingDetails = true;
        const parent = await db
          .collection('slugs')
          .doc(this.data.parent.slug)
          .get()
          .then((snapshot) => snapshot.data().reference);
        this.$bind('periods', db.collection('periods').where('parent', '==', parent));
        this.objective = { ...this.data, id: this.data.id };
        this.range = this.getCurrentDateRange();
        this.isLoadingDetails = false;
      },
    },
  },

  methods: {
    getCurrentDateRange() {
      if (!this.objective.startDate || !this.objective.endDate) {
        return null;
      }
      return [this.objective.startDate.toDate(), this.objective.endDate.toDate()];
    },
    async update() {
      this.loading = true;
      try {
        const { id, name, description, weight, period } = this.objective;
        const data = {
          name,
          description: description || '',
          weight: weight || 1,
          period: db.collection('periods').doc(period.id),
        };

        if (this.range) {
          const [start, end] = this.range;
          data.startDate = start;
          data.endDate = end;
        }

        await Objective.update(id, data);

        if (this.changedPeriod) {
          await this.$router.push({ query: { tab: 'okr' } });
          await this.$router.push({ query: { tab: 'okr', type: 'objective', id } });
        }

        this.$toasted.show(this.$t('toaster.savedChanges'));
      } catch {
        this.$toasted.error(this.$t('toaster.error.save'));
      }

      this.loading = false;
    },

    async archive() {
      this.loading = true;
      try {
        this.objective.archived = true;
        await this.$router.push({
          query: { tab: 'okr', type: 'period', id: this.objective.period.id },
        });
        await Objective.archive(this.objective.id);

        const restoreCallback = this.restore.bind(this);

        toastArchiveAndRevert({
          name: this.objective.name,
          callback: restoreCallback,
        });
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
        this.$toasted.show(this.$t('toaster.restored'));
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
.details {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(var(--color-grey-400-rgb), 0.3);

  @media screen and (min-width: bp(l)) {
    align-self: flex-start;
    width: span(3, 0, span(10));
    margin-top: 0;
    margin-left: span(0, 1, span(10));
  }

  @media screen and (min-width: bp(xl)) {
    width: span(3, 0, span(10));
    margin-left: span(1, 2, span(10));
  }
}
</style>

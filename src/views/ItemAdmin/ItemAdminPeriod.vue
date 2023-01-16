<template>
  <content-loader-okr-details v-if="isLoadingDetails"></content-loader-okr-details>
  <div v-else-if="activePeriod" class="details">
    <archived-restore v-if="activePeriod.archived" :restore="restore" />

    <validation-observer v-slot="{ handleSubmit }">
      <form id="update-period" @submit.prevent="handleSubmit(update)">
        <form-component
          v-model="activePeriod.name"
          input-type="input"
          name="name"
          :label="$t('fields.name')"
          rules="required"
          type="text"
          data-cy="period_name"
        />

        <validation-provider v-slot="{ errors }" name="range">
          <label class="form-field">
            <span class="form-label">{{ $t('period.dateRange') }}</span>
            <flat-pickr
              v-model="range"
              :config="flatPickerConfig"
              class="form-control flatpickr-input"
              name="date"
              placeholder="Velg start- og sluttdato"
            />
          </label>
          <span class="form-field--error">{{ errors[0] }}</span>
        </validation-provider>
      </form>
    </validation-observer>

    <div class="button-row">
      <btn-delete
        v-if="!activePeriod.archived"
        :disabled="loading"
        @click="archive"
      />
      <btn-save
        form="update-period"
        data-cy="save_period"
        :disabled="loading"
      />
    </div>
  </div>
</template>

<script>
import locale from 'flatpickr/dist/l10n/no';
import endOfDay from 'date-fns/endOfDay';
import format from 'date-fns/format';
import Period from '@/db/Period';
import { toastArchiveAndRevert } from '@/util';
import { BtnSave, BtnDelete } from '@/components/generic/form/buttons';

export default {
  name: 'ItemAdminPeriod',

  components: {
    ArchivedRestore: () => import('@/components/ArchivedRestore.vue'),
    ContentLoaderOkrDetails: () =>
      import('@/components/ContentLoader/ContentLoaderItemAdminOKRDetails.vue'),
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
    activePeriod: null,
    startDate: null,
    endDate: null,
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
    isLoadingData: false,
  }),

  watch: {
    data: {
      immediate: true,
      handler() {
        this.isLoadingDetails = true;
        this.activePeriod = { ...this.data, id: this.data.id };
        this.range = this.generateRange();
        this.isLoadingDetails = false;
      },
    },

    range(range) {
      if (!range) return;
      const parts = this.range.split(' til ').map((d) => new Date(d));
      if (parts.length === 1) return;
      this.dirty = true;
      const [startDate, endDate] = parts;
      this.startDate = startDate;
      this.endDate = endOfDay(endDate);
    },
  },

  methods: {
    generateRange() {
      if (!this.activePeriod.startDate || !this.activePeriod.endDate) return '';
      const startDate = format(this.activePeriod.startDate.toDate(), 'yyyy-MM-dd');
      const endDate = format(this.activePeriod.endDate.toDate(), 'yyyy-MM-dd');
      return this.$t('period.range', { startDate, endDate });
    },

    async archive() {
      this.loading = true;
      try {
        this.activePeriod.archived = true;
        await this.$router.push({ query: {} });
        await Period.archive(this.activePeriod.id);

        const restoreCallback = this.restore.bind(this);

        toastArchiveAndRevert({ name: this.activePeriod.name, callback: restoreCallback });
      } catch (error) {
        console.log(error);
        this.$toasted.error(this.$t('toaster.error.archive', { document: this.activePeriod.name }));
      }

      this.loading = false;
    },

    async restore() {
      try {
        await Period.restore(this.activePeriod.id);
        this.activePeriod.archived = false;
        this.$toasted.show(this.$t('toaster.restored'));
      } catch (error) {
        this.$toasted.error(this.$t('toaster.error.restore', { document: this.activePeriod.name }));
        throw new Error(error.message);
      }
    },

    async update() {
      this.loading = true;
      try {
        const { id, name } = this.activePeriod;

        await Period.update(id, { name, startDate: new Date(this.startDate), endDate: new Date(this.endDate) });
        this.$toasted.show(this.$t('toaster.savedChanges'));
      } catch (error) {
        console.log(error);
        this.$toasted.error(this.$t('toaster.error.save'));
      }

      this.loading = false;
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

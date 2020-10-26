<template>
  <div v-if="activePeriod">
    <validation-observer v-slot="{ handleSubmit }">
      <form id="update-period" @submit.prevent="handleSubmit(update)">
        <form-component
          input-type="input"
          name="name"
          :label="$t('fields.name')"
          rules="required"
          v-model="activePeriod.name"
          type="text"
        />

        <validation-provider name="range" v-slot="{ errors }">
          <label class="form-field">
            <span class="form-label">{{ $t('period.dateRange') }}</span>
            <flat-pickr
              v-model="range"
              :config="flatPickerConfig"
              class="form-control cy-datepicker"
              name="date"
              placeholder="Velg start- og sluttdato"
            ></flat-pickr>
          </label>
          <span class="form-field--error">{{ errors[0] }}</span>
        </validation-provider>
      </form>
    </validation-observer>

    <div class="button-row">
      <button class="btn btn--icon btn--pri" form="update-period" :disabled="loading">
        <span class="icon fa fa-fw fa-save"></span> {{ $t('btn.saveChanges') }}
      </button>
      <button class="btn btn--icon btn--danger" @click="archive" :disabled="loading" v-if="!activePeriod.archived">
        <span class="icon fa fa-fw fa-trash"></span> {{ $t('btn.archive') }}
      </button>
    </div>
  </div>
</template>

<script>
import locale from 'flatpickr/dist/l10n/no';
import endOfDay from 'date-fns/endOfDay';
import format from 'date-fns/format';
import Period from '@/db/Period';

export default {
  name: 'ItemAdminPeriod',

  components: { FormComponent: () => import('@/components/FormComponent.vue') },

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
  }),

  watch: {
    data: {
      immediate: true,
      handler() {
        this.activePeriod = { ...this.data, id: this.data.id };
        this.range = this.generateRange();
      },
    },

    range(range) {
      if (!range) return;
      const parts = this.range.split(' til ').map(d => new Date(d));
      if (parts.length === 1) return;
      this.dirty = true;
      const [startDate, endDate] = parts;
      this.startDate = startDate;
      this.endDate = endOfDay(endDate);
    },
  },

  methods: {
    generateRange() {
      if (!this.activePeriod.startDate || !this.activePeriod.endDate) return;
      const startDate = format(this.activePeriod.startDate.toDate(), 'yyyy-MM-dd');
      const endDate = format(this.activePeriod.endDate.toDate(), 'yyyy-MM-dd');
      return this.$tc('period.range', null, { startDate, endDate });
    },

    async archive() {
      this.loading = true;
      try {
        await Period.archive(this.activePeriod.id);
        await this.$router.push({ query: {} });
        this.$toasted.show('Archived');
      } catch (error) {
        console.log(error);
        this.$toasted.show('Could not archive product');
      }

      this.loading = false;
    },

    async update() {
      this.loading = true;
      try {
        const { id, name } = this.activePeriod;

        await Period.update(id, { name, startDate: new Date(this.startDate), endDate: new Date(this.endDate) });
        this.$toasted.show('Successfully saved changes');
      } catch (error) {
        console.log(error);
        this.$toasted.show('Could not save changes');
      }

      this.loading = false;
    },
  },
};
</script>

<style lang="scss">
.button-row {
  display: flex;
  flex-wrap: wrap;
  margin: 2.5rem -0.25rem -0.25rem;

  > .btn {
    margin: 0.25rem;
  }
}
</style>

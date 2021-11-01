<template>
  <div class="aside">
    <div class="widgets__links">
      <router-link
        v-if="hasEditRights"
        v-tooltip="$t('tooltip.editKpi')"
        class="btn btn--ter btn--icon btn--icon-pri"
        :to="{ name: 'ItemAdminKPIs' }"
      >
        <i class="icon fa fa-cog" />
        {{ $t('kpi.edit') }}
      </router-link>
    </div>

    <div class=widgets__kpi>
      <h2 class="title-2">{{ $t('keyResultPage.filter') }}</h2>
      <label v-if="progress.length" class="form-field">
        <span class="form-label">{{ $t('period.dateRange') }}</span>
        <flat-pickr
          v-model="widgetRange"
          :config="flatPickerConfig"
          class="form-control cy-datepicker"
          name="date"
          placeholder="Velg start- og sluttdato"
        ></flat-pickr>
      </label>

      <button v-if="widgetRange" class="btn btn--icon btn--ghost" @click="widgetRange = null">
        <i class="icon fa fa-trash-restore-alt" /> {{ $t('btn.reset') }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import locale from 'flatpickr/dist/l10n/no';

export default {
  name: 'WidgetsKPIHome',

  props: {
    range: {
      type: String,
      required: true,
    },
    progress: {
      type: Array,
      required: true,
    },
  },

  data: () => ({
    flatPickerConfig: {
      altFormat: 'j M Y',
      altInput: true,
      minDate: null,
      mode: 'range',
      maxDate: null,
      locale: locale.no,
    },
    widgetRange: null,
  }),

  computed: {
    ...mapGetters(['hasEditRights']),
  },

  watch: {
    range: {
      immediate: true,
      handler() {
        this.widgetRange = this.range;
      },
    },
    widgetRange: {
      handler() {
        this.$emit('listen', this.widgetRange);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.widgets__kpi {
  padding: 0.5rem;
}
</style>

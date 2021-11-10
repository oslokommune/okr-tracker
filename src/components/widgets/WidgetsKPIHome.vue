<template>
  <div class="aside">
    <router-link
      v-if="hasEditRights"
      v-tooltip="$t('tooltip.editKpi')"
      class="btn btn--ter btn--icon btn--icon-pri link__edit-rights"
      :to="{ name: 'ItemAdminKPIs' }"
    >
      {{ $t('kpi.edit') }}
      <i class="icon fa fa-pen" />
    </router-link>

    <div class="widgets">
      <widget widget-id="widget-kpi-filter" :title="$t('keyResultPage.filter')">
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

        <button class="btn btn--icon btn--sec" :disabled="!widgetRange" @click="widgetRange = null">
          {{ $t('btn.reset') }}
        </button>
      </widget>
      <div class="widgets__kpi"></div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import locale from 'flatpickr/dist/l10n/no';

export default {
  name: 'WidgetsKPIHome',

  components: {
    Widget: () => import('@/components/widgets/Widget.vue'),
  },

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

.link__edit-rights {
  color: var(--color-text);
  background-color: var(--color-secondary);
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 2rem 1.5rem;
  text-transform: uppercase;
}
</style>

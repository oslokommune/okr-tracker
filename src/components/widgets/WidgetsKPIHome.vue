<template>
  <div class="aside">
    <div class="widgets">
      <widget-admin-edit />
      <widget :title="$t('keyResultPage.filter')">
        <label v-if="progress.length" class="form-field">
          <span class="form-label">{{ $t('period.dateRange') }}</span>
          <flat-pickr
            v-model="widgetRange"
            :config="flatPickerConfig"
            class="form-control flatpickr-input"
            name="date"
            placeholder="Velg start- og sluttdato"
          ></flat-pickr>
        </label>

        <button class="btn btn--sec" :disabled="!widgetRange" @click="widgetRange = null">
          {{ $t('btn.reset') }}
        </button>
      </widget>
      <widget-mission-statement class="widgets--bottom" />
      <widget-team class="widgets--bottom" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import locale from 'flatpickr/dist/l10n/no';
import Widget from '@/components/widgets/WidgetWrapper.vue';
import WidgetMissionStatement from '@/components/widgets/WidgetMissionStatement.vue';
import WidgetTeam from '@/components/widgets/WidgetTeam/WidgetTeam.vue';
import WidgetAdminEdit from '@/components/widgets/WidgetAdminEdit.vue';

export default {
  name: 'WidgetsKPIHome',

  components: {
    WidgetAdminEdit,
    Widget,
    WidgetMissionStatement,
    WidgetTeam,
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

.widgets--bottom {
  @media screen and (min-width: bp(m)) {
    display: none;
  }
}

.widgets--left {
  @media screen and (max-width: bp(m)) {
    display: none;
  }
}
</style>

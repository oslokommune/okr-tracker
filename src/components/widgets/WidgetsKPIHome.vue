<template>
  <div class="aside">
    <div class="widgets">
      <widget :title="$t('keyResultPage.filter')">
        <label v-if="progress.length" class="form-field">
          <span class="form-label">{{ $t('period.dateRange') }}</span>
          <flat-pickr
            ref="datePicker"
            v-model="widgetRange"
            :config="flatPickerConfig"
            class="form-control flatpickr-input"
            name="date"
            :placeholder="$t('general.selectRange')"
          ></flat-pickr>
        </label>

        <button class="btn btn--sec" :disabled="!widgetRange" @click="widgetRange = null">
          {{ $t('btn.reset') }}
        </button>
      </widget>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Widget from '@/components/widgets/WidgetWrapper.vue';

export default {
  name: 'WidgetsKPIHome',

  components: {
    Widget,
  },

  props: {
    range: {
      type: Array,
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
        this.widgetRange = this.range.length ? this.range : null;
      },
    },
    widgetRange: {
      handler() {
        if (this.widgetRange) {
          const range = this.widgetRange
            .split(this.$refs.datePicker.fp.l10n.rangeSeparator)
            .map((d) => new Date(d));
          this.$emit('listen', range);
        } else {
          this.$emit('listen', []);
        }
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

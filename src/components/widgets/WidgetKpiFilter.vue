<template>
  <widget :title="$t('keyResultPage.filter')" size="small">
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
</template>

<script>
import Widget from '@/components/widgets/WidgetWrapper.vue';

export default {
  name: 'WidgetKpiFilter',

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

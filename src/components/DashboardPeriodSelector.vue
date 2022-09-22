<template>
  <div v-click-outside="hide" class="periodSelector">
    <div
      class="periodSelector__input"
      :class="{ 'periodSelector__input--active': isOpen }"
      tabindex="0"
      @click="toggle"
      @keyup.enter="toggle"
    >
      <span class="periodSelector__input-value">
        {{ rangeLabel }}
      </span>
      <icon-calendar :height="22" :width="22" />
    </div>
    <div v-if="isOpen" class="periodSelector__content">
      <button
        v-for="rangeOption in options"
        :key="rangeOption.value"
        class="periodSelector__option"
        :class="{
          'periodSelector__option--active': range.key === period.key
        }"
        @click="selectRangeOption(rangeOption)"
      >
        {{ rangeOption.label }}
      </button>
      <flat-pickr
        v-model="range"
        :config="flatPickerConfig"
        class="form-control flatpickr-input"
        name="date"
        @on-change="selectCustomRange"
      />
    </div>
  </div>
</template>

<script>
import ClickOutside from 'vue-click-outside';
import locale from 'flatpickr/dist/l10n/no';
import endOfDay from 'date-fns/endOfDay';
import IconCalendar from './IconCalendar.vue';

export default {
  name: 'DashboardPeriodSelector',
  components: {
    IconCalendar,
  },
  directives: {
    ClickOutside,
  },

  props: {
    period: {
      type: Object,
      required: false,
      default: null,
    },
    options: {
      type: Array,
      required: false,
      default: null,
    },
    startDate: {
      type: Date,
      required: false,
      default: null,
    },
    endDate: {
      type: Date,
      required: false,
      default: null,
    }
  },

  data: () => ({
    isOpen: false,
    flatPickerConfig: {
      inline: true,
      altFormat: 'j M Y',
      altInput: true,
      minDate: null,
      mode: 'range',
      maxDate: null,
      locale: locale.no,
    },
    range: null,
  }),

  computed: {
    rangeLabel() {
      return this.options.find((range) => {
        return range.key === this.period.key
      })?.label || this.range;
    },
  },

  watch: {
    startDate: {
      immediate: true,
      async handler() {
        this.range = [this.startDate, this.endDate];
      },
    },

    endDate: {
      immediate: true,
      async handler() {
        this.range = [this.startDate, this.endDate];
      },
    },
  },

  methods: {
    toggle() {
      this.isOpen = !this.isOpen;
    },
    hide() {
      this.isOpen = false;
    },
    selectRangeOption(rangeOption) {
      this.range = [rangeOption.startDate, rangeOption.endDate];
      this.$emit('input', rangeOption);
      this.hide();
    },
    selectCustomRange(range) {
      if (range.length !== 2) return;
      this.$emit('input', {
        startDate: range[0],
        endDate: endOfDay(range[1]),
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.periodSelector {
  position: relative;
  display: inline-block;
}

.periodSelector__input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  padding: 0.75rem;
  border: 1px solid var(--color-grey-100);
  cursor: pointer;

  &:hover:not(&--active) {
    background: var(--color-light-gray);
    border-color: var(--color-light-gray);
  }

  &--active {
    background-color: var(--color-secondary-light);
    border-color: var(--color-secondary-light);
  }

  &-value {
    color: var(--color-text);
    font-weight: 500;
    font-size: 1rem;
  }
}

.periodSelector__content {
  position: absolute;
  right: 0;
  z-index: 1;
  border: 1px solid var(--color-grey-100);

  ::v-deep .flatpickr {
    &-calendar {
      margin-top: -3px;
      border: 1px solid var(--color-grey-100);
      border-right: 0;
      border-left: 0;
      border-radius: 0;
      box-shadow: none;
    }
    &-input {
      display: none;
    }
  }
}

.periodSelector__option {
  width: 100%;
  padding: 1rem;
  color: var(--color-grey-400);
  font-weight: 500;
  font-size: 1rem;
  text-align: left;
  background: var(--color-white);
  border: 0;
  cursor: pointer;

  &:hover,
  &--active {
    color: var(--color-text);
    background: var(--color-grey-50);
  }
}
</style>

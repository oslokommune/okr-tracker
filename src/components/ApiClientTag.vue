<template>
  <span v-tooltip="tooltip" class="api-client-tag">
    <pkt-icon v-if="icon" :name="icon" />
    <span>{{ formattedTagText }}</span>
  </span>
</template>

<script>
import { format, formatDistanceStrict } from 'date-fns';
import { dateTimeShort } from '@/util';

export default {
  name: 'ApiClientTag',

  props: {
    icon: {
      type: String,
      required: false,
      default: null,
    },
    i18nKey: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Object,
      required: false,
      default: null,
    },
    user: {
      type: [Object, String],
      required: false,
      default: null,
    },
    timeAsDistance: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  data: () => ({
    timerId: null,
    now: null,
  }),

  computed: {
    formattedTagText() {
      return this.$t(this.i18nKey, {
        when: this.datetime,
        name: this.userName,
      });
    },
    datetime() {
      if (!this.timestamp) {
        return this.$t('general.unknown');
      }
      if (this.timeAsDistance && this.now) {
        return formatDistanceStrict(this.timestamp.toDate(), this.now, {
          addSuffix: true,
        });
      }
      return dateTimeShort(this.timestamp.toDate());
    },
    userName() {
      return this.user?.displayName || this.user?.id || this.$t('general.unknown');
    },
    tooltip() {
      return this.timestamp && this.timeAsDistance
        ? format(this.timestamp.toDate(), 'P - ppp')
        : false;
    },
  },

  mounted() {
    if (this.timeAsDistance) {
      this.now = new Date();
      this.timerId = setInterval(() => {
        this.now = new Date();
      }, 1000);
    }
  },

  beforeDestroy() {
    clearInterval(this.timerId);
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.api-client-tag {
  display: flex;
  gap: 0.25em;
  align-items: center;
  color: var(--color-grayscale-60);
  @include get-text('pkt-txt-14');

  .pkt-icon {
    --fg-color: var(--color-grayscale-60);
    min-width: 1em;
    min-height: 1em;
    margin-top: -0.1rem;
  }
}
</style>

<template>
  <div class="widgetKeyResultProgressDetails">
    <div class="widgetKeyResultProgressDetails__infoMessage">
      <strong>
        {{ percentage(keyResult.progression) }}
      </strong>
      {{ $t('progress.done') }}
    </div>
    <div>
      <div v-if="isCompleted">
        {{ randomCompletedMessage() }}
      </div>
      <div v-else class="widgetKeyResultProgressDetails__infoMessage">
        <strong>
          {{ remainingKeyResultProgress }}
        </strong>
        {{ $t('progress.remaining', { unit: keyResult.unit }) }}
      </div>
    </div>
  </div>
</template>

<script>
import { format } from 'd3-format';
import vueI18n from '@/locale/i18n';
import { getRandomInt } from '@/util';

export default {
  name: 'WidgetKeyResultProgressDetails',
  props: {
    keyResult: {
      type: Object,
      required: true,
    },
  },
  computed: {
    isCompleted() {
      const { currentValue, targetValue } = this.keyResult;

      return currentValue >= targetValue;
    },
    remainingKeyResultProgress() {
      const { currentValue, startValue, targetValue } = this.keyResult;

      if (targetValue < startValue) {
        if (!currentValue) {
          return startValue;
        }
        return startValue - currentValue;
      }

      if (!currentValue) {
        return targetValue;
      }

      return targetValue - currentValue;
    },
  },
  methods: {
    format,
    percentage(value) {
      return format('.0%')(value);
    },
    randomCompletedMessage() {
      const messages = Object.values(vueI18n.t('progress.completedMessages'));
      const randomIndex = getRandomInt(messages.length);

      return messages[randomIndex];
    },
  },
};
</script>

<style lang="scss" scoped>
.widgetKeyResultProgressDetails {
  &__infoMessage {
    &:not(:last-child) {
      margin-bottom: 0.25rem;
    }

    strong {
      font-weight: 700;
    }
  }
}
</style>

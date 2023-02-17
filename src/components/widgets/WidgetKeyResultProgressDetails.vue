<template>
  <div class="widgetKeyResultProgressDetails">
    <div class="widgetKeyResultProgressDetails__infoMessage">
      <strong>{{ progressDetails.percentageCompleted }}%</strong>
      {{ $t('progress.done') }}
    </div>
    <div>
      <div v-if="progressDetails.isCompleted">
        {{ randomCompletedMessage() }}
      </div>
      <div v-else class="widgetKeyResultProgressDetails__infoMessage">
        <strong>
          {{ progressDetails.formattedTotalRemainingTasks }}
        </strong>
        {{ $t('progress.remaining', { unit }) }}
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
    progressDetails: {
      type: Object,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
  },
  methods: {
    format,
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
  color: var(--color-text);

  &__infoMessage {
    &:not(:last-child) {
      margin-bottom: 0.25rem;
    }
  }
}
</style>

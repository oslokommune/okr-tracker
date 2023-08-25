<template>
  <pane-wrapper
    :title="activeObjective.name"
    class="objective-pane"
    closable
    @close="$router.push({ name: 'ItemHome' })"
  >
    <template #actions>
      <pkt-button
        v-if="hasEditRights"
        v-tooltip="$t('btn.updateObjective')"
        skin="tertiary"
        variant="icon-only"
        size="small"
        icon-name="edit"
        @onClick="$emit('edit-objective')"
      />
    </template>

    <span v-if="period" class="objective-pane__period">
      <pkt-icon name="calendar" />
      {{ periodDates(period) }}
    </span>

    <p v-if="activeObjective.description" class="objective-pane__description">
      {{ activeObjective.description }}
    </p>

    <progress-bar
      class="objective-pane__progression"
      :title="$t('objective.progressionTitle')"
      :progression="activeObjective.progression"
    />

    <div class="objective-pane__key-results-header" data-mode="dark">
      <h3>{{ $t('general.keyResults') }}</h3>
      <pkt-button
        v-if="hasEditRights"
        v-tooltip="$t('btn.createKeyResult')"
        :text="$t('btn.createKeyResult')"
        skin="primary"
        size="small"
        variant="icon-left"
        icon-name="plus-sign"
        @onClick="$emit('add-key-result')"
      />
    </div>

    <div class="objective-pane__key-results">
      <div v-if="loadingKeyResults">
        <loading-small />
        {{ $t('general.loading') }}
      </div>

      <template v-else-if="keyResults.length">
        <okr-link-card
          v-for="keyResult in keyResults"
          :key="keyResult.id"
          :route="{
            name: 'KeyResultHome',
            params: { objectiveId: activeObjective.id, keyResultId: keyResult.id },
          }"
          :title="keyResult.name"
          :progression="keyResult.progression"
          :active="activeKeyResult && activeKeyResult.id === keyResult.id"
        />
      </template>

      <empty-state
        v-else
        :heading="$t('empty.noKeyResults.heading')"
        :body="$t('empty.noKeyResults.body')"
      />
    </div>

    <div class="objective-pane__widgets">
      <widget-weights v-if="keyResults.length" :objective="activeObjective" />
      <widget-objective-details />
    </div>
  </pane-wrapper>
</template>

<script>
import { format } from 'd3-format';
import { mapGetters, mapState } from 'vuex';
import { dateLong, periodDates } from '@/util';
import { db } from '@/config/firebaseConfig';
import { PktButton } from '@oslokommune/punkt-vue2';
import ProgressBar from '@/components/ProgressBar.vue';
import PaneWrapper from '@/components/panes/PaneWrapper.vue';
import LoadingSmall from '@/components/LoadingSmall.vue';
import WidgetObjectiveDetails from '@/components/widgets/WidgetObjectiveDetails.vue';
import WidgetWeights from '@/components/widgets/WidgetWeights.vue';

export default {
  name: 'ObjectivePane',

  components: {
    PaneWrapper,
    EmptyState: () => import('@/components/EmptyState.vue'),
    OkrLinkCard: () => import('@/components/OkrLinkCard.vue'),
    LoadingSmall,
    PktButton,
    ProgressBar,
    WidgetWeights,
    WidgetObjectiveDetails,
  },

  data: () => ({
    loadingKeyResults: false,
    keyResults: [],
  }),

  computed: {
    ...mapState('okrs', ['activeObjective', 'activeKeyResult']),
    ...mapGetters(['hasEditRights']),

    period() {
      if (this.activeObjective.startDate && this.activeObjective.endDate) {
        return {
          startDate: this.activeObjective.startDate.toDate(),
          endDate: this.activeObjective.endDate.toDate(),
        };
      }

      if (this.activeObjective.period.startDate && this.activeObjective.period.endDate) {
        return {
          startDate: this.activeObjective.period.startDate.toDate(),
          endDate: this.activeObjective.period.endDate.toDate(),
        };
      }

      return null;
    },
  },

  watch: {
    activeObjective: {
      immediate: true,
      async handler(objective) {
        this.loadingKeyResults = true;
        const objectiveRef = await db.doc(`objectives/${objective.id}`);
        const keyResults = await db
          .collection('keyResults')
          .where('archived', '==', false)
          .where('objective', '==', objectiveRef)
          .orderBy('name');
        await this.$bind('keyResults', keyResults);
        this.loadingKeyResults = false;
      },
    },
  },

  methods: {
    dateLong,
    periodDates,

    percent(value) {
      return format('.0%')(value);
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.objective-pane {
  &__period {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    color: var(--color-grayscale-60);
    --fg-color: var(--color-grayscale-40);
  }

  &__description {
    @include get-text('pkt-txt-18-light');
  }

  &__progression {
    margin-top: 1rem;
  }

  h3 {
    @include get-text('pkt-txt-18-medium');
  }

  &__key-results-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 3rem 0 0 0;
  }

  &__key-results > .okr-link-card {
    margin-bottom: 1rem;
  }

  &__widgets {
    margin-top: 2rem;

    ::v-deep .widget {
      padding: 0;
      border: 0;
    }
  }
}
</style>

<template>
  <pane-wrapper
    ref="pane"
    class="objective-pane"
    closable
    @close="$router.push({ name: 'ItemHome' })"
  >
    <pkt-breadcrumbs
      class="pkt-hide-laptop-up"
      navigation-type="router"
      :breadcrumbs="breadcrumbs"
    />

    <pkt-tag text-style="normal-text" skin="grey" class="mt-size-8">
      {{ $t('general.objective') }}
    </pkt-tag>

    <div class="objective-pane__title">
      <h2 class="pkt-txt-18-medium">{{ activeObjective.name }}</h2>
      <pkt-button
        v-if="hasEditRights"
        v-tooltip="$t('btn.updateObjective')"
        skin="tertiary"
        variant="icon-only"
        size="small"
        icon-name="edit"
        @onClick="$emit('edit-objective')"
      />
    </div>

    <HTML-output
      v-if="activeObjective.description"
      class="objective-pane__description"
      :html="activeObjective.description"
    />

    <progress-bar
      class="objective-pane__progression"
      :title="$t('objective.progressionTitle')"
      :progression="activeObjective.progression"
    />

    <div v-if="period" class="mt-size-16">
      <div class="pkt-txt-14-medium">{{ $t('objective.period') }}</div>
      <div class="pkt-txt-14">{{ periodDates(period) }}</div>
    </div>

    <div class="objective-pane__key-results">
      <div class="objective-pane__key-results-header">
        <h3 class="pkt-txt-16-medium">{{ $t('general.keyResults') }}</h3>
        <pkt-button
          v-if="hasEditRights"
          :text="$t('btn.createKeyResult')"
          skin="primary"
          size="small"
          variant="icon-left"
          icon-name="plus-sign"
          @onClick="$emit('add-key-result')"
        />
      </div>

      <div v-if="loadingKeyResults">
        <loading-small />
        {{ $t('general.loading') }}
      </div>

      <draggable
        v-else-if="hasEditRights && keyResults.length"
        v-model="orderedKeyResults"
        class="objective-pane__key-results-list"
        animation="200"
      >
        <transition-group>
          <okr-link-card
            v-for="keyResult in orderedKeyResults"
            :key="keyResult.id"
            :route="{
              name: 'KeyResultHome',
              params: { objectiveId: activeObjective.id, keyResultId: keyResult.id },
            }"
            :title="keyResult.name"
            :progression="keyResult.progression"
            :active="activeKeyResult && activeKeyResult.id === keyResult.id"
            compact
          />
        </transition-group>
      </draggable>

      <div v-else-if="keyResults.length" class="objective-pane__key-results-list">
        <okr-link-card
          v-for="keyResult in orderedKeyResults"
          :key="keyResult.id"
          :route="{
            name: 'KeyResultHome',
            params: { objectiveId: activeObjective.id, keyResultId: keyResult.id },
          }"
          :title="keyResult.name"
          :progression="keyResult.progression"
          :active="activeKeyResult && activeKeyResult.id === keyResult.id"
          compact
        />
      </div>

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
import { PktBreadcrumbs, PktButton, PktTag } from '@oslokommune/punkt-vue2';
import draggable from 'vuedraggable';
import { compareKeyResults } from '@/util/okr';
import { dateLong, periodDates } from '@/util';
import { db } from '@/config/firebaseConfig';
import KeyResult from '@/db/KeyResult';
import ProgressBar from '@/components/ProgressBar.vue';
import PaneWrapper from '@/components/panes/PaneWrapper.vue';
import LoadingSmall from '@/components/LoadingSmall.vue';
import WidgetObjectiveDetails from '@/components/widgets/WidgetObjectiveDetails.vue';
import WidgetWeights from '@/components/widgets/WidgetWeights.vue';
import EmptyState from '@/components/EmptyState.vue';
import OkrLinkCard from '@/components/OkrLinkCard.vue';
import HTMLOutput from '@/components/HTMLOutput.vue';

export default {
  name: 'ObjectivePane',

  components: {
    draggable,
    PaneWrapper,
    EmptyState,
    OkrLinkCard,
    HTMLOutput,
    LoadingSmall,
    PktBreadcrumbs,
    PktButton,
    PktTag,
    ProgressBar,
    WidgetWeights,
    WidgetObjectiveDetails,
  },

  data: () => ({
    loadingKeyResults: false,
    keyResults: [],
  }),

  computed: {
    ...mapState(['activeItem']),
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

    breadcrumbs() {
      return [
        { text: this.activeItem.name, href: { name: 'ItemHome' } },
        { text: this.activeObjective.name },
      ];
    },

    orderedKeyResults: {
      get() {
        return this.keyResults.map((kr) => kr).sort(compareKeyResults);
      },
      set(keyResults) {
        keyResults.forEach((kr, i) => {
          if (kr.order !== i) {
            KeyResult.update(kr.id, { order: i });
          }
        });
      },
    },
  },

  watch: {
    activeObjective: {
      immediate: true,
      async handler(objective) {
        this.$nextTick(() => {
          this.$refs.pane.$el.scrollTo({ top: 0, behavior: 'smooth' });
        });
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
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.objective-pane {
  background-color: var(--color-gray-light);

  &__title {
    display: flex;
    justify-content: space-between;
    text-wrap: balance;

    .pkt-btn {
      margin: -0.75rem 0 0 1rem;
    }
  }

  &__progression {
    margin-top: 1rem;
  }

  &__key-results {
    margin-top: 3rem;

    @include bp('tablet-up') {
      padding-right: 1.5rem;
    }

    &-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    &-list {
      position: relative;

      @include bp('tablet-up') {
        margin-left: 3rem;
      }

      & .okr-link-card {
        position: relative;
        margin-top: 1rem;

        @include bp('tablet-up') {
          &::before,
          &::after {
            position: absolute;
            left: -2.125rem;
            width: 2rem;
            border-left: 2px solid var(--color-grayscale-10);
          }

          &::before {
            position: absolute;
            top: 0;
            left: -2.125rem;
            height: 50%;
            border-bottom: 2px solid var(--color-grayscale-10);
            content: '';
          }
          &:not(:last-child)::after {
            top: 50%;
            height: calc(50% + 1.5rem);
            content: '';
          }
        }
      }
    }
  }

  &__widgets {
    margin-top: 2rem;

    ::v-deep .widget {
      padding: 0;
      border: 0;

      h3 {
        @include get-text('pkt-txt-16');
      }
    }
  }
}

::v-deep .pkt-breadcrumbs--mobile {
  width: 100%;

  .pkt-breadcrumbs__text {
    white-space: nowrap;
  }
}
</style>

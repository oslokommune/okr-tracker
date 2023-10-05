<template>
  <pane-wrapper
    ref="pane"
    class="key-result-pane"
    closable
    @close="
      $router.push({ name: 'ObjectiveHome', params: { objectiveId: activeObjective.id } })
    "
  >
    <pkt-breadcrumbs
      class="pkt-hide-laptop-up"
      navigation-type="router"
      :breadcrumbs="breadcrumbs"
    />

    <div class="key-result-pane__details">
      <div class="key-result-pane__header">
        <pkt-tag text-style="normal-text" skin="yellow">
          {{ $t('general.keyResult') }}
        </pkt-tag>

        <pkt-button
          v-if="hasEditRights"
          v-tooltip="$t('btn.updateKeyResult')"
          skin="tertiary"
          size="small"
          variant="icon-only"
          icon-name="edit"
          @onClick="$emit('edit-key-result')"
        />
      </div>

      <h2 class="pkt-txt-18-medium">{{ activeKeyResult.name }}</h2>

      <HTML-output
        v-if="activeKeyResult.description"
        class="key-result-pane__description"
        :html="activeKeyResult.description"
      />

      <progress-bar
        class="key-result-pane__progression"
        :title="`${$t('keyResult.progression')}:`"
        :progression="progression"
        :right-label="progressionRightLabel"
        skin="yellow"
      />
    </div>

    <div class="key-result-pane__values">
      <div class="key-result-pane__values-header">
        <h3 class="pkt-txt-16-medium">{{ $t('keyResult.registeredValues') }}</h3>
        <pkt-button
          v-if="hasEditRights"
          :text="$t('keyResult.newValue')"
          skin="primary"
          size="small"
          variant="icon-left"
          icon-name="plus-sign"
          @onClick="showValueModal = true"
        />
      </div>

      <div v-if="isLoading">
        <loading-small />
        {{ $t('general.loading') }}
      </div>

      <widget-progress-history
        v-else-if="progress.length"
        :progress="progress"
        :is-loading="isLoading"
        @update-record="updateHistoryRecord"
        @delete-record="deleteHistoryRecord"
      />

      <empty-state
        v-else
        icon="history"
        :heading="$t('widget.history.empty.heading')"
        :body="$t('empty.noKeyResultProgress')"
        skin="warning"
      />
    </div>

    <widget class="key-result-pane__graph" :title="$t('general.graph')">
      <svg ref="graph" class="graph"></svg>
    </widget>

    <pkt-alert v-if="activeKeyResult.auto" skin="info">
      {{ $t('keyResult.autoHelpText') }}
    </pkt-alert>

    <pkt-alert v-if="activeKeyResult.auto && activeKeyResult.error" skin="error">
      {{ $t('keyResult.autoError') }} {{ activeKeyResult.error }}
    </pkt-alert>

    <div class="key-result-pane__widgets">
      <!--
        Hide notes widget for now. This one needs work separately. We give the
        impression that these notes are secret to the team, which is really not
        the case currently.
      -->
      <!-- <widget-key-result-notes /> -->
      <widget-key-result-details />
    </div>

    <progress-modal
      v-if="showValueModal"
      @create-record="createHistoryRecord"
      @close="showValueModal = false"
    />
  </pane-wrapper>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import { format } from 'd3-format';
import { max, min } from 'd3-array';
import { db } from '@/config/firebaseConfig';
import KeyResult from '@/db/KeyResult';
import Progress from '@/db/Progress';
import LineChart from '@/util/LineChart';
import { getRandomInt } from '@/util';
import { getKeyResultProgressDetails } from '@/util/keyResultProgress';
import { PktAlert, PktBreadcrumbs, PktButton, PktTag } from '@oslokommune/punkt-vue2';
import PaneWrapper from '@/components/panes/PaneWrapper.vue';
import WidgetWrapper from '@/components/widgets/WidgetWrapper.vue';
import WidgetProgressHistory from '@/components/widgets/WidgetProgressHistory/WidgetProgressHistory.vue';
// import WidgetKeyResultNotes from '@/components/widgets/WidgetKeyResultNotes.vue';
import WidgetKeyResultDetails from '@/components/widgets/WidgetKeyResultDetails.vue';
import HTMLOutput from '@/components/HTMLOutput.vue';
import ProgressModal from '@/components/modals/ProgressModal.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import LoadingSmall from '@/components/LoadingSmall.vue';
import EmptyState from '@/components/EmptyState.vue';

export default {
  name: 'KeyResultPane',

  components: {
    PktAlert,
    PktButton,
    PktBreadcrumbs,
    PktTag,
    PaneWrapper,
    Widget: WidgetWrapper,
    WidgetProgressHistory,
    // WidgetKeyResultNotes,
    WidgetKeyResultDetails,
    HTMLOutput,
    ProgressModal,
    ProgressBar,
    LoadingSmall,
    EmptyState,
  },

  data: () => ({
    progress: [],
    graph: null,
    isLoading: false,
    showKeyResultDrawer: false,
    showValueModal: false,
  }),

  computed: {
    ...mapState(['activeItem', 'activePeriod']),
    ...mapState('okrs', ['activeObjective', 'activeKeyResult']),
    ...mapGetters(['hasEditRights']),

    startDate() {
      return this.activeKeyResult.objective.startDate || this.activePeriod.startDate;
    },

    endDate() {
      return this.activeKeyResult.objective.endDate || this.activePeriod.endDate;
    },

    progression() {
      const progressDetails = getKeyResultProgressDetails(this.activeKeyResult);
      return progressDetails.percentageCompleted / 100;
    },

    progressionRightLabel() {
      const progressDetails = getKeyResultProgressDetails(this.activeKeyResult);

      if (progressDetails.isCompleted) {
        return this.randomCompletedMessage();
      }

      return `${progressDetails.formattedTotalRemainingTasks} ${this.$t(
        'progress.remaining',
        { unit: this.activeKeyResult.unit }
      )}`;
    },

    breadcrumbs() {
      return [
        { text: this.activeItem.name, href: { name: 'ItemHome' } },
        {
          text: this.activeObjective.name,
          href: {
            name: 'ObjectiveHome',
            params: { objectiveId: this.activeObjective.id },
          },
        },
        { text: this.activeKeyResult.name },
      ];
    },
  },

  watch: {
    activeKeyResult: {
      immediate: true,
      async handler(keyResult, oldKeyResult) {
        if (!keyResult || keyResult.id === oldKeyResult?.id) {
          return;
        }

        this.$nextTick(() => {
          this.$refs.pane.$el.scrollTo({ top: 0, behavior: 'smooth' });
        });

        this.isLoading = true;
        await this.$bind(
          'progress',
          db
            .collection(`keyResults/${keyResult.id}/progress`)
            .orderBy('timestamp', 'desc')
        );
        this.isLoading = false;
        this.renderGraph();
      },
    },

    progress() {
      this.renderGraph();
    },
  },

  methods: {
    format,

    ...mapActions('okrs', ['setActiveKeyResult']),

    percent(value) {
      return format('.0%')(value);
    },

    renderGraph() {
      if (!this.graph) {
        this.graph = new LineChart(this.$refs.graph, {
          height: 450,
          tooltips: true,
        });
      }
      const { startValue, targetValue } = this.activeKeyResult;
      const progressValues = this.progress.map((record) => record.value);
      this.graph.render({
        startValue: min(progressValues) > startValue ? startValue : null,
        targetValue: max(progressValues) < targetValue ? targetValue : null,
        startDate: this.startDate.toDate(),
        endDate: this.endDate.toDate(),
        progress: this.progress,
        initialValue: startValue,
      });
    },

    async updateHistoryRecord(id, data, modalCloseHandler) {
      try {
        await Progress.update(
          db.collection('keyResults'),
          this.activeKeyResult.id,
          id,
          data
        );
        this.$toasted.show(this.$t('toaster.update.progress'));
      } catch {
        this.$toasted.error(this.$t('toaster.error.updateProgress'));
      } finally {
        modalCloseHandler();
      }
    },

    async deleteHistoryRecord(id) {
      try {
        await Progress.remove(db.collection('keyResults'), this.activeKeyResult.id, id);
        this.$toasted.show(this.$t('toaster.delete.progress'));
      } catch {
        this.$toasted.error(this.$t('toaster.error.deleteProgress'));
      }
    },

    async createHistoryRecord(data, modalCloseHandler) {
      try {
        await Progress.create(db.collection('keyResults'), this.activeKeyResult.id, data);
        this.$toasted.show(this.$t('toaster.add.progress'));
      } catch (e) {
        this.$toasted.error(this.$t('toaster.error.addProgress'));
      } finally {
        modalCloseHandler();
      }
    },

    async restore() {
      try {
        await KeyResult.restore(this.activeKeyResult.id);
      } catch {
        this.$toasted.error(
          this.$t('toaster.error.restore', { document: this.activeKeyResult.id })
        );
      }
    },

    randomCompletedMessage() {
      const messages = Object.values(this.$t('progress.completedMessages'));
      const randomIndex = getRandomInt(messages.length);

      return messages[randomIndex];
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.key-result-pane {
  background-color: #faf6f1;

  &__details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    background-color: var(--color-white);
    border-left: 0.25rem solid var(--color-yellow-50);

    @include bp('laptop-up') {
      margin-top: 2rem;
    }
  }

  &__header {
    display: flex;
    justify-content: space-between;
    text-wrap: balance;

    .pkt-btn {
      margin: -0.5rem -0.5rem 0 0;
    }
  }

  &__progression {
    margin-top: 1rem;
  }

  &__values {
    margin-top: 3rem;

    &-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    ::v-deep .widget__header {
      // Temporarily hide the history widget header. The table is
      // to be replaced
      display: none;
    }
  }

  &__graph {
    margin-top: 3rem;

    ::v-deep .widget__header {
      h3 {
        @include get-text('pkt-txt-16-medium');
      }
    }
  }

  &__widgets {
    margin-top: 3rem;

    ::v-deep .widget__header {
      h3 {
        @include get-text('pkt-txt-16');
      }
    }
  }
}

.empty {
  background-color: transparent;
}

::v-deep .widget {
  padding: 0;
  border: 0;
}

::v-deep .pkt-breadcrumbs--mobile {
  width: 100%;

  .pkt-breadcrumbs__text {
    white-space: nowrap;
  }
}
</style>

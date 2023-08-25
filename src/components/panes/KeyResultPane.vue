<template>
  <pane-wrapper
    :title="activeKeyResult.name"
    class="key-result-pane"
    closable
    @close="
      $router.push({ name: 'ObjectiveHome', params: { objectiveId: activeObjective.id } })
    "
  >
    <template #actions>
      <pkt-button
        v-if="hasEditRights"
        v-tooltip="$t('btn.updateKeyResult')"
        skin="tertiary"
        size="small"
        variant="icon-only"
        icon-name="edit"
        @onClick="$emit('edit-key-result')"
      />
    </template>

    <archived-restore
      v-if="activeKeyResult.archived"
      class="mt-size-16"
      :restore="restore"
      :object-type="$t('archived.keyResult')"
    />

    <p v-if="activeKeyResult.description" class="key-result-pane__description">
      {{ activeKeyResult.description }}
    </p>

    <progress-bar
      class="key-result-pane__progression"
      :title="`${$t('keyResult.progression')}:`"
      :progression="progression"
      :right-label="progressionRightLabel"
    />

    <widget-progress-history
      class="key-result-pane__values"
      :title="$t('keyResult.registeredValues')"
      :progress="progress"
      :is-loading="isLoading"
      @update-record="updateHistoryRecord"
      @delete-record="deleteHistoryRecord"
    >
      <template #title-actions>
        <div v-if="hasEditRights" data-mode="dark">
          <pkt-button
            v-tooltip="$t('keyResult.newValue')"
            :text="$t('keyResult.newValue')"
            skin="primary"
            size="small"
            variant="icon-left"
            icon-name="plus-sign"
            @onClick="showValueModal = true"
          />
        </div>
      </template>
    </widget-progress-history>

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
import { PktButton } from '@oslokommune/punkt-vue2';
import WidgetWrapper from '@/components/widgets/WidgetWrapper.vue';
import WidgetProgressHistory from '@/components/widgets/WidgetProgressHistory/WidgetProgressHistory.vue';
// import WidgetKeyResultNotes from '@/components/widgets/WidgetKeyResultNotes.vue';
import WidgetKeyResultDetails from '@/components/widgets/WidgetKeyResultDetails.vue';
import PaneWrapper from '@/components/panes/PaneWrapper.vue';
import ProgressBar from '@/components/ProgressBar.vue';

export default {
  name: 'KeyResultPane',

  components: {
    PktAlert: () => import('@oslokommune/punkt-vue2').then(({ PktAlert }) => PktAlert),
    ArchivedRestore: () => import('@/components/ArchivedRestore.vue'),
    ProgressModal: () => import('@/components/modals/ProgressModal.vue'),
    Widget: WidgetWrapper,
    WidgetProgressHistory,
    WidgetKeyResultDetails,
    // WidgetKeyResultNotes,
    PaneWrapper,
    PktButton,
    ProgressBar,
  },

  data: () => ({
    progress: [],
    graph: null,
    isLoading: false,
    showKeyResultDrawer: false,
    showValueModal: false,
  }),

  computed: {
    ...mapState(['activePeriod']),
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
  },

  watch: {
    activeKeyResult: {
      immediate: true,
      async handler(keyResult, oldKeyResult) {
        if (!keyResult || keyResult.id === oldKeyResult?.id) {
          return;
        }

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
@use '@/styles/typography';
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.key-result-pane {
  &__description {
    @include get-text('pkt-txt-18-light');
  }

  &__progression {
    margin-top: 1rem;
  }

  &__values,
  &__graph {
    margin-top: 3rem;
    padding: 0;
    border: 0;
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

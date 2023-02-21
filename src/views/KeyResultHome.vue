<template>
  <div v-if="activeKeyResult" class="container">
    <main class="main">
      <header>
        <span class="title-label">{{ $t('general.keyResult') }}</span>
        <h2 class="title-1">{{ activeKeyResult.name }}</h2>
        <p v-if="activeKeyResult.description" class="description">
          {{ activeKeyResult.description }}
        </p>
      </header>

      <section class="key-result-summary">
        <div class="key-result-summary__progress">
          <h3 class="title-2">
            {{ $t('keyResult.registerProgression.value') }} ({{ activeKeyResult.unit }})
          </h3>

          <div class="key-result-progression">
            <span class="key-result-progression__current">
              {{ progressDetails.formattedTotalCompletedTasks }}
            </span>
            <span class="key-result-progression__target">
              {{
                $t('progress.remainingOf', {
                  progress: progressDetails.formattedTotalNumberOfTasks,
                })
              }}
            </span>
          </div>

          <div class="key-result-progress-bar">
            <widget-key-result-progress-details
              :progress-details="progressDetails"
              :unit="activeKeyResult.unit"
            />
            <progress-bar
              :progression="progressDetails.percentageCompleted"
              :is-compact="false"
            />
          </div>
        </div>

        <div v-if="allowedToEditPeriod" class="key-result-summary__value">
          <key-result-value-form
            :key-result="activeKeyResult"
            :loading="isSaving"
            :comment-rows="2"
            @save="saveProgress"
          />
        </div>
      </section>

      <section class="key-result-graph">
        <h3 class="title-2">{{ $t('objective.progression') }}</h3>
        <svg ref="graph" class="graph"></svg>
      </section>

      <pkt-alert v-if="activeKeyResult.auto" skin="info">
        <template #content>{{ $t('keyResult.autoHelpText') }}</template>
      </pkt-alert>

      <pkt-alert v-if="activeKeyResult.auto && activeKeyResult.error" skin="error">
        <template #content>
          {{ $t('keyResult.autoError') }} {{ activeKeyResult.error }}
        </template>
      </pkt-alert>

      <widget-progress-history
        :progress="progress"
        :is-loading="isLoading"
        :no-values-message="$t('empty.noKeyResultProgress')"
        @update-record="updateHistoryRecord"
        @delete-record="deleteHistoryRecord"
      />
    </main>

    <widgets-right />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { format } from 'd3-format';
import { max, min } from 'd3-array';
import { db } from '@/config/firebaseConfig';
import Progress from '@/db/Progress';
import LineChart from '@/util/LineChart';
import { getKeyResultProgressDetails } from '@/util/keyResultProgress';
import routerGuard from '@/router/router-guards/keyResultHome';
import WidgetProgressHistory from '@/components/widgets/WidgetProgressHistory/WidgetProgressHistory.vue';
import KeyResultValueForm from '@/components/forms/KeyResultValueForm.vue';

export default {
  name: 'KeyResultHome',

  components: {
    WidgetsRight: () => import('@/components/widgets/WidgetsKeyResultHome.vue'),
    WidgetKeyResultProgressDetails: () =>
      import('@/components/widgets/WidgetKeyResultProgressDetails.vue'),
    ProgressBar: () => import('@/components/ProgressBar.vue'),
    PktAlert: () => import('@oslokommune/punkt-vue2').then(({ PktAlert }) => PktAlert),
    KeyResultValueForm,
    WidgetProgressHistory,
  },

  beforeRouteUpdate: routerGuard,

  async beforeRouteLeave(to, from, next) {
    try {
      await this.$store.dispatch('set_active_key_result', null);
      next();
    } catch (error) {
      console.error(error);
      next(false);
    }
  },

  data: () => ({
    progress: [],
    graph: null,
    isLoading: false,
    isSaving: false,
    progressDetails: {},
  }),

  computed: {
    ...mapState(['activeKeyResult', 'activePeriod', 'user', 'activeItem']),
    ...mapGetters(['hasEditRights', 'allowedToEditPeriod']),
  },

  watch: {
    activeKeyResult: {
      immediate: true,
      async handler(keyResult) {
        if (!keyResult) {
          return;
        }
        this.progressDetails = getKeyResultProgressDetails(keyResult);
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

  mounted() {
    if (!this.$refs.graph) {
      return;
    }
    if (!this.activeKeyResult) {
      return;
    }

    this.renderGraph();
  },

  methods: {
    format,

    renderGraph() {
      if (!this.graph) {
        this.graph = new LineChart(this.$refs.graph, {
          height: 450,
          tooltips: true,
        });
      }

      const startDate = this.activePeriod.startDate.toDate();
      const endDate = this.activePeriod.endDate.toDate();
      const { startValue, targetValue } = this.activeKeyResult;
      const progressValues = this.progress.map((record) => record.value);

      this.graph.render({
        startValue: min(progressValues) > startValue ? startValue : null,
        targetValue: max(progressValues) < targetValue ? targetValue : null,
        startDate,
        endDate,
        progress: this.progress,
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

    async saveProgress(value, comment) {
      if (!this.allowedToEditPeriod) {
        return;
      }

      this.isSaving = true;
      try {
        await Progress.create(db.collection('keyResults'), this.activeKeyResult.id, {
          value,
          comment,
          timestamp: new Date(),
        });
        this.$toasted.show(this.$t('toaster.add.progress'));
      } catch (e) {
        console.log(e);
        this.$toasted.error(this.$t('toaster.error.addProgress'));
      } finally {
        this.isSaving = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';

.pkt-alert {
  margin-bottom: 1rem;
}

.key-result-summary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  @media screen and (min-width: bp(s)) {
    flex-direction: row;
  }

  &__progress {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem 1.75rem;
    background: var(--color-white);

    @each $bp, $grow in (s: 1, m: 2, xl: 3) {
      @media screen and (min-width: bp(#{$bp})) {
        flex: #{$grow};
      }
    }
  }

  &__value {
    flex: 1;
    padding: 1.5rem 1.75rem;
    background: var(--color-white);

    ::v-deep form {
      span:first-child .form-group {
        margin-top: 0;
      }

      textarea {
        resize: vertical;
      }

      .button-row {
        margin-top: 0.5rem;
      }
    }
  }
}

.key-result-progression {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  color: var(--color-text);

  &__current {
    padding: 1rem 2rem;
    font-weight: 700;
    font-size: typography.$font-size-5;
    background-color: var(--color-gray);
  }

  &__target {
    margin-left: 2.5rem;
    padding: 0.5rem 0.5rem;
    font-size: typography.$font-size-0;
  }
}

.key-result-progress-bar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.key-result-graph {
  padding: 1.5rem 1.75rem;
  background-color: var(--color-white);
}
</style>

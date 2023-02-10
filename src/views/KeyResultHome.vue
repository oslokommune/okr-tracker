<template>
  <div v-if="activeKeyResult" class="container">
    <main class="main">
      <section>
        <h2 class="title-1">{{ $t('general.keyResult') }}</h2>

        <div class="key-result-row">
          <div class="key-result-row__progress">
            <h3 class="key-result-row__progress--header">
              {{ $t('keyResult.registerProgression.value') }} ({{ activeKeyResult.unit }})
            </h3>
            <widget-key-result-progress-details
              :progress-details="progressDetails"
              :unit="activeKeyResult.unit"
            />
            <div class="progression__total">
              <span class="progression__total--current">
                {{ progressDetails.formattedTotalCompletedTasks }}
              </span>
              <span class="progression__total--target">
                {{
                  $t('progress.remainingOf', {
                    progress: progressDetails.formattedTotalNumberOfTasks,
                  })
                }}
              </span>
            </div>
            <progress-bar
              :progression="progressDetails.percentageCompleted"
              :is-compact="false"
              :dark="true"
              class="key-result-row__progressBar"
            />
          </div>

          <div class="key-result-row__info">
            <h3 class="title-3">{{ activeKeyResult.name }}</h3>
            <span class="key-result-row__info--description">
              {{ activeKeyResult.description }}
            </span>
          </div>

          <div class="key-result__value">
            <div>
              <h3 class="title-2">{{ $t('keyResult.newValue') }}</h3>

              <validation-observer v-slot="{ handleSubmit }">
                <form id="modal" @submit.prevent="handleSubmit(saveProgress)">
                  <label>
                    <span class="title-4">{{ $t('keyResult.addComment') }}</span>
                    <textarea
                      v-model="progressNote"
                      style="margin-top: 0.5rem"
                      rows="3"
                      :placeholder="$t('keyResult.commentPlaceholder')"
                      :disabled="!allowedToEditPeriod"
                    />
                  </label>

                  <div>
                    <validation-provider
                      v-slot="{ errors }"
                      name="value"
                      rules="required"
                    >
                      <label class="form-group">
                        <span class="form-label">{{ $t('keyResult.newValue') }}</span>
                        <input
                          v-model="value"
                          style="margin-top: 0.25rem"
                          type="number"
                          step="any"
                          :disabled="!allowedToEditPeriod"
                        />
                        <span class="form-field--error">{{ errors[0] }}</span>
                      </label>
                    </validation-provider>
                  </div>
                </form>
              </validation-observer>
            </div>

            <btn-save
              v-if="allowedToEditPeriod"
              form="modal"
              variant="primary"
              class="key-result__value--button"
              :disabled="isSaving"
            />
          </div>

          <div class="key-result__graph">
            <h2 class="title-2">
              {{ $t('objective.progression') }}
            </h2>

            <svg ref="graph" class="graph"></svg>
          </div>
        </div>

        <div v-if="activeKeyResult.auto" class="auto">
          <div class="auto__icon fa fa-magic"></div>
          <div class="auto__text">
            {{ $t('keyResult.autoHelpText') }}
          </div>
        </div>

        <div
          v-if="activeKeyResult.auto && activeKeyResult.error"
          class="auto auto--invalid"
        >
          <div class="auto__icon fa fa-exclamation-triangle"></div>
          <div class="auto__text">
            <p>{{ $t('keyResult.autoError') }}</p>
            <pre class="auto__errormsg">{{ activeKeyResult.error }}</pre>
          </div>
        </div>

        <widget-progress-history
          :progress="progress"
          :is-loading="isLoading"
          :no-values-message="$t('empty.noKeyResultProgress')"
          @update-record="updateHistoryRecord"
          @delete-record="deleteHistoryRecord"
        />
      </section>
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
import { BtnSave } from '@/components/generic/form/buttons';

export default {
  name: 'KeyResultHome',

  components: {
    WidgetsRight: () => import('@/components/widgets/WidgetsKeyResultHome.vue'),
    WidgetKeyResultProgressDetails: () =>
      import('@/components/widgets/WidgetKeyResultProgressDetails.vue'),
    ProgressBar: () => import('@/components/ProgressBar.vue'),
    WidgetProgressHistory,
    BtnSave,
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
    newValue: null,
    graph: null,
    isLoading: false,
    progressNote: '',
    isSaving: false,
    value: null,
    chosenProfileId: null,
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
        this.value = this.progressDetails.totalCompletedTasks;
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

    async saveProgress() {
      if (!this.allowedToEditPeriod) {
        return;
      }

      this.isSaving = true;
      try {
        await Progress.create(db.collection('keyResults'), this.activeKeyResult.id, {
          value: +this.value,
          comment: this.progressNote,
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

.auto {
  display: flex;
  margin: 1.5rem 0;
  padding: 1rem;
  font-weight: 500;
  background: rgba(var(--color-yellow-rgb), 0.25);
  border: 1px solid var(--color-primary);
  border-radius: 3px;
}

.auto--invalid {
  background: rgba(var(--color-red-rgb), 0.25);
  border: 1px solid var(--color-red);
}

.auto__text {
  width: 100%;
}

.auto__icon {
  flex-shrink: 0;
  margin-top: 0.2rem;
  margin-right: 0.75rem;
}

.auto__errormsg {
  width: 100%;
  margin-top: 1.25rem;
  padding: 1rem;
  color: var(--color-white);
  font-family: monospace;
  background: rgba(black, 0.75);
  border-radius: 3px;
}

.key-result-row {
  display: flex;
  flex-direction: column;

  @media screen and (min-width: bp(s)) {
    display: grid;
    grid-row-gap: 1px;
    grid-column-gap: 1px;
    grid-template-rows: repeat(3, auto);
    grid-template-columns: 1fr span(3, span(8));
    margin-bottom: 0.5rem;
  }
}

.key-result-row__info {
  grid-area: 2 / 1 / 3 / 2;
  padding: 1.5rem 1.75rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  background-color: var(--color-primary);
}

.key-result-row__info--description {
  margin-top: 0.5rem;
  font-size: 0.8rem;
}

.key-result-row__progress {
  display: grid;
  grid-area: 1 / 1 / 2 / 2;
  grid-column-gap: 2px;
  grid-template-rows: repeat(5, auto);
  grid-template-columns: 1fr;
  align-self: center;
  width: 100%;
  height: 100%;
  padding: 1.5rem 1.75rem 1.5rem 1.75rem;
  color: var(--color-text-secondary);
  background-color: var(--color-primary);
}

.key-result-row__progressBar {
  grid-area: 5 / 1 / 6 / 2;
  margin-top: 1rem;
}

.progression__total {
  display: grid;
  grid-area: 2 / 1 / 3 / 2;
  grid-template-rows: repeat(2, auto);
  grid-template-columns: 1fr;
  justify-self: start;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.progression__total--current {
  align-self: center;
  justify-self: center;
  padding: 1rem 2rem;
  color: var(--color-text);
  font-weight: 700;
  font-size: typography.$font-size-5;
  background-color: var(--color-gray-light);
}

.progression__total--target {
  align-self: end;
  justify-self: end;
  padding: 0.5rem 0.5rem;
  color: var(--color-text-secondary);
  font-size: typography.$font-size-0;
}

.key-result__graph {
  grid-area: 3 / 1 / 4 / 3;
  padding: 1.5rem 1.75rem;
  background-color: var(--color-white);
}

.key-result__value {
  display: flex;
  flex-direction: column;
  grid-area: 1 / 2 / 3 / 3;
  justify-content: space-between;
  padding: 1.5rem 1.75rem 1.5rem 1.75rem;
  color: var(--color-text-secondary);
  background-color: var(--color-primary);
}

.key-result__value--button {
  align-self: end;
  border: 1px solid var(--color-white);
}
</style>

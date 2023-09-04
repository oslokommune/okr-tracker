<template>
  <page-layout v-if="activeKeyResult">
    <template #default>
      <header>
        <span class="title-label pkt-txt-16-light">{{ $t('general.keyResult') }}</span>
        <div class="keyResult__heading">
          <h2 class="title-1">{{ activeKeyResult.name }}</h2>
          <div class="keyResult__edit">
            <pkt-button
              v-tooltip="$t('admin.keyResult.change')"
              icon-name="edit"
              :text="$t('admin.keyResult.change')"
              :variant="'icon-only'"
              skin="tertiary"
              @onClick="showKeyResultDrawer = true"
            />
          </div>
        </div>
        <p v-if="activeKeyResult.description" class="description">
          {{ activeKeyResult.description }}
        </p>
      </header>

      <archived-restore
        v-if="activeKeyResult.archived"
        class="mt-size-16"
        :restore="restore"
        :object-type="$t('archived.keyResult')"
      />

      <div class="key-result-summary widgets">
        <widget
          class="key-result-summary__progress"
          :title="`${$t('keyResult.registerProgression.value')} (${
            activeKeyResult.unit
          })`"
        >
          <div class="key-result-summary__progress-inner">
            <div class="key-result-progression">
              <span class="key-result-progression__current pkt-txt-24-bold">
                {{ progressDetails.formattedTotalCompletedTasks }}
              </span>
              <span class="key-result-progression__target pkt-txt-12-light">
                {{
                  $t('progress.remainingOf', {
                    progress: progressDetails.formattedTotalNumberOfTasks,
                  })
                }}
              </span>
            </div>

            <div class="key-result-progress-bar">
              <key-result-progress-details
                :progress-details="progressDetails"
                :unit="activeKeyResult.unit"
              />
              <progress-bar :progression="progressDetails.percentageCompleted" />
            </div>
          </div>
        </widget>

        <widget v-if="hasEditRights" class="key-result-summary__value">
          <key-result-value-form
            :key-result="activeKeyResult"
            :loading="isSaving"
            :comment-rows="2"
            @save="saveProgress"
          />
        </widget>
      </div>

      <widget class="key-result-graph" :title="$t('objective.progression')">
        <svg ref="graph" class="graph"></svg>
      </widget>

      <pkt-alert v-if="activeKeyResult.auto" skin="info">
        {{ $t('keyResult.autoHelpText') }}
      </pkt-alert>

      <pkt-alert v-if="activeKeyResult.auto && activeKeyResult.error" skin="error">
        {{ $t('keyResult.autoError') }} {{ activeKeyResult.error }}
      </pkt-alert>

      <widget-progress-history
        :progress="progress"
        :is-loading="isLoading"
        @update-record="updateHistoryRecord"
        @delete-record="deleteHistoryRecord"
      />

      <key-result-drawer
        :visible="showKeyResultDrawer"
        :objective="activeObjective"
        :key-result="activeKeyResult"
        @close="showKeyResultDrawer = false"
      />
    </template>

    <template #sidebar>
      <widget-key-result-notes />
      <widget-key-result-details />
    </template>
  </page-layout>
  <not-found-page
    v-else
    :heading="$t('notFound.keyResultHeading')"
    :body="$t('notFound.keyResultBody')"
    back-to="ItemHome"
    :back-text="$t('notFound.linkTextAlt', { page: activeItem.name })"
  />
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { format } from 'd3-format';
import { max, min } from 'd3-array';
import { db } from '@/config/firebaseConfig';
import KeyResult from '@/db/KeyResult';
import Progress from '@/db/Progress';
import LineChart from '@/util/LineChart';
import { getKeyResultProgressDetails } from '@/util/keyResultProgress';
import routerGuard from '@/router/router-guards/keyResultHome';
import WidgetWrapper from '@/components/widgets/WidgetWrapper.vue';
import WidgetKeyResultNotes from '@/components/widgets/WidgetKeyResultNotes.vue';
import WidgetKeyResultDetails from '@/components/widgets/WidgetKeyResultDetails.vue';
import KeyResultProgressDetails from '@/components/KeyResultProgressDetails.vue';
import WidgetProgressHistory from '@/components/widgets/WidgetProgressHistory/WidgetProgressHistory.vue';
import KeyResultValueForm from '@/components/forms/KeyResultValueForm.vue';
import { PktButton } from '@oslokommune/punkt-vue2';

export default {
  name: 'KeyResultHome',

  components: {
    NotFoundPage: () => import('@/components/pages/NotFoundPage.vue'),
    ProgressBar: () => import('@/components/ProgressBar.vue'),
    PktAlert: () => import('@oslokommune/punkt-vue2').then(({ PktAlert }) => PktAlert),
    KeyResultProgressDetails,
    KeyResultValueForm,
    Widget: WidgetWrapper,
    WidgetKeyResultDetails,
    WidgetKeyResultNotes,
    WidgetProgressHistory,
    PktButton,
    KeyResultDrawer: () => import('@/components/drawers/EditKeyResult.vue'),
    ArchivedRestore: () => import('@/components/ArchivedRestore.vue'),
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
    showKeyResultDrawer: false,
  }),

  computed: {
    ...mapState([
      'activeKeyResult',
      'activeObjective',
      'activePeriod',
      'user',
      'activeItem',
    ]),
    ...mapGetters(['hasEditRights']),

    startDate() {
      return this.activeKeyResult.objective.startDate || this.activePeriod.startDate;
    },

    endDate() {
      return this.activeKeyResult.objective.endDate || this.activePeriod.endDate;
    },
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

    async saveProgress(value, comment) {
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

    async restore() {
      try {
        await KeyResult.restore(this.activeKeyResult.id);
      } catch {
        this.$toasted.error(
          this.$t('toaster.error.restore', { document: this.activeKeyResult.id })
        );
      }
    },
  },
};
</script>

<style lang="scss" scoped>
header {
  display: flex;
  flex-direction: column;
}

.title-label {
  margin-bottom: 0.5rem;
  color: var(--color-grayscale-40);
}

.pkt-alert {
  margin-bottom: 1rem;
}

.key-result-summary {
  grid-template-columns: 1fr;

  &__progress {
    height: 100%;

    &-inner {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
  }

  &__value {
    margin-bottom: 0;

    ::v-deep form {
      span:first-child .form-group {
        margin-top: 0;
      }

      textarea {
        resize: vertical;
      }
    }
  }

  @include bp('tablet-up') {
    grid-auto-columns: 1fr;
    grid-auto-flow: column;

    .key-result-summary__progress {
      grid-column: span 7;
    }

    .key-result-summary__value {
      grid-column: span 5;
    }
  }
}

.keyResult__edit {
  display: flex;
  justify-content: flex-end;
}

.keyResult__heading {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.key-result-progression {
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  &__current {
    padding: 0.75rem 2rem;
    background-color: var(--color-gray);
  }

  &__target {
    margin-left: 2.5rem;
    padding: 0.5rem 0.5rem;
  }
}

.key-result-progress-bar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>

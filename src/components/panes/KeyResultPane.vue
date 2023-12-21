<template>
  <pane-wrapper
    ref="pane"
    class="key-result-pane"
    closable
    @close="
      $router.push({ name: 'ObjectiveHome', params: { objectiveId: activeObjective.id } })
    "
  >
    <template #title>
      <pkt-breadcrumbs
        class="pkt-hide-laptop-up"
        navigation-type="router"
        :breadcrumbs="breadcrumbs"
      />
    </template>

    <h1 class="key-result-pane__title pkt-txt-18-medium">
      {{ $t('general.keyResult') }}
    </h1>

    <div class="key-result-pane__details">
      <div class="key-result-pane__header">
        <h2 class="pkt-txt-18-medium">{{ activeKeyResult.name }}</h2>

        <pkt-button
          v-if="canEdit"
          v-tooltip="$t('btn.updateKeyResult')"
          skin="tertiary"
          size="small"
          variant="icon-only"
          icon-name="edit"
          @onClick="$emit('edit-key-result')"
        />
      </div>

      <HTML-output
        v-if="activeKeyResult.description"
        class="key-result-pane__description"
        :html="activeKeyResult.description"
      />

      <div class="key-result-pane__progression">
        <h4 class="pkt-txt-14-medium">{{ $t('keyResult.progression') }}</h4>
        <pkt-button
          v-if="canEdit"
          :text="$t('widget.history.value')"
          skin="primary"
          size="small"
          variant="icon-left"
          icon-name="plus-sign"
          @onClick="openValueModal(null)"
        />
      </div>

      <svg ref="graph" class="key-result-pane__graph"></svg>

      <progress-bar :progression="progression" :show-min-max-indicators="true" />
    </div>

    <div class="key-result-pane__values">
      <h3 class="pkt-txt-16-medium">{{ $t('keyResult.registeredValues') }}</h3>

      <div v-if="isLoading">
        <loading-small />
        {{ $t('general.loading') }}
      </div>

      <key-result-values-list
        v-else-if="progress.length"
        :progress="progress"
        :can-edit="canEdit"
        class="key-result-pane__table"
        @edit-value="openValueModal"
        @delete-value="(record) => deleteHistoryRecord(record.id)"
      />

      <empty-state
        v-else
        icon="history"
        :heading="$t('widget.history.empty.heading')"
        :body="$t('empty.noKeyResultProgress')"
        skin="warning"
      />
    </div>

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
      :record="chosenProgressValue"
      @create-record="createHistoryRecord"
      @update-record="updateHistoryRecord"
      @delete-record="deleteHistoryRecord"
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
import { getKeyResultProgressDetails } from '@/util/keyResultProgress';
import { PktAlert, PktBreadcrumbs, PktButton } from '@oslokommune/punkt-vue2';
import PaneWrapper from '@/components/panes/PaneWrapper.vue';
// import WidgetKeyResultNotes from '@/components/widgets/WidgetKeyResultNotes.vue';
import WidgetKeyResultDetails from '@/components/widgets/WidgetKeyResultDetails.vue';
import KeyResultValuesList from '@/components/KeyResultValuesList.vue';
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
    PaneWrapper,
    // WidgetKeyResultNotes,
    WidgetKeyResultDetails,
    KeyResultValuesList,
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
    chosenProgressValue: null,
  }),

  computed: {
    ...mapState(['activeItem', 'activePeriod', 'user']),
    ...mapState('okrs', ['activeObjective', 'activeKeyResult']),
    ...mapGetters(['isAdminOfCurrentOrganization']),

    isMemberOfKeyResultParent() {
      return this.activeKeyResult.parent.team?.includes(`users/${this.user.id}`);
    },

    canEdit() {
      return (
        this.user.superAdmin ||
        this.isAdminOfCurrentOrganization ||
        this.isMemberOfKeyResultParent
      );
    },

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
          height: 350,
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

    async deleteHistoryRecord(id, modalCloseHandler) {
      try {
        await Progress.remove(db.collection('keyResults'), this.activeKeyResult.id, id);
        this.$toasted.show(this.$t('toaster.delete.progress'));
      } catch {
        this.$toasted.error(this.$t('toaster.error.deleteProgress'));
      } finally {
        modalCloseHandler();
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

    openValueModal(record) {
      this.showValueModal = true;
      this.chosenProgressValue = record;
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.key-result-pane {
  background-color: var(--color-gray);

  &__details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    background-color: var(--color-white);
    border-left: 0.25rem solid var(--color-blue-dark);
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.5rem;
  }

  &__values {
    margin-top: 3rem;
  }

  &__table {
    margin-top: 1rem;
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

::v-deep .pkt-breadcrumbs {
  display: flex;

  &--mobile {
    width: 100%;

    .pkt-breadcrumbs__text {
      white-space: nowrap;
    }
  }
}
</style>

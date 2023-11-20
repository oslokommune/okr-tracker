<template>
  <div class="okr-panes">
    <pane-layout v-if="!notFoundState && (timelineObjectives.length || dataLoading)">
      <!-- Timeline -->
      <timeline-pane @add-objective="openObjectiveDrawer(false)" />

      <!-- Workbench (objective list) -->
      <workbench-pane v-if="workbenchObjectives.length" />

      <!-- Objective -->
      <objective-pane
        v-if="activeObjective"
        @edit-objective="openObjectiveDrawer(true)"
        @add-key-result="openKeyResultDrawer(false)"
      />

      <!-- Key result -->
      <key-result-pane
        v-if="activeObjective && activeKeyResult"
        @edit-key-result="openKeyResultDrawer(true)"
      />
    </pane-layout>

    <not-found-page
      v-else-if="notFoundState"
      :heading="
        $t(`notFound.${!activeObjective ? 'objectiveHeading' : 'keyResultHeading'}`)
      "
      :body="$t(`notFound.${!activeObjective ? 'objectiveBody' : 'keyResultBody'}`)"
      back-to="ItemHome"
      :back-text="$t('btn.back')"
    />

    <empty-page
      v-else
      :heading="$t('empty.noObjectives.heading')"
      :body="$t('empty.noObjectives.body')"
    >
      <div v-if="hasEditRights" data-mode="dark">
        <pkt-button
          :text="$t('btn.createObjective')"
          skin="primary"
          variant="icon-left"
          icon-name="plus-sign"
          @onClick="showObjectiveDrawer = true"
        />
      </div>
    </empty-page>

    <objective-drawer
      v-if="showObjectiveDrawer"
      :objective="drawerEditMode ? activeObjective : null"
      :newest-objective="newestObjective"
      @create="objectiveCreated"
      @archive="$router.replace({ name: 'ItemHome' })"
      @restore="
        $router.replace({
          name: 'ObjectiveHome',
          params: { objectiveId: $event.id },
        })
      "
      @close="closeObjectiveDrawer"
      @add-key-result="openKeyResultDrawer(false)"
    />

    <key-result-drawer
      v-if="activeObjective && showKeyResultDrawer"
      :objective="activeObjective"
      :key-result="drawerEditMode ? activeKeyResult : null"
      @archive="
        $router.replace({
          name: 'ObjectiveHome',
          params: { objectiveId: activeObjective.id },
        })
      "
      @restore="
        $router.replace({
          name: 'KeyResultHome',
          params: { objectiveId: activeObjective.id, keyResultId: $event.id },
        })
      "
      @close="closeKeyResultDrawer"
    />
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex';
import { firestoreEncode } from '@/util/firebaseUtil';
import { PktButton } from '@oslokommune/punkt-vue2';
import routerGuard from '@/router/router-guards/itemOKRs';
import PaneLayout from '@/components/layout/PaneLayout.vue';
import TimelinePane from '@/components/panes/TimelinePane.vue';
import ObjectivePane from '@/components/panes/ObjectivePane.vue';
import KeyResultPane from '@/components/panes/KeyResultPane.vue';
import WorkbenchPane from '@/components/panes/WorkbenchPane.vue';
import ObjectiveDrawer from '@/components/drawers/EditObjective.vue';
import KeyResultDrawer from '@/components/drawers/EditKeyResult.vue';
import EmptyPage from '@/components/pages/EmptyPage.vue';
import NotFoundPage from '@/components/pages/NotFoundPage.vue';

export default {
  name: 'ItemOKRs',

  components: {
    PktButton,
    PaneLayout,
    TimelinePane,
    ObjectivePane,
    KeyResultPane,
    WorkbenchPane,
    ObjectiveDrawer,
    KeyResultDrawer,
    EmptyPage,
    NotFoundPage,
  },

  beforeRouteUpdate: routerGuard,

  data: () => ({
    drawerEditMode: false,
    showObjectiveDrawer: false,
    showKeyResultDrawer: false,
    notFoundState: false,
  }),

  computed: {
    ...mapState(['activeItem', 'dataLoading']),
    ...mapState('okrs', ['selectedPeriod', 'activeObjective', 'activeKeyResult']),
    ...mapGetters(['hasEditRights']),
    ...mapGetters('okrs', [
      'objectivesWithID',
      'timelineObjectives',
      'workbenchObjectives',
    ]),

    newestObjective() {
      if (!this.objectivesWithID.length) {
        return null;
      }

      return this.objectivesWithID.slice().sort((a, b) => {
        if (a.created && b.created) {
          return a.created.seconds > b.created.seconds ? -1 : 1;
        }
        return 0;
      })[0];
    },
  },

  watch: {
    $route: {
      immediate: false,
      handler: 'updateActive',
    },
  },

  async created() {
    await this.setData();
  },

  async beforeDestroy() {
    await this.setActiveObjective(null);
    await this.setActiveKeyResult(null);
  },

  methods: {
    ...mapActions(['set_active_period_and_data', 'setDataLoading']),
    ...mapActions('okrs', [
      'setActiveObjective',
      'setActiveKeyResult',
      'addWorkbenchObjective',
    ]),

    async setData() {
      try {
        await this.setDataLoading(true);
        await this.set_active_period_and_data({
          item: this.activeItem,
        });
        await this.updateActive();
      } catch (e) {
        console.log(e);
      } finally {
        await this.setDataLoading(false);
      }
    },

    async updateActive() {
      this.notFoundState = false;
      const { objectiveId, keyResultId } = this.$route.params;

      if (!objectiveId && (this.activeObjective || this.activeKeyResult)) {
        await this.setActiveObjective(null);
        await this.setActiveKeyResult(null);
        return;
      }
      if (!keyResultId && this.activeKeyResult) {
        await this.setActiveKeyResult(null);
      }

      if (objectiveId) {
        if (objectiveId !== this.activeObjective?.id) {
          await this.setActiveObjective(firestoreEncode(objectiveId));
        }
        if (!this.activeObjective) {
          this.notFoundState = true;
        }
      }

      if (this.activeObjective && keyResultId) {
        if (keyResultId !== this.activeKeyResult?.id) {
          await this.setActiveKeyResult(firestoreEncode(keyResultId));
        }
        if (!this.activeKeyResult) {
          this.notFoundState = true;
        }
      }
    },

    openObjectiveDrawer(edit) {
      this.drawerEditMode = edit;
      this.showObjectiveDrawer = true;
    },

    closeObjectiveDrawer() {
      this.showObjectiveDrawer = false;
      this.drawerEditMode = false;
    },

    openKeyResultDrawer(edit) {
      this.drawerEditMode = edit;
      this.showObjectiveDrawer = false;
      this.showKeyResultDrawer = true;
    },

    closeKeyResultDrawer() {
      this.showKeyResultDrawer = false;
      this.drawerEditMode = false;
    },

    async objectiveCreated(objective) {
      if (!this.objectivesWithID.length) {
        // `state.objectives` does not seems to be reactive until the first
        // objective is added. This fixes bug where empty state is still
        // shown when adding the first objective.
        await this.setData();
      }

      this.$router.push({ name: 'ObjectiveHome', params: { objectiveId: objective.id } });

      if (this.workbenchObjectives.length) {
        await this.addWorkbenchObjective(objective.id);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.okr-panes {
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
}

.pane {
  @include bp('laptop-up') {
    &.workbench-pane,
    &.objective-pane:not(:last-child) {
      min-width: 36rem;

      max-width: 48rem;
    }
  }

  @media screen and (min-width: 135rem) {
    &.workbench-pane,
    &.objective-pane {
      max-width: 48rem;
    }
    &.key-result-pane {
      min-width: 64rem;
    }
  }

  @media screen and (min-width: 180rem) {
    &.workbench-pane,
    &.objective-pane {
      max-width: 48rem;
    }
    &.key-result-pane {
      min-width: 64rem;
      max-width: 80rem;
    }
  }
}
</style>

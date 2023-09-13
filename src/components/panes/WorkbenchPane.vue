<template>
  <pane-wrapper
    :title="`${$t('workbench.selectedObjectives')} (${workbenchObjectives.length})`"
    class="workbench-pane"
    closable
    @close="close"
  >
    <progress-bar
      v-if="progression >= 0"
      class="workbench-pane__progression"
      :title="$t('workbench.progressionTitle')"
      :progression="progression"
    />

    <div class="workbench-pane__objectives">
      <div v-for="objective in workbenchObjectives" :key="objective.id" class="">
        <okr-link-card
          :route="{ name: 'ObjectiveHome', params: { objectiveId: objective.id } }"
          :title="objective.name"
          :progression="objective.progression"
          :active="activeObjective && objective.id === activeObjective.id"
        />

        <pkt-button
          v-tooltip.bottom="$t('btn.remove')"
          class="workbench-pane__remove-button"
          size="small"
          variant="icon-only"
          icon-name="minus-circle"
          skin="tertiary"
          @onClick="removeObject(objective)"
        />
      </div>
    </div>
  </pane-wrapper>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import { PktButton } from '@oslokommune/punkt-vue2';
import PaneWrapper from '@/components/panes/PaneWrapper.vue';

export default {
  name: 'WorkbenchPane',

  components: {
    PaneWrapper,
    OkrLinkCard: () => import('@/components/OkrLinkCard.vue'),
    ProgressBar: () => import('@/components/ProgressBar.vue'),
    PktButton,
  },

  computed: {
    ...mapState('okrs', ['activeObjective']),
    ...mapGetters('okrs', ['workbenchObjectives']),

    progression() {
      const p = this.workbenchObjectives.map((o) => o.progression);
      const sum = p.reduce((partialSum, a) => partialSum + a, 0);
      return sum / this.workbenchObjectives.length;
    },
  },

  methods: {
    ...mapActions('okrs', ['removeWorkbenchObjective', 'clearWorkbenchObjectives']),

    async removeObject(objective) {
      await this.removeWorkbenchObjective(objective.id);

      // Set next objective as active or unset current if removed.
      if (this.activeObjective && this.activeObjective.id === objective.id) {
        if (this.workbenchObjectives.length) {
          this.$router.replace({
            name: 'ObjectiveHome',
            params: { objectiveId: this.workbenchObjectives[0].id },
          });
        } else {
          this.$router.push({ name: 'ItemHome' });
        }
      }
    },

    async close() {
      await this.clearWorkbenchObjectives();
      if (this.$route.name !== 'ItemHome') {
        this.$router.push({ name: 'ItemHome' });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.workbench-pane {
  &__progression {
    margin-bottom: 1.5rem;
  }

  &__objectives > div {
    position: relative;
    margin-bottom: 1.5rem;
  }

  &__remove-button {
    position: absolute;
    top: -1rem;
    right: -1rem;
    height: 2rem;
    padding: 0 0.25rem;
    color: var(--color-grayscale-40);
    background-color: var(--color-white);
    border-radius: 50%;
  }
}
</style>
<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useOkrsStore } from '@/store/okrs';
import { useActiveObjectiveStore } from '@/store/activeObjective';
import { PktButton } from '@oslokommune/punkt-vue';
import PaneWrapper from '@/components/panes/PaneWrapper.vue';
import ObjectiveLinkCard from '@/components/ObjectiveLinkCard.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import ListTransition from '@/components/generic/transitions/ListTransition.vue';

const router = useRouter();

const okrsStore = useOkrsStore();
const { workbenchObjectives } = storeToRefs(okrsStore);
const { objective: activeObjective } = storeToRefs(useActiveObjectiveStore());
const { removeWorkbenchObjective, clearWorkbenchObjectives } = okrsStore;

const progression = computed(() => {
  const p = workbenchObjectives.value.map((o) => o.progression);
  const sum = p.reduce((partialSum, a) => partialSum + a, 0);
  return sum / workbenchObjectives.value.length;
});

function removeObjective(objectiveId) {
  removeWorkbenchObjective(objectiveId);

  // Set next objective as active or unset current if removed.
  if (activeObjective.value?.id === objectiveId) {
    if (workbenchObjectives.value.length) {
      router.replace({
        name: 'ObjectiveHome',
        params: { objectiveId: workbenchObjectives.value[0].id },
      });
    } else {
      router.push({ name: 'ItemHome' });
    }
  }
}
</script>

<template>
  <PaneWrapper
    :title="`${$t('workbench.selectedObjectives')} (${workbenchObjectives.length})`"
    class="workbench-pane"
    closable
    @close="clearWorkbenchObjectives"
  >
    <div v-if="progression >= 0" class="workbench-pane__progression">
      <h4 class="pkt-txt-16-medium">
        {{ $t('workbench.progressionTitle') }}
      </h4>

      <ProgressBar :progression="progression" />
    </div>

    <ListTransition class="workbench-pane__objectives">
      <div v-for="objective in workbenchObjectives" :key="objective.id">
        <Suspense>
          <ObjectiveLinkCard
            :objective-id="objective.id"
            :active="activeObjective && objective.id === activeObjective.id"
          />
        </Suspense>

        <PktButton
          v-tooltip.bottom="$t('btn.remove')"
          class="workbench-pane__remove-button"
          size="small"
          variant="icon-only"
          icon-name="minus-circle"
          skin="tertiary"
          @on-click="removeObjective(objective.id)"
        />
      </div>
    </ListTransition>
  </PaneWrapper>
</template>

<style lang="scss" scoped>
.workbench-pane {
  &__progression {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 1rem 0;
    padding: 1.5rem;
    background-color: var(--pkt-color-background-subtle);
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
    padding: 0 0.25rem !important;
    color: var(--color-grayscale-40);
    background-color: var(--color-white);
    border-radius: 50%;
  }
}
</style>

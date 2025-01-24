<script setup>
import { computed, ref, watchEffect } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useOkrsStore } from '@/store/okrs';
import { useActiveObjectiveStore } from '@/store/activeObjective';
import { useActiveKeyResultStore } from '@/store/activeKeyResult';
import { PktButton } from '@oslokommune/punkt-vue';
import PaneLayout from '@/components/layout/PaneLayout.vue';
import EmptyPage from '@/components/pages/EmptyPage.vue';
import TimelinePane from '@/components/panes/TimelinePane.vue';
import ObjectivePane from '@/components/panes/ObjectivePane.vue';
import KeyResultPane from '@/components/panes/KeyResultPane.vue';
import WorkbenchPane from '@/components/panes/WorkbenchPane.vue';
import ObjectiveDrawer from '@/components/drawers/ObjectiveDrawer.vue';
import KeyResultDrawer from '@/components/drawers/KeyResultDrawer.vue';
import NotFoundPage from '@/components/pages/NotFoundPage.vue';

const router = useRouter();
const route = useRoute();

const { hasEditRights } = storeToRefs(useAuthStore());
const okrsStore = useOkrsStore();
const { objectives, isLoading, workbenchObjectives } = storeToRefs(okrsStore);
const { addWorkbenchObjective } = okrsStore;
const { objective: activeObjective, isLoading: activeObjectiveIsLoading } = storeToRefs(
  useActiveObjectiveStore()
);
const { keyResult: activeKeyResult, isLoading: activeKeyResultIsLoading } = storeToRefs(
  useActiveKeyResultStore()
);

const showObjectiveDrawer = ref(false);
const drawerEditMode = ref(false);
const showKeyResultDrawer = ref(false);
const notFoundState = ref(false);

const newestObjective = computed(() => {
  if (!objectives.value.length) {
    return null;
  }

  return objectives.value.slice().sort((a, b) => {
    if (a.created && b.created) {
      return a.created.seconds > b.created.seconds ? -1 : 1;
    }
    return 0;
  })[0];
});

watchEffect(() => {
  const { objectiveId, keyResultId } = route.params;

  if (
    (objectiveId && !activeObjectiveIsLoading.value && !activeObjective.value) ||
    (keyResultId && !activeKeyResultIsLoading.value && !activeKeyResult.value)
  ) {
    notFoundState.value = true;
  } else {
    notFoundState.value = false;
  }
});

function openObjectiveDrawer(edit) {
  drawerEditMode.value = edit;
  showObjectiveDrawer.value = true;
}

function openKeyResultDrawer(edit) {
  showObjectiveDrawer.value = false;
  drawerEditMode.value = edit;
  showKeyResultDrawer.value = true;
}

function onObjectiveCreated(objectiveRef) {
  router.push({ name: 'ObjectiveHome', params: { objectiveId: objectiveRef.id } });

  if (workbenchObjectives.value.length) {
    addWorkbenchObjective(objectiveRef.id);
  }
}

function onKeyResultCreated(keyResultRef) {
  if (activeKeyResult.value) {
    router.push({
      name: 'KeyResultHome',
      params: { objectiveId: activeObjective.value.id, keyResultId: keyResultRef.id },
    });
  }
}
</script>

<template>
  <div class="okr-panes">
    <PaneLayout v-if="!notFoundState && (objectives.length || isLoading)">
      <!-- Timeline -->
      <TimelinePane @add-objective="openObjectiveDrawer(false)" />

      <!-- Workbench (objective list) -->
      <WorkbenchPane v-if="workbenchObjectives.length" />

      <!-- Objective -->
      <ObjectivePane
        v-if="activeObjectiveIsLoading || activeObjective"
        @edit-objective="openObjectiveDrawer(true)"
        @add-key-result="openKeyResultDrawer(false)"
      />

      <!-- Key result -->
      <KeyResultPane
        v-if="activeObjective && activeKeyResult"
        @edit-key-result="openKeyResultDrawer(true)"
      />
    </PaneLayout>

    <NotFoundPage
      v-else-if="notFoundState"
      :heading="
        $t(`notFound.${!activeObjective ? 'objectiveHeading' : 'keyResultHeading'}`)
      "
      :body="$t(`notFound.${!activeObjective ? 'objectiveBody' : 'keyResultBody'}`)"
      :back-to="
        !activeObjective
          ? { name: 'ItemHome' }
          : { name: 'ObjectiveHome', params: { objectiveId: activeObjective.id } }
      "
      :back-text="$t('btn.back')"
    />

    <EmptyPage
      v-else-if="!isLoading"
      :heading="$t('empty.noObjectives.heading')"
      :body="$t('empty.noObjectives.body')"
    >
      <div v-if="hasEditRights" data-mode="dark">
        <PktButton
          :text="$t('btn.createObjective')"
          skin="primary"
          variant="icon-left"
          icon-name="plus-sign"
          @on-click="openObjectiveDrawer(false)"
        />
      </div>
    </EmptyPage>

    <ObjectiveDrawer
      v-if="showObjectiveDrawer"
      :objective-id="drawerEditMode ? activeObjective.id : null"
      :newest-objective="newestObjective"
      @create="onObjectiveCreated"
      @add-key-result="openKeyResultDrawer(false)"
      @close="showObjectiveDrawer = false"
    />

    <KeyResultDrawer
      v-if="activeObjective && showKeyResultDrawer"
      :key-result-id="drawerEditMode ? activeKeyResult.id : null"
      @create="onKeyResultCreated"
      @close="showKeyResultDrawer = false"
    />
  </div>
</template>

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

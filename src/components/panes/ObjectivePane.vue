<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { doc, writeBatch } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import metadata from '@/db/common/util/metadata';
import { useAuthStore } from '@/store/auth';
import { useActiveOrganizationStore } from '@/store/activeOrganization';
import { useActiveItemStore } from '@/store/activeItem';
import { useActiveObjectiveStore } from '@/store/activeObjective';
import { PktAlert, PktBreadcrumbs, PktButton } from '@oslokommune/punkt-vue';
import { compareKeyResults } from '@/util/okr';
import ObjectiveDetailsCard from '@/components/ObjectiveDetailsCard.vue';
import PaneWrapper from '@/components/panes/PaneWrapper.vue';
import WidgetObjectiveDetails from '@/components/widgets/WidgetObjectiveDetails.vue';
import WidgetWeights from '@/components/widgets/WidgetWeights.vue';
import EmptyState from '@/components/EmptyState.vue';
import SortableList from '@/components/SortableList.vue';
import KeyResultLinkCard from '@/components/KeyResultLinkCard.vue';
import FadeTransition from '@/components/generic/transitions/FadeTransition.vue';

const { user, hasEditRights } = storeToRefs(useAuthStore());
const { organizationTree } = storeToRefs(useActiveOrganizationStore());
const { item } = storeToRefs(useActiveItemStore());
const {
  objective,
  objectivePromise,
  isLoading: objectiveIsLoading,
  isInheritedObjective,
  hasOwnKeyResult,
  keyResults,
  keyResultsIsLoading,
} = storeToRefs(useActiveObjectiveStore());

const pane = ref(null);
const showLiftWarning = ref(false);
const renderKeyResults = ref(false);
const renderWidgets = ref(false);

const breadcrumbs = computed(() => [
  { text: item.value.name, href: { name: 'ItemHome' } },
  { text: objective.value.name },
]);

watch(
  () => objective.value,
  async (to, from) => {
    if (to?.id !== from?.id) {
      // Reset and scroll to the top of the pane when the currently active
      // objective changes.
      showLiftWarning.value = false;
      renderKeyResults.value = false;
      renderWidgets.value = false;
      await nextTick();
      pane.value.$el.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },
  { immediate: true }
);

watch(
  [objective, keyResults, keyResultsIsLoading],
  async () => {
    // Ensure that the objective is completely resovled
    await objectivePromise.value;

    // Show the "lifted" object warning if the object is inherited and no
    // key results are owned by the currently active item
    showLiftWarning.value =
      isInheritedObjective.value && !keyResultsIsLoading.value && !hasOwnKeyResult.value;
  },
  { deep: true }
);

const orderedKeyResults = computed({
  get() {
    return keyResults.value.map((kr) => kr).sort(compareKeyResults);
  },
  async set(keyResultList) {
    const batch = writeBatch(db);

    keyResultList.forEach((kr, i) => {
      if (kr.order !== i) {
        batch.update(doc(db, kr.path), { order: i, ...metadata.edited() });
      }
    });

    await batch.commit();
  },
});

const isMemberOfChild = computed(() => {
  const { id: parentId } = objective.value.parent;
  const { id: organizationId, children: departments } = organizationTree.value;

  // Check if objective parent is the currently active organization
  // and the current user is a member of any immediate child departments.
  if (parentId === organizationId) {
    return departments.some((department) =>
      department.team.map(({ id }) => id).includes(user.value.id)
    );
  }

  // Check if objective parent is a department and the current user
  // is a member of any immediate child products.
  const department = departments.find((d) => d.id === parentId);

  if (department) {
    return department.children.some((product) =>
      product.team.map(({ id }) => id).includes(user.value.id)
    );
  }

  return false;
});

function keyResultLinkProps(keyResult) {
  return {
    route: {
      name: 'KeyResultHome',
      params: { objectiveId: objective.id, keyResultId: keyResult.id },
    },
    title: keyResult.name,
    progression: keyResult.progression,
    owner: keyResult.parent?.name ? keyResult.parent : null,
    draggable: hasEditRights.value,
  };
}
</script>

<template>
  <PaneWrapper
    ref="pane"
    class="objective-pane"
    closable
    @close="$router.push({ name: 'ItemHome' })"
  >
    <template #title>
      <PktBreadcrumbs
        v-if="objective"
        class="pkt-hide-laptop-up"
        navigation-type="router"
        :breadcrumbs="breadcrumbs"
      />
    </template>

    <h1 class="objective-pane__title pkt-txt-18-medium">
      {{ $t('general.objective') }}
    </h1>

    <PktAlert v-if="objective && objective.archived" skin="warning" compact>
      {{ $t('archived.heading') }}
    </PktAlert>

    <PktAlert v-if="showLiftWarning" skin="warning" compact>
      <i18n-t keypath="objective.movedWarning" tag="p" scope="global">
        <template #activeItem>
          {{ item.name }}
        </template>
        <template #ownerLink>
          <RouterLink
            v-if="objective.parent?.slug"
            :to="{
              name: 'ObjectiveHome',
              params: {
                slug: objective.parent.slug,
                objectiveId: objective.id,
              },
            }"
          >
            {{ objective.parent.name }}
          </RouterLink>
        </template>
      </i18n-t>
    </PktAlert>

    <FadeTransition :duration="100" @after-enter="renderKeyResults = true">
      <ObjectiveDetailsCard
        v-if="!objectiveIsLoading && objective"
        :objective="objective"
        :key-results="keyResults"
        @edit-objective="$emit('edit-objective')"
      />
    </FadeTransition>

    <FadeTransition :duration="100" @after-enter="renderWidgets = true">
      <div v-if="renderKeyResults" class="objective-pane__key-results">
        <div class="objective-pane__key-results-header">
          <h3 class="pkt-txt-16-medium">{{ $t('general.keyResults') }}</h3>
          <PktButton
            v-if="hasEditRights || isMemberOfChild"
            :text="$t('general.keyResult')"
            :aria-label="$t('btn.addKeyResult')"
            skin="primary"
            size="small"
            variant="icon-left"
            icon-name="plus-sign"
            @on-click="$emit('add-key-result')"
          />
        </div>

        <SortableList
          v-if="hasEditRights && keyResults.length"
          v-model="orderedKeyResults"
          class="objective-pane__key-results-list"
          handle=".drag-icon"
        >
          <KeyResultLinkCard
            v-for="keyResult in orderedKeyResults"
            :key="keyResult.id"
            v-bind="keyResultLinkProps(keyResult)"
          />
        </SortableList>

        <div v-else-if="keyResults.length" class="objective-pane__key-results-list">
          <KeyResultLinkCard
            v-for="keyResult in orderedKeyResults"
            :key="keyResult.id"
            v-bind="keyResultLinkProps(keyResult)"
          />
        </div>

        <EmptyState
          v-else
          :heading="$t('empty.noKeyResults.heading')"
          :body="$t('empty.noKeyResults.body')"
          skin="dim"
        />
      </div>
    </FadeTransition>

    <FadeTransition :duration="150">
      <div v-if="objective && renderWidgets" class="objective-pane__widgets">
        <WidgetWeights
          v-if="keyResults.length"
          :objective="objective"
          :key-results="orderedKeyResults"
        />
        <WidgetObjectiveDetails :objective="objective" />
      </div>
    </FadeTransition>
  </PaneWrapper>
</template>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;

.objective-pane {
  background-color: var(--color-gray-light);

  &__key-results {
    margin-top: 3rem;

    &-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    &-list {
      position: relative;

      @include bp('tablet-up') {
        margin: 0 1.5rem 0 2rem;
      }

      & :deep(.key-result-link-card) {
        position: relative;
        margin-top: 1rem;

        @include bp('tablet-up') {
          &::before,
          &::after {
            position: absolute;
            left: -2rem;
            width: 1.875rem;
            border-left: 2px solid var(--color-grayscale-10);
          }

          &::before {
            position: absolute;
            top: 0;
            left: -2rem;
            height: 50%;
            border-bottom: 2px solid var(--color-grayscale-10);
            content: '';
          }
          &:not(:last-child)::after {
            top: 50%;
            height: calc(50% + 1.5rem);
            content: '';
          }
        }
      }

      & :deep(.sortable-drag) {
        &::before,
        &::after {
          border-color: transparent;
        }
      }

      & :deep(.sortable-ghost) {
        background-color: var(--color-grayscale-10);
        border-color: var(--color-grayscale-10);

        & .key-result-link-card__inner * {
          visibility: hidden;
        }
      }
    }
  }

  &__widgets {
    margin-top: 2rem;

    :deep(.widget) {
      padding: 0;
      border: 0;
    }
  }
}

.pkt-breadcrumbs {
  display: flex;

  :deep(.pkt-breadcrumbs--mobile) {
    width: 100%;

    .pkt-breadcrumbs__text {
      white-space: nowrap;
    }
  }
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transition: none;
}
</style>

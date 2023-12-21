<template>
  <pane-wrapper
    ref="pane"
    class="objective-pane"
    closable
    @close="$router.push({ name: 'ItemHome' })"
  >
    <template #title>
      <pkt-breadcrumbs
        class="pkt-hide-laptop-up"
        navigation-type="router"
        :breadcrumbs="breadcrumbs"
      />
    </template>

    <h1 class="objective-pane__title pkt-txt-18-medium">
      {{ $t('general.objective') }}
    </h1>

    <pkt-alert v-if="isGhost" skin="warning">
      <i18n path="objective.movedWarning" tag="p">
        <template #activeItem>
          {{ activeItem.name }}
        </template>
        <template #ownerLink>
          <router-link v-if="activeObjective.parent?.slug" :to="liftedObjectiveRoute">{{
            activeObjective.parent.name
          }}</router-link>
        </template>
      </i18n>
    </pkt-alert>

    <objective-details-card
      :objective="activeObjective"
      :key-results="keyResults"
      @edit-objective="$emit('edit-objective')"
    />

    <div class="objective-pane__key-results">
      <div class="objective-pane__key-results-header">
        <h3 class="pkt-txt-16-medium">{{ $t('general.keyResults') }}</h3>
        <pkt-button
          v-if="hasEditRights || isMemberOfChild"
          :text="$t('general.keyResult')"
          :aria-label="$t('btn.addKeyResult')"
          skin="primary"
          size="small"
          variant="icon-left"
          icon-name="plus-sign"
          @onClick="$emit('add-key-result')"
        />
      </div>

      <div v-if="loadingKeyResults">
        <loading-small />
        {{ $t('general.loading') }}
      </div>

      <draggable
        v-else-if="hasEditRights && keyResults.length"
        v-model="orderedKeyResults"
        class="objective-pane__key-results-list"
        animation="300"
        handle=".drag-icon"
      >
        <transition-group>
          <key-result-link-card
            v-for="keyResult in orderedKeyResults"
            :key="keyResult.id"
            :route="{
              name: 'KeyResultHome',
              params: { objectiveId: activeObjective.id, keyResultId: keyResult.id },
            }"
            :title="keyResult.name"
            :progression="keyResult.progression"
            :owner="keyResult.parent?.name ? keyResult.parent : null"
            :draggable="true"
            :active="activeKeyResult && activeKeyResult.id === keyResult.id"
          />
        </transition-group>
      </draggable>

      <div v-else-if="keyResults.length" class="objective-pane__key-results-list">
        <key-result-link-card
          v-for="keyResult in orderedKeyResults"
          :key="keyResult.id"
          :route="{
            name: 'KeyResultHome',
            params: { objectiveId: activeObjective.id, keyResultId: keyResult.id },
          }"
          :title="keyResult.name"
          :progression="keyResult.progression"
          :owner="keyResult.parent?.name ? keyResult.parent : null"
          :active="activeKeyResult && activeKeyResult.id === keyResult.id"
        />
      </div>

      <empty-state
        v-else
        :heading="$t('empty.noKeyResults.heading')"
        :body="$t('empty.noKeyResults.body')"
      />
    </div>

    <div class="objective-pane__widgets">
      <widget-weights v-if="keyResults.length" :objective="activeObjective" />
      <widget-objective-details />
    </div>
  </pane-wrapper>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { PktAlert, PktBreadcrumbs, PktButton } from '@oslokommune/punkt-vue2';
import draggable from 'vuedraggable';
import { compareKeyResults } from '@/util/okr';
import { db } from '@/config/firebaseConfig';
import KeyResult from '@/db/KeyResult';
import ObjectiveDetailsCard from '@/components/ObjectiveDetailsCard.vue';
import PaneWrapper from '@/components/panes/PaneWrapper.vue';
import LoadingSmall from '@/components/LoadingSmall.vue';
import WidgetObjectiveDetails from '@/components/widgets/WidgetObjectiveDetails.vue';
import WidgetWeights from '@/components/widgets/WidgetWeights.vue';
import EmptyState from '@/components/EmptyState.vue';
import KeyResultLinkCard from '@/components/KeyResultLinkCard.vue';

export default {
  name: 'ObjectivePane',

  components: {
    draggable,
    PaneWrapper,
    EmptyState,
    ObjectiveDetailsCard,
    KeyResultLinkCard,
    LoadingSmall,
    PktAlert,
    PktBreadcrumbs,
    PktButton,
    WidgetWeights,
    WidgetObjectiveDetails,
  },

  data: () => ({
    loadingKeyResults: false,
    keyResults: [],
  }),

  computed: {
    ...mapState(['activeItem', 'user', 'departments', 'products']),
    ...mapState('okrs', ['activeObjective', 'activeKeyResult']),
    ...mapGetters(['hasEditRights']),
    ...mapGetters('okrs', ['objectivesWithID']),

    breadcrumbs() {
      return [
        { text: this.activeItem.name, href: { name: 'ItemHome' } },
        { text: this.activeObjective.name },
      ];
    },

    orderedKeyResults: {
      get() {
        return this.keyResults.map((kr) => kr).sort(compareKeyResults);
      },
      set(keyResults) {
        keyResults.forEach((kr, i) => {
          if (kr.order !== i) {
            KeyResult.update(kr.id, { order: i });
          }
        });
      },
    },

    isMemberOfChild() {
      const { department, organization, id: parentId } = this.activeObjective.parent;

      if (!organization && !department) {
        return this.departments.some(
          (dep) =>
            dep.organization.id === parentId &&
            dep.team.map(({ id }) => id).includes(this.user.id)
        );
      }

      if (organization && !department) {
        return this.products.some(
          (product) =>
            product.department.id === parentId &&
            product.team.map(({ id }) => id).includes(this.user.id)
        );
      }

      return false;
    },

    /**
     * Returns `true` if `this.activeObjective` is to be considered a "ghost"
     * objective.
     */
    isGhost() {
      return !this.objectivesWithID.find((o) => o.id === this.activeObjective.id);
    },

    liftedObjectiveRoute() {
      return {
        name: 'ObjectiveHome',
        params: {
          objectiveId: this.activeObjective.id,
          slug: this.activeObjective.parent.slug,
        },
      };
    },
  },

  watch: {
    activeObjective: {
      immediate: true,
      async handler(objective) {
        this.$nextTick(() => {
          this.$refs.pane.$el.scrollTo({ top: 0, behavior: 'smooth' });
        });
        this.loadingKeyResults = true;
        const objectiveRef = await db.doc(`objectives/${objective.id}`);
        const keyResults = await db
          .collection('keyResults')
          .where('archived', '==', false)
          .where('objective', '==', objectiveRef)
          .orderBy('name');
        await this.$bind('keyResults', keyResults);
        this.loadingKeyResults = false;
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

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

      & .key-result-link-card {
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

      ::v-deep & .sortable-ghost {
        background: var(--color-grayscale-10);
        border-color: var(--color-grayscale-10);

        & .key-result-link-card__inner * {
          color: var(--color-grayscale-10);
          background: var(--color-grayscale-10) !important;
          border-color: var(--color-grayscale-10);
        }
      }
    }
  }

  &__widgets {
    margin-top: 2rem;

    ::v-deep .widget {
      padding: 0;
      border: 0;

      h3 {
        @include get-text('pkt-txt-16');
      }
    }
  }
}

.empty {
  background-color: transparent;
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

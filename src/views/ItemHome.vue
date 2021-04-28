<template>
  <div class="flex-container">
    <div class="main">
      <kpis v-if="kpis.length" :kpis="kpis"></kpis>

      <div class="itemHome">
        <div class="itemHome--header">
          <h2 class="title-2">{{ $t('general.OKRsLong') }}</h2>
          <period-selector />
          <action-bar v-if="tree.length" />
        </div>

        <empty-state
          v-if="!tree.length"
          :icon="'exclamation'"
          :heading="$t('empty.noPeriods.heading')"
          :body="$t('empty.noPeriods.body')"
        >
          <router-link v-if="hasEditRights" class="btn btn--ter" :to="{ name: 'ItemAdminOKRs' }">
            {{ $t('empty.noPeriods.buttonText') }}
          </router-link>
        </empty-state>

        <ul v-if="tree" class="itemHome--tree">
          <li v-for="objective in tree" :key="objective.id" class="itemHome--tree--item">
            <objective-row :objective="objective"></objective-row>
            <ul v-if="objective.keyResults" class="group">
              <li v-for="keyResult in objective.keyResults" :key="keyResult.id" class="keyResultRow">
                <key-result-row :key-result="keyResult"></key-result-row>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>

    <widgets></widgets>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
  name: 'ItemHome',

  components: {
    PeriodSelector: () => import('@/components/Navigation/PeriodSelector.vue'),
    ActionBar: () => import('@/components/ActionBar.vue'),
    Widgets: () => import('@/components/widgets/WidgetsItemHome.vue'),
    Kpis: () => import('@/components/Kpis.vue'),
    ObjectiveRow: () => import('@/components/ObjectiveRow.vue'),
    KeyResultRow: () => import('@/components/KeyResultRow.vue'),
    EmptyState: () => import('@/components/EmptyState.vue'),
  },

  computed: {
    ...mapState(['activeItem', 'objectives', 'keyResults', 'kpis']),
    ...mapGetters(['hasEditRights']),

    tree() {
      return this.objectives.map((objective) => {
        objective.keyResults = this.keyResults.filter((keyRes) => {
          return keyRes.objective === `objectives/${objective.id}`;
        });
        return objective;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

.group {
  margin-bottom: 1rem;
  background: white;
  border-radius: 2px;
  box-shadow: 0 2px 5px rgba(black, 0.1);
}

.keyResultRow {
  border-top: 1px solid $color-grey-100;

  &:first-child {
    border-top: 0;
  }
}

.itemHome {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(3, 1fr);
  grid-column-gap: 0;
  grid-row-gap: 0;
}

.itemHome--header {
  grid-area: 1 / 1 / 3 / 2;
  background: white;
  padding: 1rem;
  margin-bottom: 8rem;
}

.itemHome--tree {
  grid-area: 2 / 1 / 4 / 2;
}

.itemHome--tree--item {
  background: white;
  margin: 0 1rem 1rem 1rem;
  padding: 1rem;
  box-shadow: -2px 1px 5px 2px rgb(147 147 153 / 30%)
}
</style>

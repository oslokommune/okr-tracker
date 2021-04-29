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
          <li v-for="(objective, index) in tree" :key="objective.id" class="itemHome--tree--item">
            <objective-row :objective="objective" :index="++index"></objective-row>
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
.keyResultRow {
  margin-top: 0.2rem;

  &:first-child {
    margin-top: 0;
  }
}

.itemHome {
  display: grid;
  grid-row-gap: 0;
  grid-column-gap: 0;
  grid-template-rows: repeat(2, 1fr);
  grid-template-columns: 1fr;
}

.itemHome--header {
  grid-area: 1 / 1 / 2 / 3;
  margin-bottom: 32rem;
  padding: 1rem;
  background: white;
}

.itemHome--tree {
  grid-area: 1 / 1 / 2 / 3;
  margin-top: 12rem;
}

.itemHome--tree--item {
  margin: 0 1rem 1rem 1rem;
  padding-bottom: 1rem;
  background: white;
  box-shadow: -2px 1px 5px 2px rgb(147 147 153 / 30%);
}
</style>

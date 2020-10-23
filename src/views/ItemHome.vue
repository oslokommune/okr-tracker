<template>
  <div class="item">
    <div class="main">
      <kpis v-if="kpis.length" :kpis="kpis"></kpis>

      <h2 class="title-2">{{ $t('general.OKRs') }}</h2>
      <period-selector></period-selector>
      <action-bar></action-bar>

      <ul v-if="tree">
        <li v-for="objective in tree" :key="objective.id">
          <ObjectiveRow :objective="objective"></ObjectiveRow>
          <ul v-if="objective.keyResults" class="group">
            <li v-for="keyResult in objective.keyResults" :key="keyResult.id" class="keyResultRow">
              <KeyResultRow :key-result="keyResult"></KeyResultRow>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <Widgets class="aside"></Widgets>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  components: {
    PeriodSelector: () => import('@/components/Navigation/PeriodSelector.vue'),
    ActionBar: () => import('@/components/ActionBar.vue'),
    Widgets: () => import('@/components/widgets/WidgetsItemHome.vue'),
    Kpis: () => import('@/components/Kpis.vue'),
    ObjectiveRow: () => import('@/components/ObjectiveRow.vue'),
    KeyResultRow: () => import('@/components/KeyResultRow.vue'),
  },

  computed: {
    ...mapState(['activeItem', 'objectives', 'keyResults', 'kpis']),

    tree() {
      return this.objectives.map(objective => {
        objective.keyResults = this.keyResults.filter(keyRes => {
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

.item {
  display: flex;
  flex-wrap: wrap;
}

.main {
  width: span(12);

  @media screen and (min-width: bp(m)) {
    width: span(9, 0, span(9));
  }

  @media screen and (min-width: bp(l)) {
    width: span(7, 0, span(10));
  }
}

.aside {
  width: span(12);

  @media screen and (min-width: bp(m)) {
    width: span(9, 0, span(9));
  }

  @media screen and (min-width: bp(l)) {
    width: span(3, 0, span(10));
    margin-left: span(0, 1, span(10));
  }

  @media screen and (min-width: bp(xl)) {
    width: span(3, 0, span(10));
  }
}

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
</style>

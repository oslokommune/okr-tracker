<template>
  <div class="container">
    <widgets class="aside--left"></widgets>

    <div class="main">
      <kpis v-if="kpis.length" :kpis="kpis"></kpis>

      <div>
        <div class="itemHome__header">
          <h2 class="title-2">{{ $t('general.OKRsLong') }}</h2>
          <period-selector />
          <content-loader-action-bar v-if="dataLoading"></content-loader-action-bar>
          <action-bar v-else-if="tree.length" />
        </div>

        <content-loader-item v-if="dataLoading"></content-loader-item>

        <empty-state
          v-else-if="!tree.length && !dataLoading"
          :icon="'exclamation'"
          :heading="$t('empty.noPeriods.heading')"
          :body="$t('empty.noPeriods.body')"
        >
          <router-link v-if="hasEditRights" class="btn btn--ter" :to="{ name: 'ItemAdminOKRs' }">
            {{ $t('empty.noPeriods.buttonText') }}
          </router-link>
        </empty-state>

        <ul v-if="tree && !dataLoading" class="itemHome__tree--hover">
          <li v-for="(objective, index) in tree" :key="objective.id" class="itemHome__tree--item">
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

    <widgets class="aside--right"></widgets>
    <widgets class="aside--bottom"></widgets>
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
    ContentLoaderItem: () => import('@/components/ContentLoader/ContentLoaderItem.vue'),
    ContentLoaderActionBar: () => import('@/components/ContentLoader/ContentLoaderActionBar.vue'),
  },

  computed: {
    ...mapState(['activeItem', 'objectives', 'keyResults', 'kpis', 'dataLoading']),
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

.itemHome__header {
  display: block;
  padding: 1rem 1rem 3rem 1rem;
  background: white;
}

.itemHome__tree {
  display: block;
}

.itemHome__tree--hover {
  position: relative;
  bottom: 2rem;
}

.itemHome__tree--item {
  margin: 0 1rem 1rem 1rem;
  padding-bottom: 1rem;
  background: white;
  box-shadow: -2px 1px 5px 2px rgb(147 147 153 / 30%);
}

.aside--left {
  display: none;
  margin-top: 0.5rem;

  @media screen and (min-width: bp(m)) {
    display: block;
    width: span(3);
  }
}

.aside--right {
  width: span(12);
  margin-top: 0.5rem;

  @media screen and (min-width: bp(m)) {
    width: span(3);
  }
}

.aside--bottom {
  width: span(12);
  margin-top: 0.5rem;

  @media screen and (min-width: bp(m)) {
    display: none;
  }
}
</style>

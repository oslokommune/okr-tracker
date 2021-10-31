<template>
  <div class="container">
    <widgets-left class="aside--left"></widgets-left>

    <div class="main">
      <kpis v-if="kpis.length" :kpis="kpis"></kpis>

      <div class="itemHome">
        <div class="itemHome__header">
          <h2 class="title-2">{{ $t('general.OKRsLong') }}</h2>
          <period-selector />
          <content-loader-action-bar
            v-if="dataLoading"
            class="itemHome__header--content-loader"
          ></content-loader-action-bar>
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

    <widgets-right class="aside--right"></widgets-right>
    <widgets-left class="aside--bottom"></widgets-left>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
  name: 'ItemHome',

  components: {
    PeriodSelector: () => import('@/components/Navigation/PeriodSelector.vue'),
    ActionBar: () => import('@/components/ActionBar.vue'),
    WidgetsLeft: () => import('@/components/widgets/WidgetsItemHomeLeft.vue'),
    WidgetsRight: () => import('@/components/widgets/WidgetsItemHomeRight.vue'),
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
        objective.keyResults = this.keyResults.filter((keyRes) => keyRes.objective === `objectives/${objective.id}`);
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
  padding: 1rem 1rem 3rem 1rem;
  background: rgb(255, 255, 255);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 255, 255, 1) 25%,
    rgba(255, 255, 255, 0) 100%
  );
}

.itemHome__header--content-loader {
  margin-bottom: 1.5rem;
}

.itemHome__tree--item,
.group {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  background: white;
  box-shadow: 0 3px 21px rgba(0, 0, 0, 0.03), 0 6.7px 34.2px rgba(0, 0, 0, 0.04), 0 11.7px 43.8px rgba(0, 0, 0, 0.046),
    0 18.5px 55.2px rgba(0, 0, 0, 0.059), 0 26px 80px rgba(0, 0, 0, 0.11);
}

.aside--left {
  display: none;
  margin-top: 0.5rem;
  @media screen and (min-width: bp(m)) {
    display: block;
    width: span(3);
  }
}

.keyResultRow {
  border-top: 1px solid var(--color-grey-100);

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

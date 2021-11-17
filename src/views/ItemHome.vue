<template>
  <div class="container">
    <div class="widgets--left">
      <widgets-left class="aside--left"></widgets-left>
    </div>

    <div class="main">
      <kpis v-if="kpis.length" :kpis="kpis"></kpis>

      <div class="main__item">
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

        <ul v-if="tree && !dataLoading">
          <li v-for="objective in tree" :key="objective.id" class="itemHome__tree--item">
            <objective-row :objective="objective"></objective-row>
            <ul v-if="objective.keyResults">
              <li v-for="keyResult in objective.keyResults" :key="keyResult.id" class="keyResultRow">
                <key-result-row :key-result="keyResult"></key-result-row>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>

    <widgets-right class="aside--right" />

    <widgets-mobile class="aside--bottom" />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import ContentLoaderItem from '@/components/ContentLoader/ContentLoaderItem.vue';
import ContentLoaderActionBar from "@/components/ContentLoader/ContentLoaderActionBar.vue";
import WidgetsMobile from "@/components/widgets/WidgetsMobile.vue";

export default {
  name: 'ItemHome',

  components: {
    WidgetsMobile,
    PeriodSelector: () => import('@/components/Navigation/PeriodSelector.vue'),
    ActionBar: () => import('@/components/ActionBar.vue'),
    WidgetsLeft: () => import('@/components/widgets/WidgetsItemHomeLeft.vue'),
    WidgetsRight: () => import('@/components/widgets/WidgetsItemHomeRight.vue'),
    Kpis: () => import('@/components/Kpis.vue'),
    ObjectiveRow: () => import('@/components/ObjectiveRow.vue'),
    KeyResultRow: () => import('@/components/KeyResultRow.vue'),
    EmptyState: () => import('@/components/EmptyState.vue'),
    ContentLoaderItem,
    ContentLoaderActionBar,
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

.itemHome__tree--item {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  background: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>

<template>
  <div v-if="activeObjective" class="objective">
    <div class="main">
      <div class="objective__heading">
        <div class="objective__heading-text">
          <h1 class="title-1">{{ activeObjective.name }}</h1>
          <p>{{ activeObjective.description }}</p>
        </div>
        <div class="objective__icon fa fa-fw" :class="`fa-${activeObjective.icon}`"></div>
      </div>

      <section class="key-results">
        <h2 class="title-2">{{ $t('general.keyresults') }}</h2>

        <empty-state
          v-if="!keyResults.length"
          :icon="'poop'"
          :heading="$t('empty.noKeyResults.heading')"
          :body="$t('empty.noKeyResults.body')"
        >
          <router-link v-if="hasEditRights" :to="{ name: 'ItemAdminOKRs' }" class="btn btn--ter">{{
            $t('empty.noKeyResults.linkText')
          }}</router-link>
        </empty-state>

        <div class="key-results__list">
          <KeyResultRow
            v-for="keyResult in keyResults"
            :key="keyResult.id"
            :key-result="keyResult"
            :force-expanded="true"
            class="keyResultRow"
          ></KeyResultRow>
        </div>
      </section>
    </div>
    <widgets-objective-home class="aside"></widgets-objective-home>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { db } from '@/config/firebaseConfig';
import routerGuard from '@/router/router-guards/objectiveHome';

export default {
  data: () => ({
    keyResults: [],
  }),

  computed: {
    ...mapState(['activeObjective']),
    ...mapGetters(['hasEditRights']),
  },

  components: {
    KeyResultRow: () => import('@/components/KeyResultRow.vue'),
    WidgetsObjectiveHome: () => import('@/components/widgets/WidgetsObjectiveHome.vue'),
    EmptyState: () => import('@/components/EmptyState.vue'),
  },

  beforeRouteUpdate: routerGuard,

  async beforeRouteLeave(to, from, next) {
    try {
      await this.$store.dispatch('set_active_key_result', null);
      return next();
    } catch (error) {
      console.error(error);
      next(false);
    }
  },

  watch: {
    activeObjective: {
      immediate: true,
      handler(objective) {
        if (!objective) return;

        const ref = db.collection('objectives').doc(objective.id);
        this.$bind(
          'keyResults',
          db.collection('keyResults').where('archived', '==', false).where('objective', '==', ref)
        );
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

.objective {
  display: flex;
  flex-wrap: wrap;
}

.main {
  width: span(12);
  padding-top: 1.5rem;

  @media screen and (min-width: bp(m)) {
    width: span(9, 0, span(9));
  }

  @media screen and (min-width: bp(l)) {
    width: span(7, 0, span(10));
  }

  @media screen and (min-width: bp(xl)) {
    width: span(6, 0, span(10));
  }
}

.key-results {
  margin-top: 2.5rem;
}

.key-results__list {
  margin: 1.5rem 0;
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

.objective__heading {
  display: flex;
}

.objective__heading-text {
  max-width: 46rem;
  margin-right: 2.5rem;
}

.objective__icon {
  display: flex;
  align-items: center;
  align-self: flex-start;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  margin-right: 0.5rem;
  margin-left: auto;
  padding: 0.5rem 1.5rem;
  font-size: 1.15rem;
  text-align: center;
  background: $color-yellow;
  border-radius: 2rem;
}
</style>

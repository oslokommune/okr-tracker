<template>
  <div v-if="activeObjective" class="container">
    <widgets-left class="aside--left"></widgets-left>
    <div class="objective-home">
      <widget-objective-weights widget-id="objectiveHome.weights" />

      <div class="objective">
        <h1 class="title-1">{{ activeObjective.name }}</h1>
        <p>{{ activeObjective.description }}</p>

        <section class="itemHome__tree--item">
          <empty-state
            v-if="!keyRes.length"
            :icon="'poop'"
            :heading="$t('empty.noKeyResults.heading')"
            :body="$t('empty.noKeyResults.body')"
          >
            <router-link v-if="hasEditRights" :to="{ name: 'ItemAdminOKRs' }" class="btn btn--ter">
              {{ $t('empty.noKeyResults.linkText') }}
            </router-link>
          </empty-state>

          <div class="key-results__list">
            <key-result-row
              v-for="keyResult in keyRes"
              :key="keyResult.id"
              :key-result="keyResult"
              :force-expanded="true"
              class="key-results__list--row"
            />
          </div>
        </section>
      </div>
    </div>
    <widgets-objective-home />
    <widgets-left class="aside--bottom"></widgets-left>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import routerGuard from '@/router/router-guards/objectiveHome';

export default {
  name: 'ObjectiveHome',

  components: {
    KeyResultRow: () => import('@/components/KeyResultRow.vue'),
    WidgetsObjectiveHome: () => import('@/components/widgets/WidgetsObjectiveHome.vue'),
    EmptyState: () => import('@/components/EmptyState.vue'),
    WidgetsLeft: () => import('@/components/widgets/WidgetsItemHomeLeft.vue'),
    WidgetObjectiveWeights: () => import('@/components/widgets/WidgetObjectiveWeights.vue'),
  },

  beforeRouteUpdate: routerGuard,

  async beforeRouteLeave(to, from, next) {
    try {
      await this.$store.dispatch('set_active_key_result', null);
      next();
    } catch (error) {
      console.error(error);
      next(false);
    }
  },

  data: () => ({
    keyRes: [],
  }),

  computed: {
    ...mapState(['activeObjective', 'keyResults']),
    ...mapGetters(['hasEditRights']),
  },

  watch: {
    activeObjective: {
      immediate: true,
      handler(objective) {
        if (!objective) return;

        this.keyRes = this.keyResults.filter((keyRes) => {
          return keyRes.objective === `objectives/${objective.id}`;
        });
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.objective-home {
  width: span(12);

  @media screen and (min-width: bp(m)) {
    width: span(6);
    margin-right: span(0, 1);
    margin-left: span(0, 1);  }
}

.objective {
  color: var(--color-text);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 255, 255, 1) 5%,
    rgba(255, 255, 255, 0) 100%
  );
  padding: 1.5rem 1.75rem;
}

.key-results {
  margin-top: 2.5rem;
}

.key-results__list {
  margin: 1.5rem 0;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.key-results__list--row {
  margin-top: 0.2rem;

  &:first-child {
    margin-top: 0;
  }
}

.objective__heading {
  display: flex;
}

.objective__heading-text {
  max-width: 46rem;
  margin-right: 2.5rem;
}

.itemHome__tree--item {
  background: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>

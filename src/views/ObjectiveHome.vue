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
        <h2 class="title-2">{{ $t('general.keyResults') }}</h2>

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
    <widgets-objective-home class="aside" />
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
@import '@/styles/_colors.scss';

.objective {
  display: flex;
  flex-wrap: wrap;
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

.key-results__list--row {
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
  color: var(--color-text-secondary);
  font-size: 1.15rem;
  text-align: center;
  background: var(--color-primary);
  border-radius: 2rem;
}
</style>

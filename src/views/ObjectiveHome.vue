<template>
  <div v-if="activeObjective" class="container">
    <div class="widgets--left">
      <router-link
        class="btn widget__back-button"
        :to="{
          name: 'ItemHome',
          params: { slug: activeObjective.parent.slug },
        }"
      >
        {{ $t('general.back') }}
        <i class="fa fa-chevron-left"></i>
      </router-link>
    </div>

    <div class="main">
      <div class="main__item">
        <h1 class="title-1">{{ activeObjective.name }}</h1>
        <p>{{ activeObjective.description }}</p>

        <section class="itemHome__tree--item">
          <empty-state
            v-if="!keyRes.length"
            :icon="'poop'"
            :heading="$t('empty.noKeyResults.heading')"
            :body="$t('empty.noKeyResults.body')"
          >
            <router-link
              v-if="hasEditRights"
              :to="{ name: 'ItemAdmin', query: { tab: 'okr' } }"
              class="btn btn--ter"
            >
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

    <widgets-right class="aside--right" />
    <widgets-mobile class="aside--bottom" />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import routerGuard from '@/router/router-guards/objectiveHome';
import WidgetsMobile from '@/components/widgets/WidgetsMobile.vue';

export default {
  name: 'ObjectiveHome',

  components: {
    KeyResultRow: () => import('@/components/KeyResultRow.vue'),
    WidgetsRight: () => import('@/components/widgets/WidgetsObjectiveHome.vue'),
    EmptyState: () => import('@/components/EmptyState.vue'),
    WidgetsMobile,
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
        if (!objective) {
          return;
        }

        this.keyRes = this.keyResults.filter(
          (keyRes) => keyRes.objective === `objectives/${objective.id}`
        );
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.key-results {
  margin-top: 2.5rem;
}

.key-results__list {
  margin: 1.5rem 0;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.key-results__list--row {
  margin-top: 4px;

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

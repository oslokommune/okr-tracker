<template>
  <div v-if="activeObjective" class="container">
    <div class="widgets--left">
      <router-link
        class="btn btn--ter btn--icon btn--icon-pri widget__back-button"
        :to="{ name: 'ItemHome', params: { slug: activeObjective.parent.slug } }"
      >
        {{ $t('general.back') }}
        <i class="fas fa-angle-left"></i>
      </router-link>

      <router-link
        v-if="hasEditRights"
        class="btn btn--icon btn--icon-pri aside__link--edit-rights aside__link--edit-rights--left"
        :to="{ name: 'ItemAdminOKRs', query: { type: 'objective', id: activeObjective.id } }"
      >
        {{ $t('objective.change') }}
        <i class="icon fa fa-pen" />
      </router-link>

      <widgets-left class="aside--left"></widgets-left>
    </div>

    <div class="objective-home">
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
    WidgetsLeft: () => import('@/components/widgets/WidgetsItemHomeLeft.vue'),
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
.widgets--left {
  width: span(12);

  @media screen and (min-width: bp(m)) {
    width: span(2);
  }
}

.widget__back-button {
  display: flex;
  justify-content: space-between;
  width: span(12);
  margin-bottom: 0.5rem;
  padding: 2rem 1.5rem;
  color: var(--color-text);
  font-weight: 500;
  text-transform: uppercase;
  background-color: var(--color-white);

  @media screen and (max-width: bp(s)) {
    display: none;
  }
}

.objective-home {
  width: span(12);

  @media screen and (min-width: bp(m)) {
    width: span(8);
    margin-right: span(0, 1);
    margin-left: span(0, 1);
  }
}

.objective {
  padding: 1.5rem 1.75rem;
  color: var(--color-text);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 255, 255, 0) 60%,
    rgba(255, 255, 255, 0) 100%
  );
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

.aside--left {
  display: none;

  @media screen and (min-width: bp(m)) {
    display: block;
    width: span(12);
  }
}
</style>

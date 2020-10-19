<template>
  <div class="objective" v-if="activeObjective">
    <div class="main">
      <h1 class="title-2">{{ activeObjective.name }}</h1>
      <p>{{ activeObjective.description }}</p>

      <section class="key-results">
        <h2 class="title-3">Key results</h2>
        <div class="key-results__list">
          <KeyResultRow
            v-for="keyResult in keyResults"
            :key="keyResult.id"
            :key-result="keyResult"
            :force-expanded="true"
          ></KeyResultRow>
        </div>
      </section>
    </div>
    <widgets-objective-home></widgets-objective-home>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { db } from '@/config/firebaseConfig';
import routerGuard from '@/router/router-guards/objectiveHome';

export default {
  data: () => ({
    keyResults: [],
  }),

  computed: {
    ...mapState(['activeObjective']),
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

  components: {
    KeyResultRow: () => import('@/components/KeyResultRow.vue'),
    WidgetsObjectiveHome: () => import('@/components/widgets/WidgetsObjectiveHome.vue'),
  },
};
</script>

<style lang="scss" scoped>
.objective {
  display: flex;
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

.key-results {
  margin-top: 2.5rem;
}

.key-results__list {
  margin: 1.5rem 0;
  background: white;
  box-shadow: 0 2px 2px rgba(black, 0.06);
}
</style>

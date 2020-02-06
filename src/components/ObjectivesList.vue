<template>
  <section class="section">
    <h2 class="title title-2">Mål for perioden ({{ objectives.length }})</h2>

    <div class="list">
      <div v-if="!objectives.length" class="empty">
        <i class="far fa-exclamation-circle"></i>
        <p>
          <span> Oops! Her finnes det ingen mål. </span>
          <router-link
            v-if="hasEditPermissions"
            :to="{ name: $route.name === 'department' ? 'edit-department-keyres' : 'edit-product-keyres' }"
          >
            Legg til mål og nøkkelresultater
          </router-link>
        </p>
      </div>

      <TheObjective v-for="objective in objectives" :key="objective.id" :objective="objective"></TheObjective>
    </div>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import TheObjective from './Objective/TheObjective.vue';
import { serializeDocument, isTeamMemberOfProduct } from '@/db/db';

export default {
  name: 'ObjectivesList',

  components: {
    TheObjective,
  },

  data: () => ({
    objectives: [],
    unsubscribe: null,
    hasEditPermissions: false,
  }),

  props: {
    document: {
      type: Object,
      required: true,
    },
  },

  computed: {
    ...mapState(['activeQuarter']),
  },

  watch: {
    activeQuarter() {
      if (!this.document) return;
      if (this.unsubscribe) this.unsubscribe();

      this.getObjectives();
    },

    async document() {
      this.hasEditPermissions = await isTeamMemberOfProduct(this.$route.params.slug);
      if (this.unsubscribe) this.unsubscribe();

      this.getObjectives();
    },
  },

  async mounted() {
    this.hasEditPermissions = await isTeamMemberOfProduct(this.$route.params.slug);
    if (this.unsubscribe) this.unsubscribe();
    this.getObjectives();
  },

  beforeDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  },

  methods: {
    getObjectives() {
      if (!this.document) return;

      if (this.unsubscribe) this.unsubscribe();

      this.unsubscribe = this.document.ref
        .collection('objectives')
        .where('archived', '==', false)
        .where('quarter', '==', this.activeQuarter.name)
        .onSnapshot(snapshot => {
          this.objectives = snapshot.docs.map(serializeDocument);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.list {
  margin-top: 2rem;
}

.empty {
  display: flex;
  align-content: center;
  align-items: center;

  .far {
    margin-right: 0.5rem;
    font-size: 2rem;
  }
}
</style>

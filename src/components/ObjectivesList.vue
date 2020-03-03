<template>
  <section class="section">
    <h2 class="title title-2">Mål for perioden ({{ objectives.length }})</h2>

    <div class="list">
      <div v-if="!objectives.length" class="empty">
        <i class="fa fa-fw fa-exclamation-circle"></i>
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
import TheObjective from '@/components/Objective/TheObjective.vue';
import { serializeDocument, isTeamMemberOfProduct } from '@/db/db';
import slugify from '@/util/slugify';

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
    selectedPeriod() {
      return this.$route.query.period;
    },
  },

  watch: {
    selectedPeriod() {
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
    async getObjectives() {
      if (!this.document) return;
      if (this.unsubscribe) this.unsubscribe();

      const period = await this.document.ref
        .collection('periods')
        .get()
        .then(snapshot => snapshot.docs)
        .then(docs => docs.map(serializeDocument))
        .then(docs => docs.find(p => slugify(p.name) === this.selectedPeriod));

      if (!period) {
        this.objectives = [];
        return;
      }

      this.unsubscribe = this.document.ref
        .collection('objectives')
        .where('archived', '==', false)
        .where('period', '==', period.ref)
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

  .fa {
    margin-right: 0.5rem;
    font-size: 2rem;
  }
}
</style>

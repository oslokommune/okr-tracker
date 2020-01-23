<template>
  <section class="section">
    <h2 class="title title-2">Mål</h2>

    <div v-if="loading" class="grid-3">
      <TheObjectiveLoading></TheObjectiveLoading>
      <TheObjectiveLoading></TheObjectiveLoading>
      <TheObjectiveLoading></TheObjectiveLoading>
    </div>

    <div v-if="!loading">
      <TheObjective v-for="objective in objectives" :key="objective.id" :objective="objective"></TheObjective>
    </div>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import TheObjectiveLoading from '@/components/Objective/TheObjectiveLoading.vue';
import TheObjective from '@/components/Objective/TheObjective.vue';
import { serializeDocument } from '../../../util/db';

export default {
  components: {
    TheObjective,
    TheObjectiveLoading,
  },

  data: () => ({
    loading: true,
    objectives: [],
    unsubscribe: null,
  }),

  computed: {
    ...mapState(['activeQuarter', 'product']),
  },

  watch: {
    activeQuarter() {
      if (!this.product) return;
      if (this.unsubscribe) this.unsubscribe();

      this.getObjectives();
    },

    product() {
      if (this.unsubscribe) this.unsubscribe();

      this.getObjectives();
    },
  },

  mounted() {
    if (this.unsubscribe) this.unsubscribe();
    this.getObjectives();
  },

  beforeDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  },

  methods: {
    getObjectives() {
      this.loading = true;
      if (!this.product) return;

      if (this.unsubscribe) this.unsubscribe();

      this.unsubscribe = this.product.ref
        .collection('objectives')
        .where('archived', '==', false)
        .where('quarter', '==', this.activeQuarter.name)
        .onSnapshot(snapshot => {
          this.objectives = snapshot.docs.map(serializeDocument);
          this.loading = false;
        });
    },
  },
};
</script>

<style lang="scss">
// .fade-enter-active {
//   transition: opacity 0.5s;
// }

// .fade-leave-active {
//   transition-duration: 0;
// }

// .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
//   opacity: 0;
// }
</style>

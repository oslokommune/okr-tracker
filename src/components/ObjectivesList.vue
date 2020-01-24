<template>
  <section class="section">
    <h2 class="title title-2">Mål for perioden</h2>

    <div class="list">
      <TheObjective v-for="objective in objectives" :key="objective.id" :objective="objective"></TheObjective>
    </div>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import TheObjective from './Objective/TheObjective.vue';
import { serializeDocument } from '../util/db';

export default {
  name: 'ObjectivesList',

  components: {
    TheObjective,
  },

  data: () => ({
    objectives: [],
    unsubscribe: null,
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

    document() {
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
</style>

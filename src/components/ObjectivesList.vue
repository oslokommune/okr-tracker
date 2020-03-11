<template>
  <section class="section">
    <h2 class="title title-2">{{ $tc('objective.objectiveForPeriod', objectives.length) }}</h2>

    <div class="list">
      <div v-if="!objectives.length" class="empty">
        <i class="fa fa-fw fa-exclamation-circle"></i>
        <p>
          <span>{{ $t(objective.empty) }}</span>
          <router-link
            v-if="hasEditPermissions"
            :to="{ name: $route.name === 'department' ? 'edit-department-keyres' : 'edit-product-keyres' }"
            >{{ $t('objective.addObjectiveAndKeyres') }}</router-link
          >
        </p>
      </div>

      <TheObjective v-for="objective in objectives" :key="objective.id" :objective="objective"></TheObjective>
    </div>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import TheObjective from '@/components/Objective/TheObjective.vue';
import { serializeList, isTeamMemberOfProduct } from '@/db/db';

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
    ...mapState(['activePeriod']),
  },

  watch: {
    activePeriod() {
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

      if (!this.activePeriod) return;

      this.unsubscribe = this.document.ref
        .collection('objectives')
        .where('archived', '==', false)
        .where('period', '==', this.activePeriod.ref)
        .onSnapshot(snapshot => {
          this.objectives = serializeList(snapshot);
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

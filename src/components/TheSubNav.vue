<template>
  <nav class="sub-nav" v-if="activePeriod">
    <div class="container container--sidebar">
      <div class="content--main">
        <router-link
          exact
          :to="{ query: { period: slugify(period.name) } }"
          v-for="period in periods"
          :key="period.name"
          class="sub-nav__element"
          :class="{ 'router-link-active': activePeriod.name === period.name }"
        >
          {{ period.name }}
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapState } from 'vuex';
import slugify from '@/util/slugify';
import { serializeDocument } from '@/db/db';

export default {
  name: 'SubNav',

  data: () => ({
    periods: [],
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

  created() {
    this.getPeriods();
  },

  watch: {
    document() {
      this.getPeriods();
    },
  },

  methods: {
    slugify,
    getPeriods() {
      if (!this.document) return;
      this.document.ref.collection('periods').onSnapshot(snapshot => {
        this.periods = snapshot.docs
          .map(serializeDocument)
          .filter(doc => doc.startDate.toDate() < new Date())
          .sort((a, b) => {
            if (a.startDate.seconds < b.startDate.seconds) return 1;
            if (a.startDate.seconds > b.startDate.seconds) return -1;
            return 0;
          });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.sub-nav__element {
  cursor: pointer;
  user-select: none;
}
</style>

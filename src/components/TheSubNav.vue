<template>
  <nav class="sub-nav">
    <div class="container container--sidebar">
      <div class="content--main">
        <router-link
          exact
          :to="{ query: { period: slugify(quarter.name) } }"
          v-for="quarter in quarters"
          :key="quarter.name"
          class="sub-nav__element"
        >
          {{ quarter.name }}
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import slugify from '@/util/slugify';

export default {
  name: 'SubNav',

  computed: {
    ...mapState(['quarters']),
  },

  methods: {
    ...mapActions(['setQuarter']),
    slugify,
  },
};
</script>

<style lang="scss" scoped>
.sub-nav__element {
  cursor: pointer;
  user-select: none;
}
</style>

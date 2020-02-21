<template>
  <nav class="sub-nav">
    <div class="container container--sidebar">
      <div class="content--main">
        <span
          v-for="quarter in quarters"
          :key="quarter.name"
          class="sub-nav__element"
          :class="{ 'router-link-active': quarter.name === activeQuarter.name }"
          @click="setQuarter(quarter)"
          >{{ quarter.name }}</span
        >
      </div>
    </div>
  </nav>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'SubNav',

  computed: {
    ...mapState(['quarters', 'activeQuarter']),
  },

  methods: {
    ...mapActions(['setQuarter']),
  },
};
</script>

<style lang="scss" scoped>
.sub-nav__element {
  cursor: pointer;
  user-select: none;
}
</style>

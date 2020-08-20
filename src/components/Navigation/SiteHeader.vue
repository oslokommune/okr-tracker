<template>
  <header class="header">
    <div class="container">
      <div class="logo">
        Logo
      </div>
      <div class="item" v-if="activeItem">
        <div class="item__image"></div>
        <h1 class="item__name">
          {{ activeItem.name }}
        </h1>
      </div>
    </div>
  </header>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['activeItem']),
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

.header {
  position: sticky;
  top: 0;
  background: $color-yellow;
}

.container {
  @include container();
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  height: 4rem;

  @media screen and (min-width: bp(m)) {
    flex-direction: row;
  }
}

.logo {
  width: span(4);

  @media screen and (min-width: bp(m)) {
    width: span(3);
  }

  @media screen and (min-width: bp(l)) {
    width: span(2);
  }
}

.item {
  flex-grow: 1;
  margin-left: span(0, 1);
}

.item__name {
  font-weight: 500;
  font-size: 1.6rem;
}
</style>

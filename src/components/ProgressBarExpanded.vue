<template>
  <div class="progression__container">
    <div class="progression__bar" :style="{ width: `${progression * 100}%` }"></div>
  </div>
</template>

<script>
export default {
  props: {
    progression: {
      type: Number,
      default: 0,
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

.progression__container {
  position: relative;
  width: 100%;
  height: 4px;
  margin-right: 1rem;
  background: $color-grey-100;
}

.progression__bar {
  height: 100%;
  background: $color-yellow;
}
</style>

<template>
  <header class="page-header" :class="`page-header--${style}`">
    <div class="container">
      <div class="page-header__container">
        <div class="page-header__name" :class="{ 'page-header__name--left': !showImage }">
          <h1 class="title-1">
            <i v-if="icon" :class="`fa fa-fw fa-${icon}`" aria-hidden></i>
            {{ title }}
          </h1>
        </div>

        <img
          v-if="showImage"
          :src="data.photoURL || '/placeholder-image.svg'"
          :alt="`Profilbilde for ${title}`"
          class="page-header__profile-image"
        />
      </div>
    </div>
  </header>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
  },

  computed: {
    title() {
      return this.data.name || this.data.displayName || 'Laster ...';
    },

    style() {
      return this.$route.matched.reduce((current, next) => {
        return next.meta.headerStyle || current;
      }, '');
    },

    icon() {
      if (this.style === 'admin') return 'dashboard';
      return false;
    },

    showImage() {
      return this.style === 'product' || this.style === 'edit-product' || this.style === 'profile';
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/page-header.scss';
</style>

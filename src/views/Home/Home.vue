<template>
  <div class="home">
    <ProductList class="productList"></ProductList>
  </div>
</template>

<script>
import ProductList from '@/views/Home/components/ProductList.vue';
import i18n from '@/locale/i18n';

export default {
  name: 'Home',

  components: { ProductList },

  metaInfo() {
    return {
      title: ` ${i18n.t('general.project')} | ${i18n.t('general.owner')}`,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '../../styles/_colors';
.home {
  background: $color-bg;
}
</style>

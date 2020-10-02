<template>
  <div class="wrapper">
    <item-admin-general-product v-if="type === 'product'"></item-admin-general-product>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  components: {
    ItemAdminGeneralProduct: () => import('./ItemAdminGeneralProduct'),
  },
  computed: {
    ...mapState(['activeItem']),
    type() {
      const { department, organization } = this.activeItem;
      if (organization && department) return 'product';
      if (organization) return 'department';
      return 'organization';
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

.wrapper {
  padding: 2rem;
  background: white;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba($color-grey-400, 0.3);

  @media screen and (min-width: bp(l)) {
    width: span(7, 0, span(10));
  }

  @media screen and (min-width: bp(xl)) {
    width: span(6, 0, span(10));
  }
}
</style>

<template>
  <widget v-if="children.length" :title="title">
    <div class="list">
      <router-link
        v-for="child in children"
        :key="child.id"
        :to="{ name: 'ItemHome', params: { slug: child.slug } }"
        class="list__link btn btn--ter btn--fw btn--icon"
      >
        <i class="icon fa fa-fw fa-chevron-right" />
        {{ child.name }}
      </router-link>
    </div>
  </widget>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'WidgetChildItems',

  components: {
    Widget: () => import('./WidgetWrapper.vue'),
  },

  data: () => ({
    children: [],
    title: '',
    icon: '',
  }),

  computed: {
    ...mapState(['activeItem', 'departments', 'products']),
  },

  watch: {
    activeItem: {
      immediate: true,
      handler: 'setChildren',
    },
  },

  methods: {
    setChildren({ id }) {
      const childProducts = this.products.filter(({ department }) => department.id === id);
      const childDepartments = this.departments.filter(({ organization }) => organization.id === id);

      if (childProducts.length) {
        this.children = childProducts;
        this.title = this.$t('general.products');
        this.icon = 'cube';
      } else if (childDepartments.length) {
        this.children = childDepartments;
        this.title = this.$t('general.departments');
        this.icon = 'cubes';
      } else {
        this.children = [];
        this.title = '';
        this.icon = '';
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.list {
  display: flex;
  flex-direction: column;
}

.list__link {
  justify-content: flex-start;
  white-space: pre-wrap;
  word-break: break-all;
}

.icon {
  flex-shrink: 0;
}
</style>

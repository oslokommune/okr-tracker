<template>
  <Widget :widget-id="widgetId" v-if="children.length" :title="title" :icon="icon">
    <div class="list">
      <router-link
        v-for="child in children"
        :key="child.id"
        :to="{ name: 'ItemHome', params: { slug: child.slug } }"
        class="list__link btn btn--ter btn--fw btn--icon"
      >
        <span class="icon fa fa-fw fa-chevron-right"></span>
        {{ child.name }}
      </router-link>
    </div>
  </Widget>
</template>

<script>
import { mapState } from 'vuex';

export default {
  data: () => ({
    children: [],
    title: '',
    icon: '',
  }),

  computed: {
    ...mapState(['activeItem', 'departments', 'products']),
  },

  props: {
    widgetId: {
      type: String,
      required: true,
    },
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
        this.title = 'Produkter';
        this.icon = 'cube';
      } else if (childDepartments.length) {
        this.children = childDepartments;
        this.title = 'Produktområder';
        this.icon = 'cubes';
      } else {
        this.children = [];
        this.title = '';
        this.icon = '';
      }
    },
  },

  components: {
    Widget: () => import('./Widget.vue'),
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
}
</style>

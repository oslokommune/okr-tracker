<template>
  <Widget v-if="children.length" :title="title" :icon="icon">
    <ul>
      <li v-for="child in children" :key="child.id">
        <router-link :to="child.slug">
          {{ child.name }}
        </router-link>
      </li>
    </ul>
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

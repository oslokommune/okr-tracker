<template>
  <div class="breadcrumbs">
    <nav class="breadcrumbs__nav">
      <ul class="breadcrumbs__list">
        <li class="breadcrumbs__item" v-for="{ id, route, icon, label } in breadcrumbs" :key="id">
          <router-link v-if="route" class="breadcrumbs__link" :to="route">
            <span class="breadcrumbs__icon fas" :class="`fa-${icon}`"></span>
            <span class="breadcrumbs__label">{{ label }}</span>
          </router-link>
          <span class="breadcrumbs__link" v-else>
            <span class="breadcrumbs__icon fas" :class="`fa-${icon}`"></span>
            <span class="breadcrumbs__label">{{ label }}</span>
          </span>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import * as breadcrumbList from '@/config/breadcrumbs';

export default {
  data: () => ({
    breadcrumbs: [],
  }),

  computed: {
    ...mapState(['activeItem']),
  },

  watch: {
    $route: {
      immediate: true,
      handler({ meta: { breadcrumbs } }) {
        try {
          this.breadcrumbs = breadcrumbs.map(this.getBreadcrumb).flat();
        } catch {
          this.breadcrumbs = [breadcrumbList.home()];
        }
      },
    },
  },

  methods: {
    /**
     * Loops the list of breadcrumb ids from the route object and return the breadcrumbs from
     * breadcrumbs.js
     */
    getBreadcrumb(name) {
      return name === 'item' ? this.getItemBreadcrumbs() : breadcrumbList[name]();
    },

    /**
     * 'Items' may be organizations, departments or products. We must identify what type of item this
     * is by looking at its properties to determine how many parent items need to be included.
     * @returns {Array} - Including potential parent items
     */
    getItemBreadcrumbs() {
      const itemList = [];

      if (this.activeItem.organization) {
        itemList.push(breadcrumbList.organization());
      }
      if (this.activeItem.department) {
        itemList.push(breadcrumbList.department());
      }
      itemList.push(breadcrumbList.product());

      return itemList;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

.breadcrumbs {
  position: sticky;
  top: 4rem;
  z-index: 10;
  margin-bottom: 1rem;
  background: white;
  box-shadow: 0 3px 5px rgba(black, 0.1);
}

.breadcrumbs__nav {
  @include container();
}

.breadcrumbs__list {
  display: flex;
  @media screen and (min-width: bp(m)) {
    margin-left: span(3, 1);
  }

  @media screen and (min-width: bp(l)) {
    margin-left: span(2, 1);
  }
}

.breadcrumbs__item {
  display: none;

  &:nth-of-type(1) {
    display: block;
  }

  @media screen and (min-width: bp(xs)) {
    display: block;
  }
}

.breadcrumbs__link {
  position: relative;
  display: block;
  padding: 0.5rem;
  color: $color-grey-900;
  white-space: nowrap;
  text-decoration: none;

  &::after {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    display: block;
    height: 3px;
    content: '';
  }
}

.breadcrumbs__icon {
  margin-right: 0.25rem;
}
</style>

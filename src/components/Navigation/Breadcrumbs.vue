<template>
  <div class="breadcrumbs">
    <nav class="breadcrumbs__nav">
      <ul class="breadcrumbs__list" :data-count="breadcrumbs.length">
        <li v-for="({ route, icon, label }, i) in breadcrumbs" :key="`breadcrumb_${i}`" class="breadcrumbs__item">
          <router-link v-if="route" :ref="`breadcrumb_${i}`" class="breadcrumbs__link" :to="route">
            <i class="breadcrumbs__icon fas" :class="`fa-${icon}`" />
            <span class="breadcrumbs__label">{{ label }}</span>
          </router-link>
          <span v-else class="breadcrumbs__link">
            <i class="breadcrumbs__icon fas" :class="`fa-${icon}`" />
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
  name: 'Breadcrumbs',

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
      const { organization, department } = this.activeItem;
      const itemList = [breadcrumbList.organization()];

      if (organization) itemList.push(breadcrumbList.department());
      if (department) itemList.push(breadcrumbList.product());

      return itemList;
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/colors';

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
  max-width: none;
  padding: 0.5rem;
  overflow: hidden;
  color: var(--color-text);
  white-space: nowrap;
  text-decoration: none;
  text-overflow: ellipsis;

  &:hover {
    background: rgba(colors.$color-grey-500, 0.1);
  }

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

.breadcrumbs__list {
  @for $c from 1 through 6 {
    &[data-count='#{$c}'] .breadcrumbs__link {
      max-width: #{24 - ($c * 3)}rem;

      @media screen and (min-width: bp(s)) {
        max-width: #{26 - ($c * 3)}rem;
      }

      @media screen and (min-width: bp(m)) {
        max-width: #{28 - ($c * 3)}rem;
      }

      @media screen and (min-width: bp(l)) {
        max-width: #{32 - ($c * 2.5)}rem;
      }
    }
  }
}
</style>

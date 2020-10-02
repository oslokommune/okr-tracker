<template>
  <div class="breadcrumbs">
    <nav class="breadcrumbs__nav">
      <ul class="breadcrumbs__list">
        <li class="breadcrumbs__item" v-for="item in breadcrumbs" :key="item.id">
          <router-link v-if="item.route" class="breadcrumbs__link" :to="item.route">
            <span class="breadcrumbs__icon fas" :class="`fa-${item.icon}`"></span>
            <span class="breadcrumbs__label">{{ item.label }}</span>
          </router-link>
          <span class="breadcrumbs__link" v-else>
            <span class="breadcrumbs__icon fas" :class="`fa-${item.icon}`"></span>
            <span class="breadcrumbs__label">{{ item.label }}</span>
          </span>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  data: () => ({
    breadcrumbs: [],
    home: {
      route: '/',
      label: 'Hjem',
      icon: 'home',
    },
  }),

  computed: {
    ...mapState(['activeItem', 'activeKeyResult']),
  },

  watch: {
    $route: {
      immediate: true,
      handler() {
        const list = [this.home];

        if (this.activeItem) {
          const { organization, department, name, slug } = this.activeItem;

          if (organization) {
            list.push({
              label: organization.name,
              route: `/${organization.slug}`,
              icon: 'industry',
            });
          }

          if (department) {
            list.push({
              label: department.name,
              route: `/${department.slug}`,
              icon: 'cubes',
            });
          }

          /* eslint-disable-next-line */
          const icon = !organization ? 'industry' : !department ? 'cubes' : 'cube';

          list.push({
            label: name,
            route: `/${slug}`,
            icon,
          });
        }

        if (this.activeKeyResult) {
          const { objective, name } = this.activeKeyResult;

          list.push({
            label: objective.name,
            icon: 'trophy',
          });

          list.push({
            label: name,
            icon: 'file-contract',
          });
        }

        this.breadcrumbs = list;
      },
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

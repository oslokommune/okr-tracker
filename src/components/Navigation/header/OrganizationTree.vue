<template>
  <ul v-if="activeOrganization" class="organization-tree">
    <template v-for="org in tree">
      <li
        v-if="org.id === activeOrganization.id"
        :key="org.id"
        class="organization-tree__item organization-tree__item--organization"
      >
        <router-link
          :to="{ name: 'ItemHome', params: { slug: activeOrganization.slug } }"
          :class="[
            'organization-tree__link',
            {
              'organization-tree__link--active':
                activeOrganization.slug === $route.params.slug,
            },
          ]"
          @click.native="$emit('selection')"
        >
          {{ org.name }}
        </router-link>

        <ul>
          <li
            v-for="dept in children"
            :key="dept.id"
            class="organization-tree__item organization-tree__item--department"
          >
            <router-link
              :to="{ name: 'ItemHome', params: { slug: dept.slug } }"
              :class="[
                'organization-tree__link',
                { 'organization-tree__link--active': dept.slug === $route.params.slug },
              ]"
              @click.native="$emit('selection')"
            >
              {{ dept.name }}
            </router-link>

            <ul>
              <li
                v-for="prod in dept.children"
                :key="prod.id"
                class="organization-tree__item organization-tree__item--product"
              >
                <router-link
                  :to="{ name: 'ItemHome', params: { slug: prod.slug } }"
                  :class="[
                    'organization-tree__link',
                    {
                      'organization-tree__link--active': prod.slug === $route.params.slug,
                    },
                  ]"
                  @click.native="$emit('selection')"
                >
                  {{ prod.name }}
                </router-link>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </template>
  </ul>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

export default {
  name: 'OrganizationTree',

  computed: {
    ...mapState(['activeOrganization', 'user']),
    ...mapGetters(['tree']),

    children() {
      return (
        this.tree.find((org) => org.id === this.activeOrganization.id)?.children || []
      );
    },
  },

  watch: {
    tree: {
      immediate: true,
      handler() {
        if (!this.activeOrganization) {
          for (const org of this.tree) {
            if (!!org.team && org.team.find(({ id }) => id === this.user.id)) {
              this.setActiveOrganization(org);
              break;
            }
            for (const dep of org.children) {
              if (!!dep.team && dep.team.find(({ id }) => id === this.user.id)) {
                this.setActiveOrganization(dep.organization);
                break;
              }
              for (const prod of dep.children) {
                if (!!prod.team && prod.team.find(({ id }) => id === this.user.id)) {
                  this.setActiveOrganization(prod.organization);
                  break;
                }
              }
            }
          }
        }
      },
    },
  },

  methods: {
    ...mapActions(['setActiveOrganization']),
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';

.organization-tree {
  margin: 1rem 0 0 1rem;

  &:last-of-type {
    margin-bottom: 0;
  }

  &__item {
    > ul {
      margin-left: 0.5rem;
    }

    &--organization {
      font-weight: 500;
    }

    &--department {
      margin-top: 0.5rem;
      font-weight: 400;
    }

    &--product {
      font-weight: 300;
      font-size: typography.$font-size-1;
    }
  }

  &__link {
    color: var(--color-blue-dark);
    text-decoration: none;

    &--active,
    &:active,
    &:hover {
      color: var(--color-hover);
      text-decoration: underline;
    }
  }
}
</style>

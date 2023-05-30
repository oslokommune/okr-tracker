<template>
  <ul v-if="organization" class="organization-tree">
    <template v-for="org in tree">
      <li
        v-if="org.id === organization.id"
        :key="org.id"
        class="organization-tree__item organization-tree__item--organization"
      >
        <router-link
          :to="{ name: 'ItemHome', params: { slug: organization.slug } }"
          :class="[
            'organization-tree__link',
            {
              'organization-tree__link--active': organization.slug === $route.params.slug,
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
import { mapGetters, mapState } from 'vuex';

export default {
  name: 'OrganizationTree',

  props: {
    orgId: {
      type: String,
      required: false,
      default: null,
    },
  },

  computed: {
    ...mapState(['organizations', 'user']),
    ...mapGetters(['tree']),

    organization() {
      return this.organizations.find((o) => o.id === this.orgId);
    },

    children() {
      return this.tree.find((org) => org.id === this.organization.id)?.children || [];
    },
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

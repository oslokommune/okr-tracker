<template>
  <ul v-if="activeOrganization" class="organization-tree">
    <li class="organization-tree__item organization-tree__item--organization">
      <router-link
        :to="{ name: 'ItemHome', params: { slug: activeOrganization.slug } }"
        class="pkt-btn pkt-btn--tertiary"
        @click.native="$emit('selection')"
      >
        {{ activeOrganization.name }}
      </router-link>

      <ul>
        <li
          v-for="dept in children"
          :key="dept.id"
          class="organization-tree__item organization-tree__item--department"
        >
          <router-link
            :to="{ name: 'ItemHome', params: { slug: dept.slug } }"
            class="pkt-btn pkt-btn--tertiary"
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
                class="pkt-btn pkt-btn--tertiary"
                @click.native="$emit('selection')"
              >
                {{ prod.name }}
              </router-link>
            </li>
          </ul>
        </li>
      </ul>
    </li>
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
  &__item {
    font-size: typography.$font-size-2;

    &--department {
      font-size: typography.$font-size-1;
    }

    &--product {
      font-weight: 400;
      font-size: typography.$font-size-1;

      .pkt-btn {
        font-weight: 400;
      }
    }

    > ul {
      margin-left: 0.5rem;
    }
  }
}
</style>

<template>
  <aside class="site-menu-dropdown">
    <nav class="site-menu-dropdown__body">
      <router-link
        :to="{ name: 'Home' }"
        :class="[
          'site-menu-dropdown__link',
          { 'site-menu-dropdown__link--active': $route.name === 'Home' },
        ]"
        @click.native="handleNavigation"
      >
        {{ $t('general.frontPage') }}
      </router-link>

      <template v-if="user">
        <hr class="pkt-hr" />

        <organization-selector :org-id="orgId" @select="setActiveOrganization" />

        <hr class="pkt-hr" />

        <organization-tree :org-id="orgId" @selection="handleNavigation" />
      </template>
    </nav>

    <div class="site-menu-dropdown__footer pkt-txt-12-medium">
      <img
        alt="Oslo kommune logo"
        src="@oslokommune/punkt-assets/dist/logos/oslologo.svg"
      />
      <span>v{{ appVersion }}</span>
    </div>
  </aside>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import OrganizationSelector from './header/OrganizationSelector.vue';
import OrganizationTree from './header/OrganizationTree.vue';

export default {
  name: 'SiteMenuDropdown',

  components: {
    OrganizationSelector,
    OrganizationTree,
  },

  props: {
    handleNavigation: {
      type: Function,
      required: true,
    },
  },

  data: () => ({
    appVersion: __APP_VERSION__, // eslint-disable-line no-undef
  }),

  computed: {
    ...mapState(['user']),
    ...mapGetters(['tree', 'activeOrganization']),

    defaultOrgId() {
      for (const org of this.tree) {
        if (!!org.team && org.team.find(({ id }) => id === this.user.id)) {
          return org.id;
        }
        for (const dep of org.children) {
          if (!!dep.team && dep.team.find(({ id }) => id === this.user.id)) {
            return dep.organization.id;
          }
          for (const prod of dep.children) {
            if (!!prod.team && prod.team.find(({ id }) => id === this.user.id)) {
              return prod.organization.id;
            }
          }
        }
      }

      return null;
    },

    orgId() {
      return this.activeOrganization?.id || this.defaultOrgId;
    },
  },

  methods: {
    ...mapActions(['setActiveOrganization']),
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

$-dropdown-max-height: calc(100vh - 3.5rem);

.site-menu-dropdown {
  @include get-text('pkt-txt-16-medium');
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100vw;
  height: $-dropdown-max-height;
  padding: 1rem;
  line-height: 2;

  @include bp('phablet-up') {
    width: 25rem;
    height: auto;
    max-height: $-dropdown-max-height;
  }

  ::v-deep .pkt-btn {
    width: 100%;
    font-size: inherit;
  }

  hr.pkt-hr {
    margin: 0.5rem 0;
  }

  &__link {
    padding-left: 1rem;
    color: var(--color-blue-dark);
    text-decoration: none;

    &--active,
    &:active,
    &:hover {
      color: var(--color-hover);
      text-decoration: underline;
    }
  }

  &__body {
    overflow-y: auto;
  }

  &__footer {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 1rem;
    opacity: 0.25;

    img {
      height: 1.5rem;
    }
  }
}
</style>

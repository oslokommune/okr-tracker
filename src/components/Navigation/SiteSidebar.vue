<template>
  <div class="site-menu-dropdown">
    <div class="site-menu-dropdown__body">
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

        <organization-selector />

        <hr class="pkt-hr" />

        <organization-tree @selection="handleNavigation" />
      </template>
    </div>

    <div class="site-menu-dropdown__footer">
      <img
        alt="Oslo kommune logo"
        src="@oslokommune/punkt-assets/dist/logos/oslologo.svg"
      />
      <span>v{{ appVersion }}</span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import OrganizationSelector from './header/OrganizationSelector.vue';
import OrganizationTree from './header/OrganizationTree.vue';

export default {
  name: 'SiteSidebar',

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

    hostOrg() {
      return import.meta.env.VITE_ORGANIZATION;
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';

$-dropdown-max-height: calc(100vh - 3.5rem);

.site-menu-dropdown {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100vw;
  height: $-dropdown-max-height;
  padding: 1rem;
  font-weight: 500;
  font-size: typography.$font-size-2;
  line-height: 2;

  @each $bp, $width in (xs: 80, s: 45, m: 30, l: 25, xl: 20, xxl: 15) {
    @media screen and (min-width: bp(#{$bp})) {
      width: #{$width}vw;
      height: auto;
      max-height: $-dropdown-max-height;
    }
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
    font-size: typography.$font-size-0;
    opacity: 0.25;

    img {
      height: 1.5rem;
    }
  }
}
</style>

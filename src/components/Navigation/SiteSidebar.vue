<template>
  <div class="site-menu">
    <router-link
      :to="{ name: 'Home' }"
      class="pkt-btn pkt-btn--tertiary"
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

    <div class="site-menu__footer">
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

$-dropdown-max-height: calc(100vh - 4.5rem);

.site-menu {
  height: $-dropdown-max-height;
  width: 100vw;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem;

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
    line-height: 1;

    &:not(:active).router-link-active {
      color: var(--btn-hover-txt);
    }
  }

  hr.pkt-hr {
    margin: 0.5rem 0;
  }

  &__footer {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    font-size: typography.$font-size-0;
    opacity: 0.25;
    margin-top: auto;
    padding-top: 1rem;

    img {
      height: 1.5rem;
    }
  }
}
</style>

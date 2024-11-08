<script setup>
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useTrackerStore } from '@/store/tracker';
import { useAuthStore } from '@/store/auth';
import { useActiveOrganizationStore } from '@/store/activeOrganization';
import { NavMenu, NavMenuItem, NavMenuSeparator } from '@/components/Navigation/navbar';
import OrganizationCard from './header/OrganizationCard.vue';

const route = useRoute();

const { version } = storeToRefs(useTrackerStore());
const { user } = storeToRefs(useAuthStore());
const { organization, organizationTree } = storeToRefs(useActiveOrganizationStore());

function getItemRoute(slug) {
  const { name: currentRouteName, query: currentQuery } = route;
  const name = ['ItemMeasurements', 'ItemAbout'].includes(currentRouteName)
    ? currentRouteName
    : 'ItemHome';
  const query = currentQuery?.view ? { view: currentQuery.view } : null;
  return { name, params: { slug }, query };
}
</script>

<template>
  <aside class="site-menu-dropdown">
    <nav class="site-menu-dropdown__body">
      <template v-if="user && organization">
        <OrganizationCard inline />
        <NavMenuSeparator />
      </template>

      <NavMenu vertical>
        <NavMenuItem
          icon="home"
          :text="$t('general.frontPage')"
          :route="{ name: 'Home' }"
        />

        <template v-if="user && organization">
          <NavMenuSeparator />
          <NavMenuItem
            icon="organization"
            :text="organization.name"
            :route="getItemRoute(organization.slug)"
          />
          <template v-if="organizationTree && organizationTree.children.length">
            <template v-for="dept in organizationTree.children" :key="dept.id">
              <NavMenuItem
                icon="district"
                :text="dept.name"
                :route="getItemRoute(dept.slug)"
                class="level-2"
              />
              <template v-if="dept.children.length">
                <NavMenuItem
                  v-for="prod in dept.children"
                  :key="prod.id"
                  icon="house-heart"
                  :text="prod.name"
                  :route="getItemRoute(prod.slug)"
                  class="level-3"
                />
              </template>
            </template>
          </template>
        </template>
      </NavMenu>
    </nav>

    <div class="site-menu-dropdown__footer pkt-txt-12-medium">
      <img
        alt="Oslo kommune logo"
        src="@oslokommune/punkt-assets/dist/logos/oslologo.svg"
      />
      <span>v{{ version }}</span>
    </div>
  </aside>
</template>

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
  line-height: 2;

  @include bp('phablet-up') {
    width: 25rem;
    height: auto;
    max-height: $-dropdown-max-height;
  }

  &__body {
    padding: 1rem;
    overflow-y: auto;
  }

  &__footer {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    padding: 1rem;
    opacity: 0.25;

    img {
      height: 1.5rem;
    }
  }
}

.level-2 {
  margin-left: 0.5rem;
}
.level-3 {
  margin-left: 1rem;
}
</style>

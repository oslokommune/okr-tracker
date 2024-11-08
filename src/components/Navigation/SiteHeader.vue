<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/store/auth';
import { useActiveItemStore } from '@/store/activeItem';
import { useKpisStore } from '@/store/kpis';
import { useOkrsStore } from '@/store/okrs';
import SiteMenuDropdown from '@/components/Navigation/SiteMenuDropdown.vue';
import { NavMenu, NavMenuItem, NavMenuText } from '@/components/Navigation/navbar';
import PeriodSelectorMenu from '@/components/Navigation/toolbar/PeriodSelectorMenu.vue';
import ViewToggle from '@/components/Navigation/toolbar/ViewToggle.vue';
import UserMenuDropdown from '@/components/Navigation/UserMenuDropdown.vue';
import FadeTransition from '@/components/generic/transitions/FadeTransition.vue';

const i18n = useI18n();
const route = useRoute();

const { item, itemType } = storeToRefs(useActiveItemStore());
const { user, hasEditRights } = storeToRefs(useAuthStore());
const { objectives, isLoading: objectivesIsLoading } = storeToRefs(useOkrsStore());
const { kpis, isLoading: kpisIsLoading } = storeToRefs(useKpisStore());

const siteMenuEnabled = computed(() => !['Login', 'RequestAccess'].includes(route.name));

const siteMenuLabel = computed(() => {
  const defaultLabel = i18n.t('general.appName') || 'OKR Tracker';

  if (route.name === 'Help') {
    return `${defaultLabel}: ${i18n.t('general.help')}`;
  }

  if (route.name === 'Api') {
    return `${defaultLabel}: ${i18n.t('general.api')}`;
  }

  if (
    [
      'ItemHome',
      'ItemMeasurements',
      'ItemAbout',
      'ItemIntegrations',
      'KeyResultHome',
      'ObjectiveHome',
    ].includes(route.name) &&
    item.value
  ) {
    return item.value.name;
  }

  return defaultLabel;
});

const itemTabs = computed(() => {
  const items = [
    {
      route: { name: 'ItemHome' },
      label: i18n.t('general.OKRsLong'),
      shortLabel: i18n.t('general.OKRs'),
      active: ['ItemHome', 'ObjectiveHome', 'KeyResultHome'].includes(route.name),
    },
    {
      route: { name: 'ItemMeasurements' },
      label: i18n.t('general.KPIs'),
      active: route.name === 'ItemMeasurements',
    },
    {
      route: { name: 'ItemAbout' },
      label: aboutLabel.value,
      shortLabel: i18n.t('about.about'),
    },
  ];
  if (hasEditRights.value) {
    items.push({
      route: { name: 'ItemIntegrations' },
      icon: 'crane',
      tooltip: i18n.t('general.integrations'),
      pull: 'right',
    });
  }
  return items;
});

const aboutLabel = computed(() => {
  switch (itemType.value) {
    case 'organization':
      return i18n.t('about.aboutOrganization');
    case 'department':
      return i18n.t('about.aboutDepartment');
    case 'product':
      return i18n.t('about.aboutProduct');
    default:
      return i18n.t('about.about');
  }
});

const showToolbar = computed(() => {
  if (['ItemHome', 'ObjectiveHome', 'KeyResultHome'].includes(route.name)) {
    return objectivesIsLoading.value || objectives.value.length > 0;
  }
  if (route.name === 'ItemMeasurements') {
    return kpisIsLoading.value || kpis.value.length > 0;
  }
  return false;
});
</script>

<template>
  <header class="site-navigation">
    <!-- Main navigation -->
    <nav class="nav-bar site-navigation__menubar" role="menubar">
      <!-- Site menu -->
      <NavMenu class="site-menu">
        <NavMenuItem
          v-if="siteMenuEnabled"
          :aria="{ label: siteMenuLabel }"
          dropdown
          class="site-menu__item"
        >
          <template #text>
            <PktIcon class="nav-menu-item__icon" name="bullseye" />
            <span class="pkt-show-tablet-up">{{ siteMenuLabel }}</span>
          </template>
          <template #default>
            <SiteMenuDropdown />
          </template>
        </NavMenuItem>
        <NavMenuText v-else strong>
          <PktIcon class="nav-menu-item__icon" name="bullseye" />
          <span>{{ siteMenuLabel }}</span>
        </NavMenuText>
      </NavMenu>

      <!-- Item tabs -->
      <FadeTransition>
        <NavMenu v-if="item && route.params?.slug" class="item-menu" tabs>
          <NavMenuItem
            v-for="(itemMenuTab, index) in itemTabs"
            :key="`item_tabs_${index}`"
            v-tooltip.bottom="itemMenuTab.tooltip"
            :class="['item-menu__item', `item-menu__item--${itemMenuTab.pull || 'left'}`]"
            :route="itemMenuTab.route"
            :active="itemMenuTab.active"
            :aria="{ label: itemMenuTab.label || itemMenuTab.tooltip }"
          >
            <template #text>
              <PktIcon
                v-if="itemMenuTab.icon"
                class="nav-menu-item__icon"
                :name="itemMenuTab.icon"
              />
              <template v-if="itemMenuTab.label">
                <span class="pkt-show-tablet-big-up">{{ itemMenuTab.label }}</span>
                <span class="pkt-hide-tablet-big-up">
                  {{ itemMenuTab.shortLabel || itemMenuTab.label }}
                </span>
              </template>
            </template>
          </NavMenuItem>
        </NavMenu>
      </FadeTransition>

      <!-- User menu -->
      <FadeTransition>
        <NavMenu v-if="user" class="user-menu">
          <NavMenuItem
            ref="userMenu"
            :aria="{ label: $t('user.myProfile') }"
            icon="user"
            dropdown
          >
            <UserMenuDropdown />
          </NavMenuItem>
        </NavMenu>
      </FadeTransition>
    </nav>

    <!-- Toolbar -->
    <FadeTransition>
      <nav v-if="showToolbar" class="nav-bar site-navigation__toolbar" role="menubar">
        <PeriodSelectorMenu />
        <ViewToggle />
      </nav>
    </FadeTransition>
  </header>
</template>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.site-navigation {
  display: flex;
  flex-direction: column;

  .nav-bar {
    flex-basis: 3.5rem;
  }

  &__menubar {
    .nav-menu + .nav-menu {
      border-left: 1px solid var(--pkt-color-border-gray);
    }
  }

  &__toolbar {
    justify-content: space-between;

    @include bp('phablet-up') {
      @include get-text('pkt-txt-14');
    }
  }
}

.site-menu__item {
  > :deep(.nav-menu-item__inner) {
    font-weight: 500;
  }
}

.item-menu {
  flex: 1;

  &__item--right {
    margin-left: auto;
  }
}

.user-menu {
  margin-left: auto;

  :deep(.nav-menu-item__content) {
    right: 0;
  }
}
</style>

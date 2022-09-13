<template>
  <div class="container">
    <div class="itemAdmin">
      <div class="itemAdmin__tabList">
        <router-link
          v-tooltip.bottom="
            $t('tooltip.navigateToItem', { item: activeItem.name })
          "
          class="itemAdmin__backToItemLink"
          :to="{ name: 'ItemHome', params: { slug: activeItem.slug } }"
          exact
        >
          <i class="tab__icon fa fa-arrow-right" />
          {{ activeItem.name }}
        </router-link>
        <tab-list
          aria-label="Velg periode"
          :tabs="tabs"
          :active-tab="activeTab"
          :set-active-tab="setActiveTab"
          :tab-ids="tabIds"
        />
      </div>
      <tab-panel :active-tab="activeTab" :tab-ids="tabIds">
        <item-admin-general v-if="activeTab === 0" />
        <item-admin-OKRs v-if="activeTab === 1" />
        <item-admin-KPIs v-if="activeTab === 2" />
      </tab-panel>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import TabList from '@/components/TabList.vue';
import TabPanel from '@/components/TabPanel.vue';
import tabIdsHelper from '@/util/tabUtils';
import ItemAdminGeneral from './ItemAdminGeneral.vue';
import ItemAdminOKRs from './ItemAdminOKRs.vue';
import ItemAdminKPIs from './ItemAdminKPIs.vue';

export default {
  name: 'ItemAdmin',

  components: {
    TabList,
    TabPanel,
    ItemAdminGeneral,
    ItemAdminOKRs,
    ItemAdminKPIs,
  },

  data() {
    return {
      activeTab: this.getInitialActiveTab(),
    };
  },

  computed: {
    ...mapState(['activeItem']),
    tabs() {
      return [
        {
          icon: 'cogs',
          tabName: this.$t('general.general'),
          tooltip: null,
        },
        {
          icon: 'chart-pie',
          tabName: this.$t('general.OKRsLong'),
          tooltip: null,
        },
        {
          icon: 'chart-line',
          tabName: this.$t('general.KPIs'),
          tooltip: null,
        },
      ];
    },
    tabIds() {
      return tabIdsHelper('periods');
    },
  },

  methods: {
    getInitialActiveTab() {
      switch (this.$route.query.tab) {
        case 'okr': {
          return 1;
        }
        case 'kpi': {
          return 2;
        }
        default: {
          return 0;
        }
      }
    },
    setActiveTab(tabIndex) {
      switch (tabIndex) {
        case 1: {
          this.$router.push({ query: { tab: 'okr' } });
          break;
        }
        case 2: {
          this.$router.push({ query: { tab: 'kpi' } });
          break;
        }
        default: {
          this.$router.push({ query: {} });
        }
      }
      this.activeTab = tabIndex;
    },
  },
};
</script>

<style lang="scss" scoped>
.itemAdmin {
  width: span(12);

  padding: 0 0 1.5rem 0;

  @media screen and (min-width: bp(s)) {
    padding: 1.5rem 0;
  }

  @media screen and (min-width: bp(m)) {
    margin-right: span(2, 1);
    margin-left: span(2, 1);
  }

  @media screen and (min-width: bp(l)) {
    margin-right: span(0);
    margin-left: span(2, 1);
  }

  @media screen and (min-width: bp(xl)) {
    margin-left: span(3, 1);
  }

  &__tabList {
    @media screen and (min-width: bp(s)) {
      position: relative;
    }

    @media screen and (min-width: bp(l)) {
      width: span(7, span(10));
    }
    @media screen and (min-width: bp(xl)) {
      width: span(6, span(10));
    }
  }

  &__backToItemLink {
    display: block;
    margin-bottom: 0.25rem;
    padding: 0.7rem 1rem;
    color: var(--color-text);
    font-weight: 500;
    text-decoration: none;

    @media screen and (min-width: bp(s)) {
      position: absolute;
      right: 0;
      z-index: 100;
    }
  }
}
</style>

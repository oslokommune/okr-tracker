<template>
  <div class="container">
    <div class="main">
      <tab-list
        aria-label="Velg periode"
        :tabs="tabs"
        :active-tab="activeTab"
        :set-active-tab="setActiveTab"
        :tab-ids="tabIds"
      />
      <tab-panel :active-tab="activeTab" :tab-ids="tabIds">
        <item-admin-general v-if="activeTab === 0" />
        <item-admin-OKRs v-if="activeTab === 1" />
        <item-admin-KPIs v-if="activeTab === 2" />
      </tab-panel>
    </div>
  </div>
</template>

<script>
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
    tabs() {
      return [
        {
          icon: 'cogwheel',
          tabName: this.$t('general.general'),
          tooltip: null,
        },
        {
          icon: 'bullseye',
          tabName: this.$t('general.OKRsLong'),
          tooltip: null,
        },
        {
          icon: 'graph',
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

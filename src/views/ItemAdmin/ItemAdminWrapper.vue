<template>
  <page-layout breakpoint="tablet-big">
    <tab-list
      aria-label="Velg periode"
      :tabs="tabs"
      :active-tab="activeTab"
      :set-active-tab="setActiveTab"
      :tab-ids="tabIds"
    />
    <tab-panel :active-tab="activeTab" :tab-ids="tabIds">
      <item-admin-KPIs v-if="activeTab === 0" />
    </tab-panel>
  </page-layout>
</template>

<script>
import TabList from '@/components/TabList.vue';
import TabPanel from '@/components/TabPanel.vue';
import tabIdsHelper from '@/util/tabUtils';
import ItemAdminKPIs from './ItemAdminKPIs.vue';

export default {
  name: 'ItemAdmin',

  components: {
    TabList,
    TabPanel,
    ItemAdminKPIs,
  },

  data() {
    return {
      activeTab: 0,
    };
  },

  computed: {
    tabs() {
      return [
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
    setActiveTab(tabIndex) {
      this.$router.push({ query: { tab: 'kpi' } }).catch((error) => {
        if (error.name !== 'NavigationDuplicated') {
          throw error;
        }
      });
      this.activeTab = tabIndex;
    },
  },
};
</script>

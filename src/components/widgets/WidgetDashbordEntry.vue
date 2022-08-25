<template>
  <router-link
    v-if="hasDashboardAccess"
    class="widgetDashboardEntry btn"
    :to="{
      name: 'Dashboard',
      params: { slug },
    }"
  >
    <icon-graph />
    {{ $t('general.dashboardEntry') }}
    <icon-chevron-right />
  </router-link>
</template>

<script>
import DashboardAccessCollection from '../../../common/db/DashboardAccessCollection';
import { db } from '@/config/firebaseConfig';
import IconGraph from '@/components/IconGraph.vue';
import IconChevronRight from '@/components/IconChevronRight.vue';

const dashboardAccessCollection = new DashboardAccessCollection(db);

export default {
  name: 'WidgetDashboardEntry',

  components: {
    IconGraph,
    IconChevronRight,
  },

  props: {
    slug: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      hasDashboardAccess: false,
    };
  },

  watch: {
    slug: {
      immediate: true,
      async handler() {
        const { exists } = await dashboardAccessCollection
          .getDocumentRef(this.slug)
          .get();

        this.hasDashboardAccess = exists;
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.widgetDashboardEntry {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 1.5rem;
  background: var(--color-secondary-light);
  color: var(--color-primary);
  font-size: 1.125rem;
  font-weight: 500;

  svg {
    margin-right: 0.5rem;

    &:last-child {
      margin-left: auto;
    }
  }

  &:hover {
    color: var(--color-text-secondary);
    background: var(--color-hover);

    &::v-deep path {
      fill: white;
    }
  }
}
</style>

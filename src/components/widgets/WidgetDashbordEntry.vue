<template>
  <router-link
    v-if="hasDashboardAccess"
    class="widgetDashboardEntry btn"
    :to="{
      name: 'Dashboard',
      params: { slug },
    }"
  >
    Se status
    <i class="fa fa-chevron-right"></i>
  </router-link>
</template>

<script>
import DashboardAccessCollection from '../../../common/db/DashboardAccessCollection';
import { db } from '@/config/firebaseConfig';

const dashboardAccessCollection = new DashboardAccessCollection(db);

export default {
  name: 'WidgetDashboardEntry',

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
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 2rem 1.5rem;
  color: var(--color-text);
  font-weight: 500;
  background-color: var(--color-white);

  &:hover {
    color: var(--color-text-secondary);
    background: var(--color-hover);
  }
}
</style>

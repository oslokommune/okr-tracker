<template>
  <router-link
    v-if="hasEditRights"
    v-tooltip="adminLink.tooltip"
    class="widgetAdminEdit btn"
    :to="adminLink.path"
  >
    <icon-edit class="widgetAdminEdit__actionIcon" />
    {{ adminLink.content }}
    <icon-chevron-right class="widgetAdminEdit__chevronRightIcon" />
  </router-link>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

export default {
  name: 'WidgetAdminEdit',

  components: {
    IconEdit: () => import('@/components/IconEdit.vue'),
    IconChevronRight: () => import('@/components/IconChevronRight.vue'),
  },

  computed: {
    ...mapState(['activePeriod', 'activeItem', 'activeObjective', 'activeKeyResult']),
    ...mapGetters(['hasEditRights']),
    itemHomeAdminLink() {
      return this.getAdminLink();
    },
    objectiveHomeAdminLink() {
      return this.getAdminLink({
        tab: 'okr',
        type: 'objective',
        id: this.activeObjective?.id,
      });
    },
    keyResultHomeAdminLink() {
      return this.getAdminLink({
        tab: 'okr',
        type: 'keyResult',
        id: this.activeKeyResult?.id,
      });
    },
    kpiHomeAdminLink() {
      return this.getAdminLink({
        tab: 'kpi',
      });
    },
    adminLink() {
      switch (this.$route.name) {
        case 'ItemHome':
          return this.itemHomeAdminLink;
        case 'ObjectiveHome':
          return this.objectiveHomeAdminLink;
        case 'KeyResultHome':
          return this.keyResultHomeAdminLink;
        case 'KpiHome':
          return this.kpiHomeAdminLink;
        default:
          return {};
      }
    },
  },

  methods: {
    ...mapActions(['reset_state']),
    getAdminLink(query) {
      return {
        path: {
          name: 'ItemAdmin',
          query,
        },
        content: this.$t('general.admin'),
        tooltip: this.$t('tooltip.editItem'),
      };
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';

.widgetAdminEdit {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 1.5rem 1rem;
  color: var(--color-primary);
  font-weight: 500;
  font-size: 1.125rem;
  white-space: initial;
  background: var(--color-secondary-light);

  &__actionIcon {
    flex-shrink: 0;
    margin-right: 0.5rem;
  }

  &__chevronRightIcon {
    flex-shrink: 0;
    margin-left: auto;
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

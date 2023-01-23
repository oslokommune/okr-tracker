<template>
  <router-link
    v-if="hasEditRights"
    v-tooltip="adminLink.tooltip"
    class="widgetAdminEdit btn"
    :to="adminLink.path"
  >
    <pkt-icon name="edit" />
    <span>
      {{ adminLink.content }}
    </span>
    <pkt-icon name="chevron-right" />
  </router-link>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

export default {
  name: 'WidgetAdminEdit',

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
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 1.5rem 1rem;
  color: var(--color-primary);
  font-weight: 500;
  font-size: 1.125rem;
  white-space: initial;
  background: var(--color-secondary-light);

  > span {
    flex-grow: 1;
  }

  > svg {
    height: 1.5rem;
    margin-right: 0.5rem;
  }

  &:hover {
    color: var(--color-text-secondary);
    background: var(--color-hover);

    > svg {
      --fg-color: var(--color-white);
    }
  }
}
</style>

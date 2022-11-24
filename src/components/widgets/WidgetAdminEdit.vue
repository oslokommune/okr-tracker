<template>
  <router-link
    v-if="hasEditRights"
    class="widgetAdminEdit btn"
    v-tooltip="adminLink.tooltip"
    :to="adminLink.path"
  >
    <icon-edit class="widgetAdminEdit__actionIcon"/>
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
    IconChevronRight: () => import('@/components/IconChevronRight.vue')
  },

  data: () => ({
    disabled: false,
  }),

  computed: {
    ...mapState([
      'activePeriod',
      'activeItem',
      'activeObjective',
      'activeKeyResult',
    ]),
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
        tab: 'kpi' 
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

  watch: {
    activePeriod: {
      immediate: true,
      handler() {
        this.disabled = !this.activePeriod;
      },
    },
  },

  methods: {
    ...mapActions(['reset_state']),
    getAdminLink(query) {
      return {
        path: {
          name: 'ItemAdmin',
          query
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
  background: var(--color-secondary-light);
  white-space: initial;

  &__actionIcon {
    margin-right: 0.5rem;
    flex-shrink: 0;
  }

  &__chevronRightIcon {
    margin-left: auto;
    flex-shrink: 0;
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

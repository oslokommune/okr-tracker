<template>
  <section v-if="hasEditRights" class="widget">
    <header class="widget__header">
      <span class="widget__title">Admin</span>
    </header>
    <ul class="admin__list">
      <li v-for="(link, index) in adminLinks" :key="index">
        <router-link
          v-tooltip="link.tooltip"
          class="admin__link"
          :to="link.path"
        >
          {{ link.content }}
        </router-link>
      </li>
    </ul>
  </section>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

export default {
  name: 'WidgetAdmin',

  data: () => ({
    disabled: false,
  }),

  computed: {
    ...mapState([
      'activePeriod',
      'user',
      'activeItem',
      'activeObjective',
      'activeKeyResult',
    ]),
    ...mapGetters(['hasEditRights']),
    itemHomeAdminLinks() {
      return [
        {
          path: this.getAdminPath(),
          content: this.$t('btn.editItem', {
            item: this.activeItem.name,
          }),
          tooltip: this.$t('tooltip.editItem'),
        },
        {
          path: this.getAdminPath({ tab: 'okr' }),
          content: this.$t('period.add'),
        },
        ...['objective.add', 'keyResultPage.add'].map((content) => ({
          path: this.getAdminPath({
            tab: 'okr',
            type: 'period',
            id: this.activePeriod?.id,
          }),
          content: this.$t(content),
        })),
      ];
    },
    objectiveHomeAdminLinks() {
      return ['objective.change', 'keyResultPage.add'].map((content) => ({
        path: this.getAdminPath({
          tab: 'okr',
          type: 'objective',
          id: this.activeObjective?.id,
        }),
        content: this.$t(content),
      }));
    },
    keyResultHomeAdminLinks() {
      return [
        {
          path: this.getAdminPath({
            tab: 'okr',
            type: 'keyResult',
            id: this.activeKeyResult?.id,
          }),
          content: this.$t('keyResultPage.change'),
        },
      ];
    },
    kpiHomeAdminLinks() {
      return [
        {
          path: this.getAdminPath({ tab: 'kpi' }),
          content: this.$t('kpi.change'),
        },
      ];
    },
    adminLinks() {
      switch (this.$route.name) {
        case 'ItemHome':
          return this.itemHomeAdminLinks;
        case 'ObjectiveHome':
          return this.objectiveHomeAdminLinks;
        case 'KeyResultHome':
          return this.keyResultHomeAdminLinks;
        case 'KpiHome':
          return this.kpiHomeAdminLinks;
        default:
          return [];
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

    getItemId(item, itemType) {
      return item ? { [`${itemType}Id`]: item.id } : {};
    },
    getAdminPath(query) {
      return {
        name: 'ItemAdmin',
        query,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';

.admin__list {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
}

.admin__link {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  color: var(--color-text);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: var(--color-text-secondary);
    background-color: var(--color-hover);
  }
}

.admin__link--btn {
  padding: 0;
  font-size: 100%;
  font-family: inherit;
  background: none;
  border: 0;

  &:hover {
    cursor: pointer;
  }
}

.admin__title {
  padding: 0.2rem;
  color: var(--color-grey-300);
  font-weight: 500;
  font-size: typography.$font-size-2;
  letter-spacing: -0.03rem;
}
</style>

<template>
  <section class="widget">
    <header class="widget__header">
      <span class="widget__title">Admin</span>
    </header>
    <ul class="admin__list">
      <template v-if="hasEditRights">
        <li v-if="$route.name === 'ObjectiveHome'">
          <router-link
            class="admin__link"
            :to="{ name: 'ItemAdminOKRs', query: { type: 'objective', id: activeObjective && activeObjective.id } }"
          >
            {{ $t('objective.change') }}
          </router-link>
        </li>
        <li v-if="$route.name === 'KeyResultHome'">
          <router-link
            class="admin__link"
            :to="{ name: 'ItemAdminOKRs', query: { type: 'keyResult', id: activeKeyResult && activeKeyResult.id } }"
          >
            {{ $t('keyResultPage.change') }}
          </router-link>
        </li>
        <li v-if="$route.name === 'KpiHome'">
          <router-link class="admin__link" :to="{ name: 'ItemAdminKPIs' }">
            {{ $t('kpi.change') }}
          </router-link>
        </li>
        <template v-if="$route.name === 'ItemHome'">
          <li>
            <router-link v-tooltip="$t('tooltip.editItem')" class="admin__link" :to="{ name: 'ItemAdmin' }">
              {{ $t('btn.editItem', { item: activeItem && activeItem.name }) }}
            </router-link>
          </li>
          <li>
            <router-link class="admin__link" :to="{ name: 'ItemAdminOKRs' }">
              {{ $t('period.add') }}
            </router-link>
          </li>
          <li>
            <router-link
              class="admin__link"
              :to="{ name: 'ItemAdminOKRs', query: { type: 'period', id: activePeriod && activePeriod.id } }"
            >
              {{ $t('objective.add') }}
            </router-link>
          </li>
        </template>
        <li v-if="$route.name !== 'KpiHome' && $route.name !== 'KeyResultHome'">
          <router-link
            class="admin__link"
            :to="{
              name: 'ItemAdminOKRs',
              query: {
                type: $route.name === 'ItemHome' ? 'period' : 'objective',
                id:
                  $route.name === 'ItemHome' ? activePeriod && activePeriod.id : activeObjective && activeObjective.id,
              },
            }"
          >
            {{ $t('keyResultPage.add') }}
          </router-link>
        </li>
      </template>
      <li>
        <router-link
          v-tooltip="disabled ? $t('tooltip.emptyPeriod') : $t('tooltip.dashboard')"
          class="admin__link"
          :to="!disabled ? { name: 'Dashboard', params: { slug: activeItem.slug } } : ''"
        >
          <span class="admin__name">{{ $t('general.dashboard') }}</span>
        </router-link>
      </li>
    </ul>
  </section>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import { auth } from '@/config/firebaseConfig';

export default {
  name: 'WidgetAdmin',

  data: () => ({
    disabled: false,
  }),

  computed: {
    ...mapState(['activePeriod', 'user', 'activeItem', 'activeObjective', 'activeKeyResult']),
    ...mapGetters(['hasEditRights']),
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

    async signOut() {
      await auth.signOut();
      await this.reset_state();
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

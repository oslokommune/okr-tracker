<template>
  <widget title="Admin">
    <h4 class="admin__title">{{ activeItem.name }}</h4>
    <ul class="admin_list">
      <li class="admin">
        <router-link
          v-if="hasEditRights"
          v-tooltip="$t('tooltip.editItem')"
          class="admin__link"
          :to="{ name: 'ItemAdmin' }"
          data-cy="edit_object_link"
        >
          {{ $t('btn.editItem', { item: activeItem.name }) }}
        </router-link>
      </li>
      <li class="admin">
        <router-link
          v-tooltip="disabled ? $t('tooltip.emptyPeriod') : $t('tooltip.dashboard')"
          class="admin__link"
          :to="!disabled ? { name: 'Dashboard', params: { slug: activeItem.slug } } : ''"
        >
          <span class="admin__name">{{ $t('general.dashboard') }}</span>
        </router-link>
      </li>
    </ul>

    <h4 class="admin__title">OKR-Tracker</h4>
    <ul class="admin__list">
      <li class="admin">
        <router-link v-if="user.admin" :to="{ name: 'Admin' }" class="admin__link">
          <span class="btn--label">{{ $t('general.admin') }}</span>
        </router-link>
      </li>
      <li class="admin">
        <router-link :to="{ name: 'Help' }" class="admin__link">
          <span class="btn--label">{{ $t('general.help') }}</span>
        </router-link>
      </li>
      <li class="admin">
        <button class="admin__link admin__link--btn" @click="signOut">
          <span class="btn--label">{{ $t('general.signOut') }}</span>
        </button>
      </li>
    </ul>
  </widget>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import { auth } from '@/config/firebaseConfig';

export default {
  name: 'WidgetAdmin',

  components: {
    Widget: () => import('./WidgetWrapper.vue'),
  },

  data: () => ({
    disabled: false,
  }),

  computed: {
    ...mapState(['activePeriod', 'user', 'activeItem']),
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
}

.admin__link {
  display: flex;
  align-items: center;
  color: var(--color-text);
  font-weight: 500;
  text-decoration: none;
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

.admin {
  padding: 0.2rem;

  &:hover {
    background: rgba(var(--color-grey-500-rgb), 0.1);
  }
}

.admin__title {
  margin-top: 1rem;
  padding: 0.2rem;
  color: var(--color-grey-300);
  font-weight: 500;
  font-size: typography.$font-size-2;
  letter-spacing: -0.03rem;
}
</style>

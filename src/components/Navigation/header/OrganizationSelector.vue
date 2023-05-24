<template>
  <div :class="['organization-selector', { 'organization-selector--open': isCollapsed }]">
    <button
      class="pkt-btn pkt-btn--tertiary organization-selector__toggle"
      tabindex="0"
      @click="isCollapsed = !isCollapsed"
    >
      {{ $t('general.orgs') }}
      <pkt-icon :name="isCollapsed ? 'chevron-thin-up' : 'chevron-thin-down'" />
    </button>

    <div v-if="isCollapsed">
      <div
        v-for="org in organizations"
        :key="org.id"
        class="pkt-form-group pkt-form-group--row organization-selector__item"
      >
        <input
          :id="org.id"
          v-model="organizationId"
          type="radio"
          class="pkt-form-check-input pkt-form-check-input--tile"
          name="radio-group"
          :value="org.id"
        />
        <label class="pkt-form-label" :for="org.id">
          {{ org.name }}
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  name: 'OrganizationSelector',

  data: () => ({
    isCollapsed: false,
  }),

  computed: {
    ...mapState(['activeOrganization', 'organizations']),

    organizationId: {
      get() {
        return this.activeOrganization?.id;
      },
      async set(orgId) {
        await this.setActiveOrganization(
          this.organizations.find((org) => org.id === orgId)
        );
      },
    },
  },

  methods: {
    ...mapActions(['setActiveOrganization']),
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';

.organization-selector {
  &__toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;

    svg {
      height: 1.5rem;
    }
  }

  > div {
    padding-bottom: 1rem;
  }

  &__item {
    gap: 0.25rem;
    align-items: center;
    margin: 0.25rem 1.25rem;

    .pkt-form-check-input {
      width: 1rem;
      height: 1rem;
    }

    .pkt-form-label {
      font-size: typography.$font-size-1;
    }
  }

  &:hover,
  &--open {
    background-color: var(--color-gray);
  }
}
</style>

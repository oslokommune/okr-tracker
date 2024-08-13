<template>
  <div :class="['organization-selector', { 'organization-selector--open': isCollapsed }]">
    <pkt-button
      class="organization-selector__toggle"
      tabindex="0"
      skin="tertiary"
      variant="icon-right"
      :icon-name="isCollapsed ? 'chevron-thin-up' : 'chevron-thin-down'"
      @onClick="isCollapsed = !isCollapsed"
    >
      {{ $t('general.orgs') }}
    </pkt-button>

    <div v-if="isCollapsed" class="organization-selector__options">
      <PktRadiobutton
        v-for="org in organizations"
        :id="org.id"
        :key="org.id"
        name="radio-group"
        class="organization-selector__item"
        :label="org.name"
        :value="org.id"
        :checked="org.id === orgId"
        has-tile
        @on-change="$emit('select', org.id)"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { PktButton, PktRadiobutton } from '@oslokommune/punkt-vue';

export default {
  name: 'OrganizationSelector',

  components: {
    PktButton,
    PktRadiobutton,
  },

  props: {
    orgId: {
      type: String,
      required: true,
    },
  },

  data: () => ({
    isCollapsed: false,
  }),

  computed: {
    ...mapState(['organizations']),
  },
};
</script>

<style lang="scss" scoped>
.organization-selector {
  &__toggle {
    justify-content: space-between;
  }

  &__options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  &__item {
    // Shrink radio button tiles somewhat.
    :deep(.pkt-input-check__input-checkbox) {
      width: 1rem;
      height: 1rem;
      margin: 0.75rem 0 0.75rem 0.75rem;
    }
    :deep(.pkt-input-check__input-label) {
      padding: 0.75rem 0.75rem 0.75rem 0;
      line-height: 1rem;
    }
  }

  &:hover,
  &--open {
    background-color: var(--color-gray);
  }
}
</style>

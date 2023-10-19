<template>
  <div :class="['organization-selector', { 'organization-selector--open': isCollapsed }]">
    <pkt-button
      class="organization-selector__toggle"
      tabindex="0"
      skin="tertiary"
      variant="icon-right"
      :icon-name="isCollapsed ? 'chevron-thin-up' : 'chevron-thin-down'"
      @click.native.stop="isCollapsed = !isCollapsed"
    >
      {{ $t('general.orgs') }}
    </pkt-button>

    <div v-if="isCollapsed">
      <div
        v-for="org in organizations"
        :key="org.id"
        class="pkt-form-group pkt-form-group--row organization-selector__item"
      >
        <input
          :id="org.id"
          type="radio"
          class="pkt-form-check-input pkt-form-check-input--tile"
          name="radio-group"
          :value="org.id"
          :checked="org.id === orgId"
          @change="onChange"
        />
        <label class="pkt-form-label pkt-txt-14" :for="org.id">
          {{ org.name }}
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { PktButton } from '@oslokommune/punkt-vue2';

export default {
  name: 'OrganizationSelector',

  components: {
    PktButton,
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

  methods: {
    onChange(e) {
      this.$emit('select', e.target.value);
    },
  },
};
</script>

<style lang="scss" scoped>
.organization-selector {
  &__toggle {
    justify-content: space-between;
  }

  > div {
    padding-bottom: 1rem;
  }

  &__item {
    gap: 0.25rem;
    align-items: center;
    margin: 0.6875rem 1.25rem;

    .pkt-form-check-input {
      width: 1rem;
      height: 1rem;
    }
  }

  &:hover,
  &--open {
    background-color: var(--color-gray);
  }
}
</style>

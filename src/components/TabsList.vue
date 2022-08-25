<template>
  <div
    class="tabsList"
    role="tablist"
    :aria-label="ariaLabel"
    @keydown="updateFocus"
  >
    <button
      :ref="`tabButton-${index}`"
      v-for="(tab, index) in tabs"
      :id="`tabsButton-${index}`"
      :key="`tab--${index}`"
      :class="{
        tabsList__button: true,
        'tabsList__button--isActive': index === activeTab,
      }"
      role="tab"
      :aria-selected="index === activeTab"
      :aria-controls="`tabsPanel-${index}`"
      :tabindex="index === activeTab ? 0 : -1"
      @click="() => setActiveTab(index)"
      v-tooltip.bottom="tab.tooltip"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'TabsList',

  props: {
    ariaLabel: {
      type: String,
      required: true,
    },
    tabs: {
      type: Array,
      required: true,
    },
    activeTab: {
      type: Number,
      required: true,
    },
    setActiveTab: {
      type: Function,
      required: true,
    },
  },

  data() {
    return {
      focusedTab: this.activeTab,
    };
  },

  methods: {
    setTabIndex(tabIndex) {
      const focusedTabRef = this.$refs[`tabButton-${this.focusedTab}`][0];

      focusedTabRef.setAttribute('tabindex', tabIndex);
    },
    updateFocus(e) {
      this.$refs[`tabButton-${this.focusedTab}`][0].setAttribute(
        'tabindex',
        -1
      );

      switch (e.key) {
        case 'ArrowRight': {
          const nextIndex = this.focusedTab + 1;

          this.focusedTab = nextIndex < this.tabs.length ? nextIndex : 0;

          break;
        }
        case 'ArrowLeft': {
          const nextIndex = this.focusedTab - 1;

          this.focusedTab = nextIndex >= 0 ? nextIndex : this.tabs.length - 1;

          break;
        }
        case 'Tab': {
          this.focusedTab = this.activeTab;

          break;
        }
      }

      this.$refs[`tabButton-${this.focusedTab}`][0].setAttribute('tabindex', 0);
      this.$refs[`tabButton-${this.focusedTab}`][0].focus();
    },
  },
};
</script>

<style lang="scss" scoped>
.tabsList {
  &__button {
    margin: 0 0.125rem;
    padding: 0.75rem 0.5rem;
    color: var(--color-grey-500);
    font-weight: 500;
    font-size: var(--font-size-1);
    background: transparent;
    border: none;

    &:hover {
      color: var(--color-text);
      background: var(--color-grey-50);
    }

    &--isActive {
      color: var(--color-text);
      border-bottom: 4px solid var(--color-secondary-light);
    }
  }
}
</style>

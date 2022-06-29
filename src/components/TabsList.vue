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
      :id="`tabsButton-${tab}`"
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
    >
      {{ tab }}
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
    padding: 0.5rem;
    background: transparent;
    border: none;
    color: var(--color-text);
    font-size: var(--font-size-1);
    font-weight: 500;

    &--isActive {
      border-bottom: 4px solid #6fe9ff;
    }
  }
}
</style>

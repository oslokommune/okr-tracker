<template>
  <div
    :class="{ tabList: true }"
    role="tablist"
    :aria-label="ariaLabel"
    @keydown="updateFocus"
  >
    <div
      :class="{
        tabList__container: true,
      }"
    >
      <button
        v-for="(tab, index) in tabs"
        :id="tabIds.tabButton(index)"
        :key="tabIds.tabButton(index)"
        :ref="tabIds.tabButton(index)"
        v-tooltip="{
          boundariesElement: 'body',
          trigger: 'hover',
          placement: 'right',
          ...tab.tooltip,
        }"
        role="tab"
        :class="{
          tabList__button: true,
          'tabList__button--isActive': isActiveTab(index),
        }"
        :aria-selected="isActiveTab(index)"
        :aria-controls="tabIds.tabPanel(index)"
        :tabindex="isActiveTab(index) ? 0 : -1"
        @click="() => setActiveTab(index)"
      >
        <pkt-icon v-if="tab.icon" class="tabList__icon" :name="tab.icon" />
        {{ tab.tabName }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TabList',

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
    tabIds: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      focusedTabIndex: this.activeTab,
    };
  },

  computed: {
    focusedTab() {
      return this.$refs[this.tabIds.tabButton(this.focusedTabIndex)][0];
    },
  },

  methods: {
    isActiveTab(tabIndex) {
      return this.activeTab === tabIndex;
    },
    setTabIndex(tabIndex) {
      const focusedTabRef = this.$refs[`tabButton-${this.focusedTab}`][0];

      focusedTabRef.setAttribute('tabindex', tabIndex);
    },
    updateFocus(e) {
      this.focusedTab.setAttribute('tabindex', -1);

      switch (e.key) {
        case 'ArrowRight': {
          const nextIndex = this.focusedTabIndex + 1;

          this.focusedTabIndex = nextIndex < this.tabs.length ? nextIndex : 0;

          break;
        }
        case 'ArrowLeft': {
          const nextIndex = this.focusedTabIndex - 1;

          this.focusedTabIndex = nextIndex >= 0 ? nextIndex : this.tabs.length - 1;

          break;
        }
        case 'Tab': {
          this.focusedTabIndex = this.activeTab;

          break;
        }
        default:
      }

      this.focusedTab.setAttribute('tabindex', 0);
      this.focusedTab.focus();
    },
  },
};
</script>

<style lang="scss" scoped>
.tabList {
  position: relative;
  margin-bottom: 1.5rem;
  overflow-x: auto;

  &::-webkit-slider-runnable-track {
    background: blue;
  }

  &::-webkit-scrollbar {
    height: 0.375rem;
    transform: translateY(0.625rem);
  }

  &::-webkit-scrollbar-track {
    background: var(--color-grayscale-10);
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--color-grayscale-70);
  }

  &__container {
    display: flex;
    margin-bottom: 0.25rem;
    border-bottom: 0.125rem solid var(--color-primary);
  }

  &__button {
    display: flex;
    align-items: center;
    margin: 0.125rem 0.5rem 0 0;
    padding: 0.7rem 1rem;
    font-weight: 500;
    white-space: nowrap;
    text-decoration: none;
    background-color: var(--color-grayscale-10);
    border: 0;
    cursor: pointer;

    &#{&}--isActive {
      color: var(--color-text-secondary);
      background-color: var(--color-primary);

      .tabList__icon {
        --fg-color: var(--color-white);
      }
    }
  }

  &__icon {
    height: 1rem;
    margin-right: 0.25rem;
  }
}
</style>

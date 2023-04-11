<template>
  <div
    :class="{ tabList: true, 'tabList--isFilled': isFilled }"
    role="tablist"
    :aria-label="ariaLabel"
    @keydown="updateFocus"
  >
    <div
      :class="{
        tabList__container: true,
        'tabList__container--isFilled': isFilled,
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
          'tabList__button--isFilled': isFilled,
          'tabList__button--isOutlined': !isFilled,
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
    isFilled: {
      type: Boolean,
      required: false,
      default: true,
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

  &--isFilled {
    margin-bottom: 1.5rem;
  }

  &__container {
    display: flex;
    margin-bottom: 0.25rem;

    &--isFilled {
      border-bottom: 0.125rem solid var(--color-primary);
    }
  }

  &__button {
    display: flex;
    align-items: center;
    margin: 0.125rem 0.5rem 0 0;
    padding: 0.7rem 1rem;
    color: var(--color-text);
    font-weight: 500;
    white-space: nowrap;

    &--isFilled {
      margin-right: 0.5rem;
      color: var(--color-text);
      text-decoration: none;
      background-color: var(--color-grayscale-10);
      border: 0;
      cursor: pointer;
    }

    &--isFilled#{&}--isActive {
      color: var(--color-text-secondary);
      background-color: var(--color-primary);

      .tabList__icon {
        --fg-color: var(--color-white);
      }
    }

    &--isOutlined {
      color: var(--color-grayscale-50);
      font-size: var(--font-size-1);
      background: transparent;
      border: none;

      &:hover {
        color: var(--color-text);
        background: var(--color-gray-light);
      }
    }

    &--isOutlined#{&}--isActive {
      color: var(--color-text);
      border-bottom: 0.25rem solid var(--color-secondary-light);
    }
  }

  &__icon {
    height: 1rem;
    margin-right: 0.25rem;
  }
}
</style>

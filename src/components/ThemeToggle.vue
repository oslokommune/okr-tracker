<template>
  <button
    class="btn btn--ter btn--icon"
    :class="{ 'btn--icon-pri': header }"
    :aria-label="$t('theme.aria', { current: mode, next: nextThemeMode })"
    @click="handleClick"
  >
    <span class="icon fas fa-palette" />
    {{ $t('theme.toggle', { mode: $t(`theme.colors.${mode}`) }) }}
  </button>
</template>

<script>
import { mapActions } from 'vuex';

const LS_MODE = 'okr-tracker-theme';

export default {
  name: 'ThemeToggle',

  props: {
    header: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  data: () => ({
    mode: 'blue',
  }),

  computed: {
    nextThemeMode() {
      if (this.mode === 'yellow') {
        return 'blue';
      }
      if (this.mode === 'blue') {
        return 'green';
      }
      return 'yellow';
    },
  },

  mounted() {
    if (this.hasInStorage()) {
      this.mode = this.getLocalThemeMode();
      this.setThemeMode();
    } else {
      this.mode = 'blue';
      this.setThemeMode();
    }
  },

  methods: {
    ...mapActions(['setTheme']),

    handleClick() {
      if (this.mode === 'yellow') {
        this.mode = 'blue';
      } else if (this.mode === 'blue') {
        this.mode = 'green';
      } else {
        this.mode = 'yellow';
      }

      this.setThemeMode();
    },

    setThemeMode() {
      this.saveThemeMode(this.mode);
      this.setTheme(this.mode);
      document.body.setAttribute('data-theme', this.mode);
    },

    hasInStorage() {
      const mode = localStorage.getItem(LS_MODE);
      return mode !== null;
    },

    getLocalThemeMode() {
      return localStorage.getItem(LS_MODE);
    },

    saveThemeMode(mode) {
      localStorage.setItem(LS_MODE, mode);
    },
  },
};
</script>

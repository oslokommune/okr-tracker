<template>
  <button
    class="btn btn--ter btn--icon"
    :aria-label="`Current theme is ${mode}, next theme is ${nextThemeMode}`"
    @click="handleClick"
  >
    <span class="icon fas fa-palette" />
    Toggle Theme: {{ mode }}
  </button>
</template>

<script>
const LS_MODE = 'dev-theme-mode';

export default {
  name: 'ThemeToggle',

  data: () => ({
    mode: 'yellow',
  }),

  computed: {
    nextThemeMode() {
      if (this.mode === 'yellow') {
        return 'purple';
      }
      if (this.mode === 'purple') {
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
      this.mode = window && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      this.setThemeMode();
    }
  },

  methods: {
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

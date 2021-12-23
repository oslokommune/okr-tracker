<template>
  <button
    class="btn btn--ter btn--icon btn--icon-pri"
    :aria-label="$t('theme.aria', { current: mode, next: nextThemeMode })"
    @click="handleClick"
  >
    <span>{{ $t('theme.toggle', { mode: $t(`theme.colors.${mode}`) }) }}</span>
  </button>
</template>

<script>
import { mapActions, mapState } from 'vuex';

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
    ...mapState(['theme', 'LS_MODE']),

    nextThemeMode() {
      if (this.theme === 'blue') {
        return 'green';
      }
      return 'blue';
    },
  },

  methods: {
    ...mapActions(['setTheme']),

    handleClick() {
       if (this.theme === 'blue') {
        this.mode = 'green';
      } else {
        this.mode = 'blue';
      }

      this.setThemeMode();
    },

    setThemeMode() {
      this.saveThemeMode(this.mode);
      this.setTheme(this.mode);
      document.body.setAttribute('data-theme', this.mode);
    },

    saveThemeMode(mode) {
      localStorage.setItem(this.LS_MODE, mode);
    },
  },
};
</script>

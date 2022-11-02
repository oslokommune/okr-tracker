<template>
  <div>
    <h2 class="widget__title">{{ $t('theme.header') }}</h2>
    <div v-for="mode in modes" :key="mode.id" class="ods-form-group">
      <input
        type="radio"
        :id="mode.id"
        class="ods-form-radio"
        name="radio-group"
        :checked="theme === mode.id"
        @click="setThemeMode(mode.id)"
      />
      <label class="ods-form-label" :for="mode.id">{{ $t(`theme.colors.${mode.id}`) }}</label>
    </div>
  </div>
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
    selectedMode: 'blue',
    modes: [{ id: 'knowit' }, { id: 'blue' }, { id: 'green' }],
  }),

  computed: {
    ...mapState(['theme', 'LS_MODE']),
  },

  methods: {
    ...mapActions(['setTheme']),

    setThemeMode(mode) {
      this.saveThemeMode(mode);
      this.setTheme(mode);
      document.body.setAttribute('data-theme', mode);
    },

    saveThemeMode(mode) {
      localStorage.setItem(this.LS_MODE, mode);
    },
  },
};
</script>
<style lang="scss" scoped>
  .widget__title {
    padding-bottom: 1rem;
  }
</style>

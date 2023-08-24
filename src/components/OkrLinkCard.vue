<template>
  <router-link v-slot="{ href, navigate, isExactActive }" :to="route" custom>
    <a
      :class="['okr-link-card', { 'okr-link-card--active': isExactActive || active }]"
      :href="href"
      @click="activate($event, navigate)"
    >
      <div class="okr-link-card__title">
        <span>{{ title }}</span>
      </div>

      <progress-bar :progression="progression" />
    </a>
  </router-link>
</template>

<script>
export default {
  name: 'OkrLinkCard',

  components: {
    ProgressBar: () => import('@/components/ProgressBar.vue'),
  },

  props: {
    route: {
      type: Object,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    progression: {
      type: Number,
      required: true,
    },
    active: {
      type: Boolean,
      default: false,
    },
    beforeNavigate: {
      type: Function,
      default: null,
    },
    afterNavigate: {
      type: Function,
      default: null,
    },
  },

  methods: {
    async activate(event, rootHandler) {
      if (this.beforeNavigate) {
        await this.beforeNavigate(event);
      }

      await rootHandler(event);

      if (this.afterNavigate) {
        await this.afterNavigate(event);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.okr-link-card {
  display: flex;
  flex-direction: column;
  min-height: 6.5rem;
  color: var(--color-text);
  text-decoration: none;
  background-color: var(--color-white);
  border: 2px solid var(--color-grayscale-10);
  cursor: pointer;

  &:hover {
    color: var(--color-hover);
  }

  &--active {
    color: var(--color-hover);
    border: 2px solid var(--color-hover);
  }

  &__title {
    display: flex;
    flex-grow: 1;
    align-items: center;
    padding: 0.5rem 1rem 0 1rem;
    @include get-text('pkt-txt-16-medium');
  }
}
</style>

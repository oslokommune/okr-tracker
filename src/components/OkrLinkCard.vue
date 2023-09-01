<template>
  <router-link v-slot="{ href, navigate, isExactActive }" :to="route" custom>
    <a
      :class="[
        'okr-link-card',
        {
          'okr-link-card--active': isExactActive || active,
          'okr-link-card--compact': compact,
        },
      ]"
      :href="href"
      @click="activate($event, navigate)"
    >
      <pkt-tag
        v-if="!compact"
        class="okr-link-card__owner-tag"
        text-style="normal-text"
        skin="yellow"
        size="small"
      >
        {{ activeItem.name }}
      </pkt-tag>

      <span class="okr-link-card__title pkt-txt-14">
        {{ title }}
      </span>

      <progress-bar :progression="progression" :compact="compact" />
    </a>
  </router-link>
</template>

<script>
import { mapState } from 'vuex';
import { PktTag } from '@oslokommune/punkt-vue2';

export default {
  name: 'OkrLinkCard',

  components: {
    ProgressBar: () => import('@/components/ProgressBar.vue'),
    PktTag,
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
    compact: {
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

  computed: {
    ...mapState(['activeItem']),
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
.okr-link-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 6.5rem;
  padding: 1rem;
  color: var(--color-text);
  text-decoration: none;
  background-color: var(--color-white);
  border: 2px solid rgba(42, 40, 89, 0.25); // blue-dark, 25%
  cursor: pointer;

  &:hover {
    color: var(--color-hover);
  }

  &__title {
    text-wrap: balance;
  }

  &--active {
    color: var(--color-hover);
    background-color: var(--color-blue-5);
    border: 2px solid var(--color-hover);
  }
}
</style>

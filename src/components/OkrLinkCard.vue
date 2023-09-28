<template>
  <router-link v-slot="{ href, navigate, isExactActive }" :to="route" custom>
    <a
      :class="[
        'okr-link-card',
        {
          'okr-link-card--active': isExactActive || active,
          'okr-link-card--checked': checked,
          'okr-link-card--compact': compact,
        },
      ]"
      :href="href"
      @click="activate($event, navigate)"
    >
      <div class="okr-link-card__inner">
        <div v-if="!compact" class="okr-link-card__header">
          <input
            v-if="checkable"
            type="checkbox"
            class="pkt-form-check-input"
            :checked="checked"
            @click.stop="$emit('toggle', $event.target.checked)"
          />
          <pkt-tag text-style="normal-text" skin="yellow" size="small">
            {{ activeItem.name }}
          </pkt-tag>
        </div>

        <span class="okr-link-card__title pkt-txt-14">
          {{ title }}
        </span>

        <progress-bar :progression="progression" :compact="compact" />
      </div>
    </a>
  </router-link>
</template>

<script>
import { mapState } from 'vuex';
import { PktTag } from '@oslokommune/punkt-vue2';
import ProgressBar from '@/components/ProgressBar.vue';

export default {
  name: 'OkrLinkCard',

  components: {
    ProgressBar,
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
    checked: {
      type: Boolean,
      default: false,
    },
    checkable: {
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
  display: block;
  color: var(--color-text);
  text-decoration: none;
  background-color: var(--color-white);
  border: 2px solid rgba(42, 40, 89, 0.25); // blue-dark, 25%
  cursor: pointer;

  &:hover {
    color: var(--color-hover);
  }

  &__inner {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    height: 100%;
    padding: 1rem;
  }

  &__header {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    white-space: nowrap;
  }

  &__title {
    text-wrap: balance;
  }

  &--active,
  &--checked {
    color: var(--color-hover);
    border: 2px solid var(--color-hover);
  }
  &--active {
    background-color: var(--color-blue-5);
  }
}
</style>

<template>
  <router-link v-slot="{ href, navigate, isExactActive }" :to="route" custom>
    <a
      :class="[
        'key-result-link-card',
        {
          'key-result-link-card--active': isExactActive || active,
        },
      ]"
      :href="href"
      @click="navigate($event)"
    >
      <div class="key-result-link-card__inner">
        <div class="key-result-link-card__heading">
          <span class="key-result-link-card__title pkt-txt-14">
            {{ title }}
          </span>
        </div>

        <div>
          <progress-bar :progression="progression" compact />
          <item-tag v-if="owner" :item="owner" class="pkt-txt-12-light" />
        </div>
      </div>
    </a>
  </router-link>
</template>

<script>
import ProgressBar from '@/components/ProgressBar.vue';
import ItemTag from '@/components/ItemTag.vue';

export default {
  name: 'KeyResultLinkCard',

  components: {
    ProgressBar,
    ItemTag,
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
    owner: {
      type: Object,
      required: false,
      default: null,
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="scss" scoped>
.key-result-link-card {
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
    gap: 1rem;
    height: 100%;
    padding: 1rem;
  }

  &__title {
    text-wrap: balance;
  }

  &__heading {
    display: flex;
    gap: 0.5rem;
    justify-content: space-between;
  }

  .item-tag {
    display: flex;
    justify-content: end;
  }

  &--active {
    color: var(--color-hover);
    background-color: var(--color-blue-5);
    border: 2px solid var(--color-hover);
  }
}
</style>

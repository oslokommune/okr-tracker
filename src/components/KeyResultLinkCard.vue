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

          <div class="key-result-link-card__tags">
            <div
              v-tooltip="owner"
              :class="[
                'key-result-link-card__tag',
                'pkt-txt-12-bold',
                `key-result-link-card__tag--${contributorTagMode(owner)}`,
              ]"
              :style="{ background: contributorTagColor(owner) }"
            >
              <span>{{ owner[0] }}</span>
            </div>
          </div>
        </div>

        <progress-bar :progression="progression" compact />
      </div>
    </a>
  </router-link>
</template>

<script>
import { contributorTagColor, contributorTagMode } from '@/util/okr';
import ProgressBar from '@/components/ProgressBar.vue';

export default {
  name: 'KeyResultLinkCard',

  components: {
    ProgressBar,
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
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    contributorTagColor,
    contributorTagMode,
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

  &--active {
    color: var(--color-hover);
    background-color: var(--color-blue-5);
    border: 2px solid var(--color-hover);
  }
}

.key-result-link-card__tags {
  display: flex;
  gap: 0.25rem;
}

.key-result-link-card__tag {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
}

.key-result-link-card__tag--light {
  color: rgba(0, 0, 0, 0.6);
}

.key-result-link-card__tag--dark {
  color: var(--color-white);
}
</style>

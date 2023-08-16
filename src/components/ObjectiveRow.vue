<template>
  <component
    :is="isLink ? 'router-link' : 'div'"
    :to="isLink ? { name: 'ObjectiveHome', params: { objectiveId: objective.id } } : null"
    :class="['objective', { 'objective--compact': compact }]"
    @click="isLink ? () => {} : $emit('click', $event)"
  >
    <h3 class="objective__title pkt-txt-18-medium mb-size-8">
      {{ objective.name }}
      <pkt-icon v-if="isLink" class="pkt-link__icon" name="chevron-right" />
    </h3>

    <p v-if="!compact && objective.description" class="mb-size-8">
      {{ objective.description }}
    </p>

    <div class="objective__progress">
      <progress-bar :progression="objective.progression * 100" />
      {{ percent(objective.progression) }}
    </div>
  </component>
</template>

<script>
import { mapState } from 'vuex';
import { format } from 'd3-format';

export default {
  name: 'ObjectiveRow',

  components: {
    ProgressBar: () => import('@/components/ProgressBar.vue'),
  },

  props: {
    objective: {
      type: Object,
      required: true,
    },
    compact: {
      type: Boolean,
      required: false,
      default: false,
    },
    isLink: {
      type: Boolean,
      default: true,
    },
  },

  computed: {
    ...mapState(['user']),
  },

  methods: {
    percent(value) {
      return format('.0%')(value);
    },
  },
};
</script>

<style lang="scss" scoped>
.objective {
  display: block;
  padding: 1.5rem 1.5rem 1.25rem 1.5rem;
  color: var(--color-text);
  text-decoration: none;
  cursor: pointer;

  &--compact {
    &,
    & > * {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  &:hover {
    color: var(--color-hover);
  }

  &__title {
    display: flex;
    gap: 0.25rem;
    align-items: center;
  }

  &__progress {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    font-weight: 500;

    .progress {
      flex: 1 1 auto;
    }
  }
}
</style>

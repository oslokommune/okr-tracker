<template>
  <component
    :is="isLink ? 'router-link' : 'div'"
    :to="isLink ? { name: 'ObjectiveHome', params: { objectiveId: objective.id } } : null"
    class="objective"
    @click="isLink ? () => {} : $emit('click', $event)"
  >
    <h3 class="title-2">
      {{ objective.name }}
    </h3>

    <p v-if="showDescription && objective.description">
      {{ objective.description }}
    </p>
    <div class="objective__progress">
      <progress-bar v-if="showProgress" :progression="objective.progression * 100" />
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
    showDescription: {
      type: Boolean,
      default: false,
    },
    showProgress: {
      type: Boolean,
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
  padding: 1.5rem 1.5rem 1.25rem 1.5rem;
  color: var(--color-text);
  text-decoration: none;
  cursor: pointer;
  &,
  & > * {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .title-2 {
    line-height: 1.25;
  }

  &:hover {
    color: var(--color-hover);

    .title-2 {
      color: inherit;
    }
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

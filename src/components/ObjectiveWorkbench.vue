<template>
  <div class="objective-workbench">
    <div class="objective-workbench__header">
      <span class="pkt-txt-22-medium">
        <template v-if="selectedObjectives.length > 1">
          {{ $t('general.selectedObjectives') }} ({{ selectedObjectives.length }})
        </template>
        <router-link
          v-else
          :to="{
            name: 'ObjectiveHome',
            params: { objectiveId: selectedObjectives[0].id },
          }"
          class="pkt-link mb-size-16"
        >
          {{ selectedObjectives[0].name }}
          <pkt-icon class="pkt-link__icon" name="chevron-right" />
        </router-link>
      </span>

      <pkt-button
        v-tooltip="$t('btn.close')"
        size="small"
        variant="icon-only"
        icon-name="close"
        skin="tertiary"
        @onClick="setSelectedObjective(null)"
      />
    </div>

    <div v-if="selectedObjectives.length > 1" class="objective-workbench__list">
      <div
        v-for="objective in selectedObjectives"
        :key="objective.id"
        class="objective-workbench__list-item"
      >
        <objective-row :objective="objective" :show-description="true" />

        <key-results-list
          v-if="objective.keyResults.length"
          :key-results="objective.keyResults"
        />

        <pkt-button
          v-tooltip.bottom="$t('btn.remove')"
          class="objective-workbench__remove-button"
          size="small"
          variant="icon-only"
          icon-name="minus-circle"
          skin="tertiary"
          @onClick="setSelectedObjective(objective)"
        />
      </div>
    </div>

    <div v-else class="objective-workbench__objective">
      <p v-if="selectedObjectives[0].description" class="mb-size-16">
        {{ selectedObjectives[0].description }}
      </p>

      <div class="objective-workbench__objective-progression mb-size-16">
        <progress-bar
          :is-compact="false"
          :progression="selectedObjectives[0].progression * 100"
        />
        <span class="pkt-txt-20-medium">
          {{ percent(selectedObjectives[0].progression) }}
        </span>
      </div>

      <key-results-list
        v-if="selectedObjectives[0].keyResults.length"
        :key-results="selectedObjectives[0].keyResults"
      />

      <empty-state
        v-else
        :heading="$t('empty.noKeyResults.heading')"
        :body="$t('empty.noKeyResults.body')"
      />
    </div>
  </div>
</template>

<script>
import { format } from 'd3-format';
import { mapActions, mapGetters } from 'vuex';
import { PktButton } from '@oslokommune/punkt-vue2';

export default {
  name: 'ObjectiveWorkbench',

  components: {
    EmptyState: () => import('@/components/EmptyState.vue'),
    KeyResultsList: () => import('@/components/KeyResultsList.vue'),
    ObjectiveRow: () => import('@/components/ObjectiveRow.vue'),
    ProgressBar: () => import('@/components/ProgressBar.vue'),
    PktButton,
  },

  computed: {
    ...mapGetters(['selectedObjectives']),
  },

  methods: {
    ...mapActions(['setSelectedObjective']),

    percent(value) {
      return format('.0%')(value);
    },
  },
};
</script>

<style lang="scss" scoped>
.objective-workbench {
  padding: 1.5rem;

  &__header {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    justify-content: space-between;

    .pkt-link {
      text-decoration: none;
    }
  }

  &__list-item {
    position: relative;
    margin-top: 1.5rem;
    border: 2px solid var(--color-border);
  }

  &__remove-button {
    position: absolute;
    top: -1rem;
    right: -1rem;
    height: 2rem;
    padding: 0 0.25rem;
    color: var(--color-grayscale-40);
    background-color: var(--color-white);
    border-radius: 50%;
  }

  &__objective-progression {
    display: flex;
    gap: 1rem;
    align-items: center;

    .progress {
      flex: 1;
    }
  }
}
</style>

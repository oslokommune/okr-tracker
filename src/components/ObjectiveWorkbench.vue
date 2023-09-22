<template>
  <div class="objective-workbench">
    <header class="objective-workbench__header">
      <h1 class="pkt-txt-22-medium">
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
      </h1>

      <pkt-button
        v-tooltip="$t('btn.close')"
        size="small"
        variant="icon-only"
        icon-name="close"
        skin="tertiary"
        @onClick="setSelectedObjective(null)"
      />
    </header>

    <div
      :class="singular ? 'objective-workbench__objective' : 'objective-workbench__list'"
    >
      <p v-if="singular && selectedObjectives[0].description" class="mb-size-16">
        {{ selectedObjectives[0].description }}
      </p>

      <div
        v-for="objective in selectedObjectives"
        :key="objective.id"
        :class="{
          'objective-workbench__list-item': !singular,
        }"
      >
        <div
          v-if="singular"
          class="objective-workbench__objective-progression mb-size-16"
        >
          <progress-bar :is-compact="false" :progression="objective.progression * 100" />
          <span class="pkt-txt-20-medium">
            {{ percent(objective.progression) }}
          </span>
        </div>
        <objective-row v-else :objective="objective" />

        <key-results-list :objective="objective" :show-empty-state="singular" />

        <pkt-button
          v-if="!singular"
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
  </div>
</template>

<script>
import { format } from 'd3-format';
import { mapActions, mapGetters } from 'vuex';
import { PktButton } from '@oslokommune/punkt-vue2';
import KeyResultsList from '@/components/KeyResultsList.vue';
import ObjectiveRow from '@/components/ObjectiveRow.vue';
import ProgressBar from '@/components/ProgressBar.vue';

export default {
  name: 'ObjectiveWorkbench',

  components: {
    KeyResultsList,
    ObjectiveRow,
    ProgressBar,
    PktButton,
  },

  computed: {
    ...mapGetters(['selectedObjectives']),

    singular() {
      return this.selectedObjectives.length === 1;
    },
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

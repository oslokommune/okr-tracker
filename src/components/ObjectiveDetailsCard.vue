<template>
  <div :class="['objective-details', { 'objective-details--compact': compact }]">
    <div class="objective-details__header">
      <h2>{{ objective.name }}</h2>

      <pkt-button
        v-if="!compact && canEdit"
        v-tooltip="$t('btn.updateObjective')"
        skin="tertiary"
        variant="icon-only"
        size="small"
        icon-name="edit"
        @onClick="$emit('edit-objective')"
      />
    </div>

    <HTML-output
      v-if="objective.description"
      :html="objective.description"
      class="objective-details__description"
    />

    <div class="objective-details__tiles pkt-grid">
      <div class="pkt-cell pkt-cell--span12 pkt-cell--span5-tablet-up">
        <h4>{{ $t('objective.owner') }}</h4>
        <item-tag v-if="objective.parent?.name" :item="objective.parent" />
      </div>

      <div
        v-if="!compact && contributors.length"
        class="pkt-cell pkt-cell--span12 pkt-cell--span7-tablet-up"
      >
        <h4>{{ $t('objective.contributors') }}</h4>
        <item-tag v-for="c in contributors" :key="c.id" :item="c" />
      </div>

      <div
        v-if="period"
        :class="[
          'pkt-cell',
          'pkt-cell--span12',
          { 'pkt-cell--span7-tablet-up': compact },
        ]"
      >
        <h4>{{ $t('objective.period') }}</h4>
        <span>{{ periodDates(period) }}</span>
      </div>

      <div v-if="!compact" class="pkt-cell pkt-cell--span12">
        <h4 class="mb-size-32">{{ $t('objective.progressionTitle') }}</h4>
        <progress-bar
          :progression="objective.progression"
          :secondary-progression="periodProgression"
          :secondary-value-label="$t('general.today')"
          :show-min-max-indicators="true"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { startOfDay } from 'date-fns';
import { PktButton } from '@oslokommune/punkt-vue2';
import { periodDates, uniqueBy } from '@/util';
import i18n from '@/locale/i18n';
import ItemTag from '@/components/ItemTag.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import HTMLOutput from '@/components/HTMLOutput.vue';

export default {
  name: 'ObjectiveDetailsCard',

  components: {
    HTMLOutput,
    PktButton,
    ItemTag,
    ProgressBar,
  },

  props: {
    objective: {
      type: Object,
      required: true,
    },
    keyResults: {
      type: Array,
      required: false,
      default: () => [],
    },
    compact: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  computed: {
    ...mapState(['activeItem', 'user']),
    ...mapGetters(['isAdminOfCurrentOrganization']),

    isMemberOfObjectiveParent() {
      return this.objective.parent.team?.includes(`users/${this.user.id}`);
    },

    canEdit() {
      return (
        this.user.superAdmin ||
        this.isAdminOfCurrentOrganization ||
        this.isMemberOfObjectiveParent
      );
    },

    period() {
      if (this.objective.startDate && this.objective.endDate) {
        return {
          startDate: this.objective.startDate.toDate(),
          endDate: this.objective.endDate.toDate(),
        };
      }

      if (this.objective.period.startDate && this.objective.period.endDate) {
        return {
          startDate: this.objective.period.startDate.toDate(),
          endDate: this.objective.period.endDate.toDate(),
        };
      }

      return null;
    },

    periodProgression() {
      if (!this.period) {
        return null;
      }

      const start = this.period.startDate.getTime();
      const end = this.period.endDate.getTime();
      const now = startOfDay(new Date()).getTime();

      if (now < start || now > end) {
        return null;
      }

      return (now - start) / (end - start);
    },

    contributors() {
      return uniqueBy(
        this.keyResults.map((kr) => kr.parent).filter((item) => item.name),
        'id'
      ).sort((a, b) => a.name.localeCompare(b.name, i18n.locale));
    },
  },

  methods: {
    periodDates,
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.objective-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: var(--color-white);
  border-left: 0.25rem solid var(--color-blue-dark);

  &__header {
    display: flex;
    justify-content: space-between;
    text-wrap: balance;

    h2 {
      @include get-text('pkt-txt-18-medium');
    }

    .pkt-btn {
      margin: -0.5rem -0.5rem 0 0;
    }
  }

  &__description {
    @include get-text('pkt-txt-16-light');
  }

  &__tiles {
    @include get-text('pkt-txt-14');

    h4 {
      @include get-text('pkt-txt-14-medium');
      margin-bottom: 0.25rem;
    }

    .item-tag:not(:last-child) {
      margin-right: 1rem;
    }
  }

  &--compact {
    gap: 0.5rem;
  }

  &--compact #{&} {
    &__header h2 {
      h2 {
        @include get-text('pkt-txt-16-medium');
      }
    }

    &__description {
      @include get-text('pkt-txt-14-light');
    }

    &__tiles {
      @include get-text('pkt-txt-12');

      h4 {
        @include get-text('pkt-txt-12-medium');
        margin-bottom: 0;
      }
    }
  }
}
</style>

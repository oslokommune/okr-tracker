<template>
  <modal-wrapper variant="wide" @close="close">
    <template #header>
      {{ $t('kpi.goals.edit') }}
    </template>

    <p class="mb-size-16 pkt-txt-14">{{ $t('kpi.goals.help') }}</p>

    <div class="goal-form">
      <div class="goal-form__left">
        <ul>
          <li
            v-for="goal in goals"
            :key="goal.id"
            :class="{ selected: goal.id === activeGoalId }"
            @click="setActiveGoal(goal.id)"
          >
            <a href="#">
              <span>{{ goal.name }}</span>
            </a>
          </li>
        </ul>
        <pkt-button
          skin="tertiary"
          variant="icon-left"
          icon-name="plus-sign"
          @onClick="addGoal(kpi)"
        >
          {{ $t('kpi.goals.new') }}
        </pkt-button>
      </div>

      <div class="goal-form__right">
        <form-section v-if="activeGoalId">
          <form-component
            v-model="name"
            input-type="input"
            name="name"
            :label="$t('fields.name')"
            type="text"
            rules="required"
          />

          <form-component
            v-model="period"
            input-type="date"
            name="period"
            :label="$t('fields.period')"
            :placeholder="$t('general.selectRange')"
            rules="required"
            :date-picker-config="flatPickrConfig"
          />

          <form-component
            v-model="value"
            input-type="input"
            name="value"
            :label="$t('fields.value')"
            type="number"
            rules="required"
          >
            <template #sub>
              <span v-if="value" class="display-as pkt-txt-14-medium">
                {{ $t('general.displayedAs') }}
                {{ formatKPIValue(kpi, typePercentage ? value / 100 : value) }}
              </span>
            </template>
          </form-component>

          <template #actions="{ handleSubmit, submitDisabled }">
            <btn-delete @click="archive" />
            <btn-save :disabled="submitDisabled" @click="handleSubmit(update)" />
          </template>
        </form-section>
      </div>
    </div>

    <template #footer></template>
  </modal-wrapper>
</template>

<script>
import { endOfDay, endOfYear, startOfYear } from 'date-fns';
import { PktButton } from '@oslokommune/punkt-vue2';
import { db } from '@/config/firebaseConfig';
import Goal from '@/db/Kpi/Goal';
import { FormSection, BtnDelete, BtnSave } from '@/components/generic/form';
import { toastArchiveAndRevert } from '@/util';
import { formatKPIValue } from '@/util/kpiHelpers';
import ModalWrapper from './ModalWrapper.vue';

export default {
  name: 'ProgressModal',

  components: {
    ModalWrapper,
    FormSection,
    BtnDelete,
    BtnSave,
    PktButton,
  },

  props: {
    kpi: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
    flatPickrConfig: {
      altFormat: 'j M Y',
      minDate: null,
      mode: 'range',
      maxDate: null,
      static: true,
    },
    goals: [],
    activeGoalId: null,
    name: null,
    period: null,
    fromDate: null,
    toDate: null,
    value: null,
  }),

  computed: {
    typePercentage() {
      return this.kpi.format === 'percentage';
    },
  },

  watch: {
    kpi: {
      immediate: true,
      handler() {
        this.bindGoals().then(() => {
          if (!this.activeGoalId && this.goals.length) {
            this.setActiveGoal(this.goals[0].id);
          }
        });
      },
    },
    period() {
      if (this.period && this.period.length === 2) {
        const [fromDate, toDate] = this.period;
        this.fromDate = fromDate;
        this.toDate = endOfDay(toDate);
      } else {
        this.fromDate = null;
        this.toDate = null;
      }
    },
  },

  methods: {
    formatKPIValue,

    truncateFloat(f) {
      return parseFloat(f.toFixed(4));
    },

    close() {
      this.$emit('close');
    },

    async dateSelected(period) {
      const [fromDate, toDate] = period;
      this.fromDate = fromDate;
      this.toDate = endOfDay(toDate);
    },

    async addGoal(kpi) {
      const now = new Date();
      const fromDate = startOfYear(now);
      const toDate = endOfYear(now);

      const goal = await Goal.create(kpi.id, {
        name: this.$t('kpi.goals.new'),
        fromDate,
        toDate,
        value: null,
        archived: false,
      });
      this.fromDate = fromDate;
      this.toDate = toDate;
      await this.setActiveGoal(goal.id);
    },

    async bindGoals() {
      const { ref } = await db.collection('kpis').doc(this.kpi.id).get();
      return this.$bind(
        'goals',
        ref.collection('goals').where('archived', '==', false).orderBy('fromDate', 'desc')
      );
    },

    async setActiveGoal(goalId) {
      const { ref } = await db.collection('kpis').doc(this.kpi.id).get();
      const activeGoal = await ref.collection('goals').doc(goalId).get();
      this.activeGoalId = goalId;
      this.name = activeGoal.get('name');
      const fromDate = activeGoal.get('fromDate');
      const toDate = activeGoal.get('toDate');
      if (fromDate && toDate) {
        this.period = [fromDate.toDate(), toDate.toDate()];
        [this.fromDate, this.toDate] = this.period;
      }
      const val = activeGoal.get('value');
      this.value = this.typePercentage ? this.truncateFloat(val * 100) : val;
    },

    async clearActiveGoal() {
      this.activeGoalId = null;
      this.activeGoal = null;
      this.name = null;
      this.period = null;
      this.fromDate = null;
      this.toDate = null;
      this.value = null;
    },

    async update() {
      try {
        await Goal.update(this.kpi.id, this.activeGoalId, {
          name: this.name,
          fromDate: this.fromDate,
          toDate: this.toDate,
          value: this.typePercentage ? this.value / 100 : this.value,
        });

        this.$toasted.show(this.$t('toaster.savedChanges'));
      } catch (error) {
        console.log(error);
        this.$toasted.error(this.$t('toaster.error.save'));
      }
    },

    async archive() {
      try {
        await Goal.archive(this.kpi.id, this.activeGoalId);
        const restoreCallback = this.restore.bind(this, this.kpi.id, this.activeGoalId);
        toastArchiveAndRevert({
          name: this.name || this.$t('kpi.goals.the'),
          callback: restoreCallback,
        });
      } catch {
        this.$toasted.error(
          this.$t('toaster.error.archive', {
            document: this.name || this.$t('kpi.goals.the'),
          })
        );
      }
      if (this.goals.length) {
        await this.setActiveGoal(this.goals[0].id);
      } else {
        await this.clearActiveGoal();
      }
    },

    async restore(kpiId, goalId) {
      try {
        await Goal.restore(kpiId, goalId);
        this.$toasted.show(this.$t('toaster.restored'));
      } catch {
        this.$toasted.error(
          this.$t('toaster.error.restore', { document: this.$t('kpi.goals.the') })
        );
      }
      await this.setActiveGoal(goalId);
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;

::v-deep .modal {
  overflow-y: visible;
}

.goal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @include bp('phablet-up') {
    flex-direction: row;
    gap: 1.5rem;
  }

  .display-as {
    color: var(--color-grayscale-60);
  }

  &__left {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    height: 100%;
    border: 2px solid var(--color-border);

    ul {
      height: 19rem;
      overflow-y: scroll;
    }

    li {
      display: block;
      padding: 0.5rem 0.75rem;
      text-decoration: none;
      border-bottom: 2px solid var(--color-border);
      cursor: pointer;

      &.selected {
        font-weight: 500;
        background: var(--color-gray-light);
      }
    }

    a {
      color: var(--color-text);
      text-decoration: none;
    }

    button {
      display: flex;
      justify-content: center;
      margin-top: auto;
      border-top: 2px solid var(--color-border);
    }

    .icon {
      height: 1.5rem;
      margin-right: -0.25rem;
    }
  }

  &__right {
    display: flex;
    flex-basis: 45%;
    flex-direction: column;
  }
}
</style>

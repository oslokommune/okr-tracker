<template>
  <modal-wrapper variant="wide" @close="close">
    <template #header>
      {{ $t('kpi.goals.edit') }}
    </template>

    <div class="goal-form">
      <div class="goal-form__left">
        <ul>
          <li
            v-for="goal in goals"
            :key="goal.id"
            :class="{ selected: goal.id === activeGoalId }"
            @click="setActiveGoal(goal.id)"
          >
            <a href="#"><span>{{ goal.name }}</span></a>
          </li>
        </ul>
        <button class="btn btn--ter btn--icon btn--fw" @click="addGoal(kpi)">
          <i class="icon fa fa-plus" />
          <span>{{ $t('kpi.goals.new') }}</span>
        </button>
      </div>

      <div class="goal-form__right">
        <validation-observer v-if="activeGoalId" v-slot="{ handleSubmit }">
          <form id="update-goal" @submit.prevent="handleSubmit(update)">
            <form-component
              v-model="name"
              input-type="input"
              name="name"
              :label="$t('fields.name')"
              type="text"
            />
            <span class="form-label">{{ $t('fields.period') }}</span>
            <flat-pickr
              v-model="period"
              :config="flatPickrConfig"
              class="form-control flatpickr-input"
              placeholder="Velg start- og sluttdato"
              @on-change="dateSelected"
            />
            <form-component
              v-model="value"
              input-type="input"
              name="value"
              :label="$t('fields.value')"
              type="number"
              rules="required"
            />
            <div class="button-row">
              <button
                class="btn btn--icon btn--archive"
                @click="archive($event)"
              >
                <i class="icon fa fa-fw fa-trash" />
                {{ $t('btn.delete') }}
              </button>
              <button
                class="btn btn--icon btn--pri btn--icon-pri"
                form="update-goal"
              >
                <i class="icon fa fa-fw fa-save" />
                {{ $t('btn.saveChanges') }}
              </button>
            </div>
          </form>
        </validation-observer>
      </div>
    </div>

    <template #footer></template>
  </modal-wrapper>
</template>

<script>
import locale from 'flatpickr/dist/l10n/no';
import { db } from '@/config/firebaseConfig';
import Goal from '@/db/Kpi/Goal';
import ModalWrapper from './ModalWrapper.vue';
import { toastArchiveAndRevert } from '@/util';

export default {
  name: 'ProgressModal',

  components: {
    ModalWrapper,
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
      locale: locale.no,
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

  watch: {
    kpi: {
      immediate: true,
      handler() {
        this.bindGoals();
      },
    },
  },

  methods: {
    close() {
      this.$emit('close');
    },

    async dateSelected(period) {
      [this.fromDate, this.toDate] = period;
    },

    async addGoal(kpi) {
      const now = new Date();
      const goal = await Goal.create(kpi.id, {
        name: this.$t('kpi.goals.new'),
        fromDate: now,
        toDate: now,
        value: null,
        archived: false,
      });
      this.fromDate = now;
      this.toDate = now;
      await this.setActiveGoal(goal.id);
    },

    async bindGoals() {
      const { ref } = await db.collection('kpis').doc(this.kpi.id).get();
      return this.$bind(
        'goals',
        ref
          .collection('goals')
          .where('archived', '==', false)
          .orderBy('fromDate')
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
      this.value = activeGoal.get('value');
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
          value: this.value,
        });

        this.$toasted.show(this.$t('toaster.savedChanges'));
      } catch (error) {
        console.log(error);
        this.$toasted.error(this.$t('toaster.error.save'));
      }
    },

    async archive(event) {
      event.preventDefault();

      try {
        await Goal.archive(this.kpi.id, this.activeGoalId);
        const restoreCallback = this.restore.bind(
          this,
          this.kpi.id,
          this.activeGoalId
        );
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
      await this.clearActiveGoal();
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
.goal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media screen and (min-width: bp(s)) {
    flex-direction: row;
  }

  &__left {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    height: 100%;
    border: 1px solid var(--color-grey-100);

    @media screen and (min-width: bp(s)) {
      margin-right: 1.5rem;
    }

    ul {
      height: 19rem;
      overflow-y: scroll;
    }

    li {
      display: block;
      padding: 0.5rem 0.75rem;
      color: var(--color-text);
      text-decoration: none;
      border-bottom: 1px solid var(--color-grey-100);
      cursor: pointer;

      &.selected {
        color: var(--color-text);
        font-weight: 500;
        background: var(--color-grey-50);
      }

      &.active {
        color: var(--color-text-secondary);
        font-weight: 500;
        background: var(--color-primary);
      }
    }

    a {
      color: var(--color-text);
      text-decoration: none;
    }

    button {
      margin-top: auto;
      border-top: 1px solid var(--color-grey-100);
    }
  }

  &__right {
    display: flex;
    flex-basis: 45%;
    flex-direction: column;
  }

  ::v-deep form span:first-child .form-group {
    margin-top: 0;
  }

  .button-row {
    justify-content: flex-end;
    margin-top: 2rem;
  }
}

::v-deep .flatpickr-wrapper {
  display: block;
}
</style>

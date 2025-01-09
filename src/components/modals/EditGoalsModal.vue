<script setup>
import { computed, ref, watch } from 'vue';
import { useCollection, useDocument } from 'vuefire';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toast-notification';
import { collection, doc, orderBy, query, where } from 'firebase/firestore';
import { endOfYear, startOfYear } from 'date-fns';
import { db } from '@/config/firebaseConfig';
import Goal from '@/db/Kpi/Goal';
import { periodDates } from '@/util';
import { PktButton } from '@oslokommune/punkt-vue';
import { FormSection, BtnDelete, BtnSave } from '@/components/generic/form';
import { formatKPIValue } from '@/util/kpiHelpers';
import FadeTransition from '@/components/generic/transitions/FadeTransition.vue';
import ModalWrapper from './ModalWrapper.vue';

const i18n = useI18n();
const toast = useToast();

const props = defineProps({
  kpi: {
    type: Object,
    required: true,
  },
});

const kpiRef = computed(() => props.kpi && doc(db, 'kpis', props.kpi.id));

const { data: goals, pending: goalsIsLoading } = useCollection(
  computed(() => {
    return (
      kpiRef.value &&
      query(
        collection(kpiRef.value, 'goals'),
        where('archived', '==', false),
        orderBy('toDate', 'desc')
      )
    );
  }),
  { ssrKey: 'kpiGoals' }
);

const activeGoalId = ref(null);
const { data: activeGoal, pending: goalIsLoading } = useDocument(
  () => activeGoalId.value && doc(kpiRef.value, 'goals', activeGoalId.value)
);

const typePercentage = computed(() => props.kpi.format === 'percentage');
const truncateFloat = (f) => parseFloat(f.toFixed(4));

const form = ref(null);
const formData = ref({});
const isLoading = ref(false);
const formIsDisabled = computed(() => isLoading.value || goalIsLoading.value);

watch(activeGoal, (goal) => {
  if (goal) {
    formData.value = {
      name: goal.name,
      period: [goal.fromDate.toDate(), goal.toDate.toDate()],
      value:
        goal.value && typePercentage.value ? truncateFloat(goal.value * 100) : goal.value,
    };
  }
  form.value.reset();
});

const formattedValue = computed(() => {
  const { value } = formData.value;
  return value && typeof value === 'number'
    ? formatKPIValue(props.kpi, typePercentage.value ? value / 100 : value)
    : null;
});

async function addGoal() {
  const now = new Date();
  const fromDate = startOfYear(now);
  const toDate = endOfYear(now);

  isLoading.value = true;
  try {
    const goalRef = await Goal.create(props.kpi.id, {
      name: i18n.t('kpi.goals.new'),
      fromDate,
      toDate,
      value: null,
      archived: false,
    });
    activeGoalId.value = goalRef.id;
  } catch {
    toast.error(
      i18n.t('toaster.error.restore', { document: i18n.t('kpi.goals.new').toLowerCase() })
    );
  }
  isLoading.value = false;
}

async function update() {
  isLoading.value = true;
  try {
    const { name, period, value } = formData.value;
    await Goal.update(props.kpi.id, activeGoal.value.id, {
      name,
      fromDate: period[0],
      toDate: period[1],
      value: typePercentage.value ? value / 100 : value,
    });
    toast.success(i18n.t('toaster.savedChanges'));
  } catch {
    toast.error(i18n.t('toaster.error.save'));
  }
  isLoading.value = false;
}

async function archive() {
  isLoading.value = true;
  const { id, name } = activeGoal.value;
  try {
    await Goal.archive(props.kpi.id, id);
    toast.success(i18n.t('toaster.delete.permanently', { name }));
  } catch {
    toast.error(
      i18n.t('toaster.error.archive', {
        document: name || i18n.t('kpi.goals.the'),
      })
    );
  }

  activeGoalId.value = goals.value.length ? goals.value[0].id : null;
  isLoading.value = false;
}
</script>

<template>
  <ModalWrapper variant="wide" @close="$emit('close')">
    <template #header>
      {{ $t('kpi.goals.edit') }}
    </template>

    <p class="mb-size-16 pkt-txt-14">{{ $t('kpi.goals.help') }}</p>

    <div class="goal-form">
      <div class="goal-form__left">
        <ul class="goal-form__list">
          <li
            v-for="goal in goals"
            :key="goal.id"
            :class="[
              'goal-form__goal',
              { 'goal-form__goal--selected': goal.id === activeGoalId },
            ]"
            @click="activeGoalId = goal.id"
          >
            <a href="#">
              <div>{{ goal.name }}</div>
              <div>
                {{ periodDates({ startDate: goal.fromDate, endDate: goal.toDate }) }}
              </div>
            </a>
          </li>
        </ul>
        <PktButton
          skin="tertiary"
          variant="icon-left"
          icon-name="plus-sign"
          :disabled="goalsIsLoading || formIsDisabled"
          @on-click="addGoal"
        >
          {{ $t('kpi.goals.new') }}
        </PktButton>
      </div>

      <div class="goal-form__right">
        <FadeTransition>
          <FormSection v-if="goalIsLoading || activeGoal" ref="form">
            <FormComponent
              v-model="formData.name"
              input-type="input"
              name="name"
              :label="$t('fields.name')"
              :disabled="formIsDisabled"
              type="text"
              rules="required"
            />

            <FormComponent
              v-model="formData.period"
              input-type="date"
              name="period"
              :label="$t('fields.period')"
              :placeholder="$t('general.selectRange')"
              :date-picker-config="{ mode: 'range' }"
              :disabled="formIsDisabled"
              rules="required"
            />

            <FormComponent
              v-model="formData.value"
              input-type="input"
              name="value"
              :label="$t('fields.value')"
              :disabled="formIsDisabled"
              type="number"
              rules="required"
              :preview-value="formattedValue"
            />

            <template #actions="{ submit, disabled }">
              <BtnDelete :disabled="formIsDisabled" @on-click="archive" />
              <BtnSave
                :disabled="disabled || formIsDisabled"
                @on-click="submit(update)"
              />
            </template>
          </FormSection>
        </FadeTransition>
      </div>
    </div>

    <template #footer></template>
  </ModalWrapper>
</template>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

:deep(.modal) {
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

  &__left {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    height: 100%;
    border: 2px solid var(--color-border);

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
    flex-basis: 50%;
    flex-direction: column;
  }

  &__list {
    height: 15rem;
    overflow-y: scroll;

    @include bp('phablet-up') {
      height: 23rem;
    }
  }

  &__goal {
    padding: 0.5rem 0.75rem;
    text-decoration: none;
    border-bottom: 2px solid var(--color-border);
    cursor: pointer;

    &--selected {
      background: var(--color-gray-light);
    }

    a {
      color: var(--color-text);
      text-decoration: none;

      div:nth-child(1) {
        @include get-text('pkt-txt-14-medium');
      }
      div:nth-child(2) {
        @include get-text('pkt-txt-12');
        color: var(--pkt-color-text-placeholder);
      }
    }
  }
}
</style>

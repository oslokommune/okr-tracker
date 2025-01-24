<script setup>
import { computed, ref, watch } from 'vue';
import { endOfDay } from 'date-fns';
import { PktAccordion, PktAccordionItem, PktAlert } from '@oslokommune/punkt-vue';
import { dateShort } from '@/util';
import { formatKPIValue } from '@/util/kpiHelpers';
import Progress from '@/db/Kpi/Progress';
import ProgressValueForm from '@/components/forms/ProgressValueForm.vue';
import ModalWrapper from '../ModalWrapper.vue';
import { useProgressModal } from './progressModal.js';

const props = defineProps({
  record: {
    type: Object,
    required: false,
    default: null,
  },
  kpi: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['create-record', 'update-record', 'delete-record', 'close']);

const { thisRecord, loading, saveRecord, deleteRecord, close } = useProgressModal(
  props,
  emit
);

const existingValueForDate = ref(null);
const kpiIsPercentage = computed(() => props.kpi.format === 'percentage');
const recordValue = computed({
  get() {
    let val = thisRecord.value.value;

    if (val === null || val === undefined) {
      return null;
    }

    if (typeof val !== 'number') {
      return val;
    }

    if (kpiIsPercentage.value) {
      val *= 100;
    }

    return parseFloat(val.toFixed(6));
  },
  set(value) {
    thisRecord.value.value =
      value && typeof value === 'number' && kpiIsPercentage.value
        ? parseFloat(value.toFixed(6)) / 100
        : value;
  },
});
const displayValue = computed(() =>
  recordValue.value && typeof recordValue.value === 'number'
    ? formatKPIValue(props.kpi, thisRecord.value.value)
    : null
);
const apiExample = computed(() =>
  [
    'curl -X POST -H "okr-team-secret: <YOUR SECRET>"',
    '-H "x-api-key: <YOUR API-KEY>"',
    '-H "Content-Type: application/json"',
    `-d '{ "progress": <VALUE> }'`,
    `${import.meta.env.VITE_API_GATEWAY_URL}/kpi/${props.kpi.id}`,
  ].join(' \\\n  ')
);

watch(
  () => thisRecord.value.timestamp,
  (timestamp) => {
    if (timestamp) {
      checkExistingMeasurement(timestamp);
    }
  }
);

async function checkExistingMeasurement(timestamp) {
  const date = timestamp ? new Date(timestamp) : new Date();
  const existingValueSnapshot = await Progress.get(props.kpi.id, date);

  if (
    existingValueSnapshot &&
    (!props.record || (props.record && existingValueSnapshot.id !== props.record.id))
  ) {
    existingValueForDate.value = existingValueSnapshot.data();
    return;
  }
  existingValueForDate.value = null;
}
</script>

<template>
  <ModalWrapper variant="wide" @close="close">
    <template #header>
      {{ $t(record ? 'kpi.editValue' : 'kpi.newValue') }}
    </template>

    <ProgressValueForm
      v-model:value="recordValue"
      v-model:comment="thisRecord.comment"
      v-model:timestamp="thisRecord.timestamp"
      :loading="loading"
      :enable-delete="!!record"
      :enable-time="false"
      :max-date="endOfDay(new Date())"
      :display-value="displayValue"
      @submit="saveRecord"
      @delete="deleteRecord"
    >
      <PktAlert v-if="existingValueForDate" skin="warning" class="mb-size-24">
        {{
          $t('widget.history.overwriteWarning', {
            date: dateShort(existingValueForDate.timestamp.toDate()),
            value: formatKPIValue(kpi, existingValueForDate.value),
          })
        }}
      </PktAlert>
    </ProgressValueForm>

    <template #footer>
      <PktAccordion :compact="true" skin="borderless">
        <PktAccordionItem id="api" :title="$t('kpi.help.apiHelpTitle')">
          <i18n-t
            keypath="kpi.help.apiProgress"
            tag="p"
            class="mb-size-16"
            scope="global"
          >
            <template #apiLink>
              <RouterLink :to="{ name: 'Api' }" target="_blank">
                <span>{{ $t('general.api') }}</span>
              </RouterLink>
            </template>
          </i18n-t>

          <FormComponent
            input-type="textarea"
            name="api-example"
            :rows="5"
            :readonly="true"
            :label="$t('fields.example')"
            :copy-button="true"
            :fullwidth="true"
            :show-optional-tag="false"
            :value="apiExample"
            class="api-example"
          />
        </PktAccordionItem>
      </PktAccordion>
    </template>
  </ModalWrapper>
</template>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

:deep(.api-example) {
  textarea {
    @include get-text('pkt-txt-12');
    font-family: monospace;
  }
}
</style>

<template>
  <modal-wrapper variant="wide" @close="close">
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
      <pkt-alert v-if="existingValueForDate" skin="warning" class="mb-size-24">
        {{
          $t('widget.history.overwriteWarning', {
            date: dateShort(existingValueForDate.timestamp.toDate()),
            value: formatKPIValue(kpi, existingValueForDate.value),
          })
        }}
      </pkt-alert>
    </ProgressValueForm>

    <template #footer>
      <PktAccordion :compact="true" skin="borderless">
        <PktAccordionItem id="api" :title="$t('kpi.help.apiHelpTitle')">
          <i18n-t keypath="kpi.help.apiProgress" tag="p" class="mb-size-16">
            <template #apiLink>
              <router-link :to="{ name: 'Api' }" target="_blank">
                <span>{{ $t('general.api') }}</span>
              </router-link>
            </template>
          </i18n-t>

          <form-component
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
  </modal-wrapper>
</template>

<script>
import { endOfDay } from 'date-fns';
import { PktAccordion, PktAccordionItem, PktAlert } from '@oslokommune/punkt-vue';
import { dateShort } from '@/util';
import { formatKPIValue } from '@/util/kpiHelpers';
import Progress from '@/db/Kpi/Progress';
import ProgressValueForm from '@/components/forms/ProgressValueForm.vue';
import ModalWrapper from '../ModalWrapper.vue';
import { useProgressModal } from './progressModal.js';

export default {
  name: 'KPIProgressModal',

  compatConfig: { MODE: 3 },

  components: {
    PktAccordion,
    PktAccordionItem,
    PktAlert,
    ModalWrapper,
    ProgressValueForm,
  },

  props: {
    record: {
      type: Object,
      required: false,
      default: null,
    },
    kpi: {
      type: Object,
      required: true,
    },
  },

  emits: ['create-record', 'update-record', 'delete-record', 'close'],

  setup(props, context) {
    const { thisRecord, loading, saveRecord, deleteRecord, close } = useProgressModal(
      props,
      context
    );
    return { thisRecord, loading, saveRecord, deleteRecord, close };
  },

  data: () => ({
    existingValueForDate: null,
  }),

  computed: {
    kpiIsPercentage() {
      return this.kpi.format === 'percentage';
    },

    recordValue: {
      get() {
        let val = this.thisRecord.value;

        if (val === null || val === undefined) {
          return null;
        }

        if (this.kpiIsPercentage) {
          val *= 100;
        }

        return parseFloat(val.toFixed(6));
      },
      set(value) {
        this.thisRecord.value =
          value && this.kpiIsPercentage ? parseFloat(value.toFixed(6)) / 100 : value;
      },
    },

    displayValue() {
      return this.thisRecord.value !== null
        ? formatKPIValue(this.kpi, this.thisRecord.value)
        : null;
    },

    apiExample() {
      return [
        'curl -X POST -H "okr-team-secret: <YOUR SECRET>"',
        '-H "x-api-key: <YOUR API-KEY>"',
        '-H "Content-Type: application/json"',
        `-d '{ "progress": <VALUE> }'`,
        `${import.meta.env.VITE_API_GATEWAY_URL}/kpi/${this.kpi.id}`,
      ].join(' \\\n  ');
    },
  },

  watch: {
    'thisRecord.timestamp': function (timestamp) {
      this.checkExistingMeasurement(timestamp);
    },
  },

  mounted() {
    this.checkExistingMeasurement(this.record?.timestamp);
  },

  methods: {
    endOfDay,
    dateShort,
    formatKPIValue,

    async checkExistingMeasurement(timestamp) {
      const date = timestamp ? new Date(timestamp) : new Date();
      const existingValueSnapshot = await Progress.get(this.kpi.id, date);

      if (
        existingValueSnapshot &&
        (!this.record || (this.record && existingValueSnapshot.id !== this.record.id))
      ) {
        this.existingValueForDate = existingValueSnapshot.data();
        return;
      }
      this.existingValueForDate = null;
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

:deep(.modal__footer) {
  display: block;
}

:deep(.api-example) {
  textarea {
    @include get-text('pkt-txt-12');
    font-family: monospace;
  }
}
</style>

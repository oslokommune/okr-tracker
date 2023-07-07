<template>
  <modal-wrapper variant="wide" @close="close">
    <template #header>
      {{ $t(record ? 'kpi.editValue' : 'kpi.newValue') }}
    </template>

    <form-section>
      <div class="progress-form">
        <div class="progress-form__left">
          <form-component
            v-model="recordValue"
            input-type="input"
            name="value"
            class="progress-form__value-group"
            :label="$t('widget.history.value')"
            rules="required"
            type="number"
            data-cy="progress_value"
          >
            <template #sub>
              <span v-if="updatedValue" class="display-as">
                {{ $t('general.displayedAs') }}
                {{ formatKPIValue(kpi, thisRecord.value) }}
              </span>
            </template>
          </form-component>

          <form-component
            v-model="thisRecord.comment"
            input-type="textarea"
            name="comment"
            :label="$t('widget.history.comment')"
            :placeholder="$t('keyResult.commentPlaceholder')"
            data-cy="progress_comment"
            class="progress-form__comment-group"
          />
        </div>

        <div class="progress-form__right">
          <validation-provider name="datetime" rules="required">
            <label class="pkt-form-group">
              <span class="pkt-form-label">{{ $t('widget.history.date') }}</span>
              <flat-pickr
                v-model="thisRecord.timestamp"
                :config="flatPickerConfig"
                class="pkt-form-input flatpickr-input"
                name="datetime"
                :placeholder="$t('widget.history.date')"
                @on-change="onDateSelected"
              />
            </label>
          </validation-provider>
        </div>
      </div>

      <pkt-alert v-if="existingValue" skin="warning">
        {{
          $t('widget.history.overwriteWarning', {
            date: dateShort(existingValue.timestamp.toDate()),
            value: formatKPIValue(kpi, existingValue.value),
          })
        }}
      </pkt-alert>

      <template #actions="{ handleSubmit, submitDisabled }">
        <btn-save :disabled="submitDisabled || loading" @click="handleSubmit(save)" />
      </template>
    </form-section>

    <template #subfooter>
      <hr class="pkt-hr" />
      <i18n path="kpi.help.apiProgress" tag="p">
        <template #apiLink>
          <router-link :to="{ name: 'Api' }" target="_blank">
            <span>{{ $t('general.api') }}</span>
          </router-link>
        </template>
      </i18n>
      <progress-update-API-example :path="`kpi/${kpi.id}`" />
    </template>
  </modal-wrapper>
</template>

<script>
import { endOfDay } from 'date-fns';
import Progress from '@/db/Kpi/Progress';
import { dateShort } from '@/util';
import { formatKPIValue } from '@/util/kpiHelpers';
import ProgressUpdateAPIExample from '@/components/ProgressUpdateAPIExample.vue';
import ProgressModal from './ProgressModal.vue';

export default {
  name: 'KPIProgressModal',

  components: {
    PktAlert: () => import('@oslokommune/punkt-vue2').then(({ PktAlert }) => PktAlert),
    ProgressUpdateAPIExample,
  },

  extends: ProgressModal,

  props: {
    kpi: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
    existingValue: null,
    flatPickerConfig: {
      altFormat: 'j M Y H:i:S',
      altInput: false,
      enableTime: false,
      maxDate: endOfDay(new Date()),
      minDate: null,
      mode: 'single',
      inline: true,
    },
    updatedValue: null,
  }),

  computed: {
    typePercentage() {
      return this.kpi.format === 'percentage';
    },
    recordValue: {
      get() {
        if (!this.thisRecord.value) {
          return null;
        }

        return this.typePercentage
          ? parseFloat(this.thisRecord.value) * 100
          : parseFloat(this.thisRecord.value);
      },
      set(val) {
        this.thisRecord.value = this.typePercentage ? val / 100 : val;
        this.updatedValue = this.thisRecord.value;
      },
    },
  },

  mounted() {
    this.onDateSelected();
  },

  methods: {
    dateShort,
    formatKPIValue,

    async onDateSelected() {
      const existingValueSnapshot = await Progress.get(
        this.kpi.id,
        new Date(this.thisRecord.timestamp)
      );

      if (
        existingValueSnapshot &&
        (!this.record || (this.record && existingValueSnapshot.id !== this.record.id))
      ) {
        this.existingValue = existingValueSnapshot.data();
        return;
      }

      this.existingValue = null;
    },
  },
};
</script>

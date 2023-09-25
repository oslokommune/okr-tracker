<template>
  <modal-wrapper variant="wide" @close="close">
    <template #header>
      {{ $t(record ? 'kpi.editValue' : 'kpi.newValue') }}
    </template>

    <form-section>
      <div class="progress-form">
        <div class="progress-form__left">
          <form-component
            :value="recordValue"
            input-type="input"
            name="value"
            class="progress-form__value-group"
            :label="$t('widget.history.value')"
            rules="required|min_value:0"
            type="number"
            data-cy="progress_value"
            @input="(value) => (updatedValue = value)"
          >
            <template #sub>
              <span v-if="updatedValue" class="display-as pkt-txt-14-medium">
                {{ $t('general.displayedAs') }}
                {{ formatKPIValue(kpi, displayValue) }}
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
        <btn-save :disabled="submitDisabled || loading" @click="handleSubmit(_save)" />
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
import { PktAlert } from '@oslokommune/punkt-vue2';
import { dateShort } from '@/util';
import { formatKPIValue } from '@/util/kpiHelpers';
import Progress from '@/db/Kpi/Progress';
import ProgressModal from '@/components/modals/ProgressModal.vue';
import ProgressUpdateAPIExample from '@/components/ProgressUpdateAPIExample.vue';

export default {
  name: 'KPIProgressModal',

  components: {
    PktAlert,
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

    recordValue() {
      let val = this.thisRecord.value;

      if (val === null || val === undefined) {
        return null;
      }

      if (this.typePercentage) {
        val *= 100;
      }

      return parseFloat(val.toFixed(6));
    },

    displayValue() {
      return this.typePercentage ? this.updatedValue / 100 : this.updatedValue;
    },
  },

  mounted() {
    this.onDateSelected();
  },

  methods: {
    dateShort,
    formatKPIValue,

    async _save() {
      const val = parseFloat(this.updatedValue);

      this.thisRecord.value = this.typePercentage ? val / 100 : val;

      this.save();
    },

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

<template>
  <modal-wrapper variant="wide" @close="close">
    <template #header>
      {{ $t(record ? 'kpi.editValue' : 'kpi.newValue') }}
    </template>

    <form-section>
      <div class="progress-form">
        <div class="progress-form__left">
          <form-component
            v-model="thisRecord.value"
            input-type="input"
            name="value"
            :label="$t('widget.history.value')"
            rules="required"
            type="number"
            data-cy="progress_value"
          />

          <form-component
            v-model="thisRecord.comment"
            input-type="textarea"
            name="comment"
            :label="$t('widget.history.comment_optional')"
            :placeholder="$t('keyResult.commentPlaceholder')"
            data-cy="progress_comment"
            class="progress-form__comment-group"
          />
        </div>

        <div class="progress-form__right">
          <validation-provider v-slot="{ errors }" name="datetime" rules="required">
            <label class="form-group">
              <span class="form-label">{{ $t('widget.history.date') }}</span>

              <flat-pickr
                v-model="thisRecord.timestamp"
                :config="flatPickerConfig"
                class="form-control flatpickr-input"
                name="datetime"
                :placeholder="$t('widget.history.date')"
                @on-change="onDateSelected"
              />
              <span class="form-field--error">{{ errors[0] }}</span>
            </label>
          </validation-provider>
        </div>
      </div>

      <div v-if="existingValue" class="ok-alert ok-alert--warning">
        {{
          $t('widget.history.overwriteWarning', {
            date: dateShort(existingValue.timestamp.toDate()),
            value: formatKPIValue(activeKpi, existingValue.value),
          })
        }}
      </div>

      <template #actions="{ handleSubmit, submitDisabled }">
        <btn-save
          :label="$t(record ? 'btn.saveChanges' : 'btn.save')"
          :disabled="submitDisabled || loading"
          @click="handleSubmit(save)"
        />
      </template>
    </form-section>
  </modal-wrapper>
</template>

<script>
import { mapState } from 'vuex';
import locale from 'flatpickr/dist/l10n/no';
import { endOfDay } from 'date-fns';
import Progress from '@/db/Kpi/Progress';
import { dateShort } from '@/util';
import { formatKPIValue } from '@/util/kpiHelpers';
import ProgressUpdateAPIExample from '@/components/ProgressUpdateAPIExample.vue';
import ProgressModal from './ProgressModal.vue';

export default {
  name: 'KPIProgressModal',

  components: {
    ProgressUpdateAPIExample,
  },

  extends: ProgressModal,

  data: () => ({
    existingValue: null,
    flatPickerConfig: {
      altFormat: 'j M Y H:i:S',
      altInput: false,
      enableTime: false,
      locale: locale.no,
      maxDate: endOfDay(new Date()),
      minDate: null,
      mode: 'single',
      inline: true,
    },
  }),

  computed: {
    ...mapState(['activeKpi']),
  },

  mounted() {
    this.onDateSelected();
  },

  methods: {
    dateShort,
    formatKPIValue,

    async onDateSelected() {
      if (!this.activeKpi) {
        return;
      }

      const existingValueSnapshot = await Progress.get(
        this.activeKpi.id,
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

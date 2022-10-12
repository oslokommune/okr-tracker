<template>
  <modal-wrapper v-if="record" @close="close">
    <template #header>
      {{ $t('tooltip.editProgress') }}
    </template>

    <validation-observer v-slot="{ handleSubmit }">
      <form id="progress-value" @submit.prevent="handleSubmit(update)">
        <form-component
          v-model="thisRecord.value"
          input-type="input"
          name="name"
          :label="$t('widget.history.value')"
          rules="required"
          type="number"
          data-cy="progress_value"
        />

        <validation-provider v-slot="{ errors }" name="date" rules="required">
          <label class="form-field">
            <span class="form-label">{{ $t('widget.history.date') }}</span>
            <flat-pickr
              v-model="thisRecord.timestamp"
              :config="flatPickerConfig"
              class="form-control flatpickr-input"
              name="date"
              @on-change="onDateSelected"
            />
            <span class="form-field--error">{{ errors[0] }}</span>
          </label>
        </validation-provider>

        <form-component
          v-model="thisRecord.comment"
          input-type="textarea"
          name="comment"
          :label="$t('widget.history.comment_optional')"
          :placeholder="$t('keyResult.commentPlaceholder')"
          type="number"
          data-cy="progress_comment"
        />
      </form>
    </validation-observer>

    <div
      v-if="existingValue"
      class="ok-alert ok-alert--warning"
      style="background: var(--color-warning)"
    >
      {{
        $t('widget.history.overwriteWarning', {
          date: dateShort(existingValue.timestamp.toDate()),
          value: formatKPIValue(activeKpi, existingValue.value),
        })
      }}
    </div>

    <template #footer>
      <button form="progress-value" :disabled="loading" class="btn btn--ods">
        {{ $t('btn.saveChanges') }}
      </button>
    </template>
  </modal-wrapper>
</template>

<script>
import { mapState } from 'vuex';
import locale from 'flatpickr/dist/l10n/no';
import { db } from '@/config/firebaseConfig';
import Progress from '@/db/Progress';
import { dateShort } from '@/util';
import { formatKPIValue } from '@/util/kpiHelpers';
import ProgressModal from './ProgressModal.vue';

export default {
  name: 'KPIProgressModal',
  extends: ProgressModal,

  data: () => ({
    existingValue: null,
    flatPickerConfig: {
      altFormat: 'j M Y H:i:S',
      altInput: false,
      enableTime: false,
      locale: locale.no,
      maxDate: new Date(),
      minDate: null,
      mode: 'single',
      inline: true,
    },
  }),

  computed: {
    ...mapState(['activeKpi']),
  },

  methods: {
    dateShort,
    formatKPIValue,

    async onDateSelected() {
      if (!this.activeKpi) {
        return;
      }
      const existingValueSnapshot = await Progress.get(
        db.collection('kpis'),
        this.activeKpi.id,
        new Date(this.thisRecord.timestamp)
      );

      this.existingValue =
        existingValueSnapshot && existingValueSnapshot.id !== this.record.id
          ? existingValueSnapshot.data()
          : null;
    },
  },
};
</script>

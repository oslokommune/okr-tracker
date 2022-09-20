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

        <validation-provider
          v-slot="{ errors }"
          name="timestamp"
          rules="required"
        >
          <label class="form-field">
            <span class="form-label">{{ $t('widget.history.time') }}</span>
            <flat-pickr
              v-model="thisRecord.timestamp"
              :config="flatPickerConfig"
              class="form-control flatpickr-input"
              name="date"
              :placeholder="$t('widget.history.time')"
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

    <template #footer>
      <button form="progress-value" :disabled="loading" class="btn btn--ods">
        {{ $t('btn.saveChanges') }}
      </button>
    </template>
  </modal-wrapper>
</template>

<script>
import locale from 'flatpickr/dist/l10n/no';
import ModalWrapper from './ModalWrapper.vue';

export default {
  name: 'ProgressModal',

  components: {
    ModalWrapper,
  },

  props: {
    record: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
    thisRecord: null,
    loading: false,
    flatPickerConfig: {
      altFormat: 'j M Y H:i:S',
      altInput: false,
      enableSeconds: true,
      enableTime: true,
      locale: locale.no,
      maxDate: new Date(),
      minDate: null,
      mode: 'single',
    },
  }),

  watch: {
    record: {
      immediate: true,
      handler() {
        if (this.record) {
          this.thisRecord = {
            ...this.record,
            timestamp: this.record.timestamp.toDate(),
          };
        }
      },
    },
  },

  methods: {
    async update() {
      this.loading = true;
      this.$emit(
        'update-record',
        this.record.id,
        {
          value: +this.thisRecord.value,
          timestamp: new Date(this.thisRecord.timestamp),
          comment: this.thisRecord.comment || '',
        },
        this.close
      );
    },
    close() {
      this.loading = false;
      this.$emit('close');
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .form {
  &-label {
    color: var(--color-white);
  }
  &-field {
    padding: 0;
  }
  &__field {
    max-width: 100%;
  }
}
</style>

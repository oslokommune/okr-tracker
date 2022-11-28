<template>
  <modal-wrapper variant="wide" @close="close">
    <template #header>
      {{ $t(record ? 'keyResult.editValue' : 'keyResult.newValue') }}
    </template>

    <validation-observer v-slot="{ handleSubmit }">
      <form
        id="progress-value"
        class="progress-form"
        @submit.prevent="handleSubmit(save)"
      >
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
            type="number"
            data-cy="progress_comment"
            class="progress-form__comment-group"
          />
        </div>

        <div class="progress-form__right">
          <validation-provider v-slot="{ errors }" name="datetime" rules="required">
            <label class="form-group">
              <span class="form-label">{{ $t('widget.history.time') }}</span>

              <flat-pickr
                v-model="thisRecord.timestamp"
                :config="flatPickerConfig"
                class="form-control flatpickr-input"
                name="datetime"
                :placeholder="$t('widget.history.time')"
              />
              <span class="form-field--error">{{ errors[0] }}</span>
            </label>
          </validation-provider>
        </div>
      </form>
    </validation-observer>

    <template #footer>
      <btn-save
        form="progress-value"
        :label="$t(record ? 'btn.saveChanges' : 'btn.save')"
        :disabled="loading"
      />
    </template>
  </modal-wrapper>
</template>

<script>
import locale from 'flatpickr/dist/l10n/no';
import { BtnSave } from '@/components/generic/form/buttons';
import ModalWrapper from './ModalWrapper.vue';

export default {
  name: 'ProgressModal',

  components: {
    ModalWrapper,
    BtnSave,
  },

  props: {
    record: {
      type: Object,
      required: false,
      default: null,
    },
  },

  data: () => ({
    thisRecord: null,
    loading: false,
    flatPickerConfig: {
      altFormat: 'j M Y H:i:S',
      altInput: false,
      enableTime: true,
      enableSeconds: true,
      minuteIncrement: 1,
      locale: locale.no,
      maxDate: new Date(),
      minDate: null,
      mode: 'single',
      inline: true,
    },
  }),

  computed: {
    formattedData() {
      return {
        value: parseFloat(this.thisRecord.value),
        timestamp: new Date(this.thisRecord.timestamp),
        comment: this.thisRecord.comment || '',
      };
    },
  },

  watch: {
    record: {
      immediate: true,
      handler() {
        if (this.record) {
          this.thisRecord = {
            ...this.record,
            timestamp: this.record.timestamp.toDate(),
          };
        } else {
          this.thisRecord = {
            timestamp: this.flatPickerConfig.maxDate,
          };
        }
      },
    },
  },

  methods: {
    async save() {
      if (this.record) {
        this.updateRecord();
      } else {
        this.createRecord();
      }
    },
    async createRecord() {
      this.loading = true;
      this.$emit('create-record', this.formattedData, this.close);
    },
    async updateRecord() {
      this.loading = true;
      this.$emit('update-record', this.record.id, this.formattedData, this.close);
    },
    close() {
      this.loading = false;
      this.$emit('close');
    },
  },
};
</script>

<style lang="scss" scoped>
.progress-form {
  @media screen and (min-width: bp(s)) {
    display: flex;
  }

  &__left {
    display: flex;
    flex-direction: column;
    flex-grow: 1;

    @media screen and (min-width: bp(s)) {
      padding-right: 1.5rem;
    }
  }

  ::v-deep &__comment-group {
    flex-grow: 1;

    .form-group {
      height: calc(100% - 3rem);
    }
    .form-input__wrapper {
      height: 100%;
    }
  }

  ::v-deep input[name='value'] {
    font-size: 1.5rem;
  }
  ::v-deep textarea[name='comment'] {
    resize: vertical;
  }
  input[name='datetime'] {
    display: none;
  }
}

::v-deep .flatpickr-calendar {
  border: 1px solid var(--color-primary);
  border-radius: 0;
  -webkit-box-shadow: none;
  box-shadow: none;

  &.inline {
    top: 0;
  }
}
</style>

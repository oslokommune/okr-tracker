<template>
  <modal-wrapper variant="wide" @close="close">
    <template #header>
      {{ $t(record ? 'keyResult.editValue' : 'keyResult.newValue') }}
    </template>

    <form-section>
      <div class="progress-form">
        <div class="progress-form__left">
          <form-component
            v-model="thisRecord.value"
            input-type="input"
            name="value"
            :label="$t('widget.history.value')"
            rules="required|min_value:0"
            type="number"
            data-cy="progress_value"
          />

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
              <span class="pkt-form-label">{{ $t('widget.history.time') }}</span>
              <flat-pickr
                v-model="thisRecord.timestamp"
                :config="flatPickerConfig"
                class="pkt-form-input flatpickr-input"
                name="datetime"
                :placeholder="$t('widget.history.time')"
              />
            </label>
          </validation-provider>
        </div>
      </div>

      <template #actions="{ handleSubmit, submitDisabled }">
        <btn-delete v-if="record" :disabled="loading" @click="deleteRecord" />
        <btn-save :disabled="submitDisabled || loading" @click="handleSubmit(save)" />
      </template>
    </form-section>
  </modal-wrapper>
</template>

<script>
import { FormSection, BtnDelete, BtnSave } from '@/components/generic/form';
import ModalWrapper from './ModalWrapper.vue';

export default {
  name: 'ProgressModal',

  components: {
    ModalWrapper,
    FormSection,
    BtnDelete,
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
    async deleteRecord() {
      this.loading = true;
      this.$emit('delete-record', this.record.id, this.close);
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
  @include bp('phablet-up') {
    display: flex;
  }

  .display-as {
    color: var(--color-grayscale-60);
  }

  &__left {
    display: flex;
    flex-direction: column;
    flex-grow: 1;

    @include bp('phablet-up') {
      padding-right: 1.5rem;
    }
  }

  ::v-deep &__comment-group {
    flex-grow: 1;

    .pkt-form-group {
      height: calc(100% - 2rem);
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

.pkt-alert {
  margin-bottom: 1.5rem;
}

::v-deep .flatpickr-calendar {
  border: 2px solid var(--color-blue-dark);
  border-radius: 0;
  -webkit-box-shadow: none;
  box-shadow: none;

  &.inline {
    top: 0;
  }
}
</style>

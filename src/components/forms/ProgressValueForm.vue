<template>
  <form-section>
    <div class="progress-form">
      <div class="progress-form__left">
        <div class="progress-form__value-group">
          <form-component
            input-type="input"
            type="number"
            name="value"
            rules="required"
            :label="$t('widget.history.value')"
            :model-value="value"
            :preview-value="displayValue ? displayValue : null"
            @update:model-value="$emit('update:value', $event)"
          />
        </div>

        <div class="progress-form__comment-group">
          <form-component
            input-type="textarea"
            name="comment"
            :label="$t('widget.history.comment')"
            :placeholder="$t('keyResult.commentPlaceholder')"
            :model-value="comment"
            @update:model-value="$emit('update:comment', $event)"
          />
        </div>
      </div>

      <div class="progress-form__right">
        <form-component
          input-type="date"
          name="timestamp"
          :label="$t(enableTime ? 'widget.history.time' : 'widget.history.date')"
          :date-picker-config="datePickerConfig"
          rules="required"
          :model-value="timestamp"
          @update:model-value="$emit('update:timestamp', $event)"
        />
      </div>
    </div>

    <slot />

    <template #actions="{ submit, disabled }">
      <btn-delete
        v-if="enableDelete"
        :disabled="disabled || loading"
        @on-click="$emit('delete')"
      />
      <btn-save
        :disabled="disabled || loading"
        @on-click="submit((values) => $emit('submit', values))"
      />
    </template>
  </form-section>
</template>

<script>
import { FormSection, BtnDelete, BtnSave } from '@/components/generic/form';

export default {
  name: 'ProgressValueForm',

  compatConfig: {
    MODE: 3,
  },

  components: {
    FormSection,
    BtnDelete,
    BtnSave,
  },

  props: {
    value: {
      type: Number,
      required: false,
      default: null,
    },
    comment: {
      type: String,
      required: false,
      default: '',
    },
    timestamp: {
      type: Date,
      required: false,
      default: () => new Date(),
    },
    loading: {
      required: false,
      type: Boolean,
      default: false,
    },
    enableDelete: {
      type: Boolean,
      required: false,
      default: false,
    },
    enableTime: {
      type: Boolean,
      required: false,
      default: true,
    },
    minDate: {
      type: Date,
      required: false,
      default: null,
    },
    maxDate: {
      type: Date,
      required: false,
      default: () => new Date(),
    },
    displayValue: {
      type: String,
      required: false,
      default: null,
    },
  },

  emits: ['update:value', 'update:comment', 'update:timestamp', 'submit', 'delete'],

  computed: {
    datePickerConfig() {
      return {
        inline: true,
        enableTime: this.enableTime,
        minDate: this.minDate,
        maxDate: this.maxDate,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.progress-form {
  @include bp('phablet-up') {
    display: flex;
    gap: 1.5rem;
  }

  &__left {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: 1.5rem;
  }

  :deep(input[name='value']) {
    font-size: 1.5rem;
  }

  :deep(textarea[name='comment']) {
    resize: vertical;
  }
}

:deep(.progress-form__comment-group) {
  flex-grow: 1;

  .form-component,
  .pkt-inputwrapper,
  .pkt-inputwrapper__label,
  .pkt-input {
    height: 100%;
  }
}
</style>

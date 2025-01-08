<script setup>
import { computed } from 'vue';
import { BtnDelete, BtnSave } from '@/components/generic/form';

const props = defineProps({
  value: {
    type: [String, Number],
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
  valueSuffix: {
    type: String,
    required: false,
    default: null,
  },
});

defineEmits(['update:value', 'update:comment', 'update:timestamp', 'submit', 'delete']);

const datePickerConfig = computed(() => ({
  inline: true,
  enableTime: props.enableTime,
  minDate: props.minDate,
  maxDate: props.maxDate,
}));
</script>

<template>
  <FormSection>
    <div class="progress-form">
      <div class="progress-form__left">
        <div class="progress-form__value-group">
          <FormComponent
            input-type="input"
            type="number"
            name="value"
            rules="required"
            :label="$t('widget.history.value')"
            :suffix="valueSuffix"
            :model-value="value"
            :preview-value="displayValue ? displayValue : null"
            @update:model-value="$emit('update:value', $event)"
          />
        </div>

        <div class="progress-form__comment-group">
          <FormComponent
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
        <FormComponent
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
      <BtnDelete
        v-if="enableDelete"
        :disabled="disabled || loading"
        @on-click="$emit('delete')"
      />
      <BtnSave
        :disabled="disabled || loading"
        @on-click="submit((values) => $emit('submit', values))"
      />
    </template>
  </FormSection>
</template>

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
    height: 3rem;
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

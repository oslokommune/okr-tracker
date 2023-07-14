<template>
  <form-section>
    <form-component
      v-model.number="value"
      input-type="input"
      name="value"
      :label="$t('keyResult.newValue')"
      rules="required|min_value:0"
      type="number"
    />

    <form-component
      v-model="comment"
      input-type="textarea"
      name="comment"
      :rows="commentRows"
      :label="$t('fields.comment')"
      :placeholder="$t('keyResult.commentPlaceholder')"
    />

    <template #actions="{ handleSubmit, submitDisabled }">
      <btn-save :disabled="submitDisabled || loading" @click="handleSubmit(submitForm)" />
    </template>
  </form-section>
</template>

<script>
import { FormSection, BtnSave } from '@/components/generic/form';

export default {
  name: 'AddKeyResultValueForm',

  components: {
    FormSection,
    BtnSave,
  },

  props: {
    keyResult: {
      type: Object,
      required: true,
    },
    commentRows: {
      required: false,
      type: Number,
      default: 4,
    },
    loading: {
      required: false,
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    value: 0,
    comment: '',
  }),

  watch: {
    keyResult: {
      immediate: true,
      async handler() {
        if (this.value !== null) {
          this.value = this.keyResult.currentValue || this.keyResult.startValue || 0;
        }
      },
    },
  },

  methods: {
    submitForm() {
      this.$emit('save', this.value, this.comment);
      this.value = null;
      this.comment = '';
    },
  },
};
</script>

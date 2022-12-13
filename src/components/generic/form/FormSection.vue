<template>
  <validation-observer v-slot="{ errors, valid, validated }" ref="form" tag="form">
    <slot />

    <div v-if="validated && !valid" class="ok-alert ok-alert--danger form-errors">
      <div class="form-errors__title">{{ $t('general.formErrors') }}</div>
      <ul v-if="errors" class="form-errors__list">
        <template v-for="(fieldErrors, fieldName) in errors">
          <li v-if="fieldErrors.length" :key="fieldName">
            <span>{{ $t('fields.' + fieldName) }}</span>
            <span>{{ fieldErrors[0] }}</span>
          </li>
        </template>
      </ul>
    </div>

    <div class="button-row">
      <slot
        name="actions"
        :handle-submit="submitAndReset"
        :submit-disabled="validated && !valid"
        :errors="errors"
      />
    </div>
  </validation-observer>
</template>

<script>
export default {
  name: 'FormSection',

  methods: {
    async submitAndReset(handler) {
      const { validate } = this.$refs.form;
      const isValid = await validate();

      if (!isValid || !handler) {
        return undefined;
      }

      const result = handler();
      this.$refs.form.reset();
      return result;
    },
  },
};
</script>

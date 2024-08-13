<template>
  <form ref="form" class="form">
    <slot />

    <div class="button-row">
      <slot
        name="actions"
        :submit="submit"
        :reset="reset"
        :disabled="isValidated && !meta.valid"
        :errors="errors"
      />
    </div>
  </form>
</template>

<script>
import { computed } from 'vue';
import { useForm } from 'vee-validate';

export default {
  compatConfig: { MODE: 3 },

  provide() {
    return {
      formIsValidated: computed(() => this.isValidated),
    };
  },

  setup() {
    const { values, errors, meta, validate, resetForm } = useForm();
    return { values, errors, meta, validate, resetForm };
  },

  data: () => ({
    isValidated: false,
  }),

  methods: {
    async submit(handler) {
      const { valid } = await this.validate();
      this.isValidated = true;

      if (!valid || !handler) {
        return undefined;
      }

      return handler(this.values);
    },

    reset() {
      this.isValidated = false;
      this.resetForm();
    },
  },
};
</script>

<style lang="scss" scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.button-row {
  margin-top: 1rem;
}
</style>

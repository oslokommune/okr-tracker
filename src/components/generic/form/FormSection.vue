<script setup>
import { computed, defineExpose, provide, ref } from 'vue';
import { useForm } from 'vee-validate';

const props = defineProps({
  keepValues: {
    type: Boolean,
    required: false,
    default: true,
  },
});

const { values, errors, meta, validate, resetForm } = useForm({
  // Keep values from unmounted fields (e.g. when conditionally
  // rendered in multi-step forms).
  keepValuesOnUnmount: props.keepValues,
});
const isValidated = ref(false);
const formIsValidated = computed(() => isValidated.value);

provide('formIsValidated', formIsValidated);

async function submit(handler) {
  const { valid } = await validate();
  isValidated.value = true;

  if (!valid || !handler) {
    return undefined;
  }

  return handler(values);
}

function reset() {
  isValidated.value = false;
  resetForm();
}

defineExpose({ reset });
</script>

<template>
  <form class="form" @submit="$event.preventDefault()">
    <slot name="default" :values="values" />

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

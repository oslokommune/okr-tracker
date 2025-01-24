<script setup>
import { ref, watchEffect } from 'vue';
import { BtnSave } from '@/components/generic/form';
import ModalWrapper from './ModalWrapper.vue';

const props = defineProps({
  client: {
    type: Object,
    required: false,
    default: null,
  },
});

const emit = defineEmits(['save', 'close']);

const name = ref(null);
const description = ref(null);

watchEffect(() => {
  if (props.client) {
    name.value = props.client.name;
    description.value = props.client.description;
  }
});

function save() {
  emit('save', props.client, {
    name: name.value,
    description: description.value || '',
  });
  close();
}

function close() {
  emit('close');
}
</script>

<template>
  <ModalWrapper @close="close">
    <template #header>
      {{ $t(`integration.action.${client ? 'edit' : 'add'}`) }}
    </template>

    <FormSection>
      <FormComponent
        v-model="name"
        input-type="input"
        name="name"
        :label="$t('fields.name')"
        type="text"
        rules="required"
      />

      <FormComponent
        v-model="description"
        input-type="textarea"
        name="description"
        :rows="2"
        :label="$t('fields.description')"
      />

      <template #actions="{ submit, disabled }">
        <BtnSave :disabled="disabled" @on-click="submit(save)" />
      </template>
    </FormSection>
  </ModalWrapper>
</template>

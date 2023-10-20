<template>
  <modal-wrapper @close="close">
    <template #header>
      {{ $t(`integration.action.${client ? 'edit' : 'add'}`) }}
    </template>

    <form-section :hide-errors="true">
      <form-component
        v-model="name"
        input-type="input"
        name="name"
        :label="$t('fields.name')"
        type="text"
        rules="required"
      />

      <form-component
        v-model="description"
        input-type="textarea"
        name="description"
        :rows="2"
        :label="$t('fields.description')"
      />

      <template #actions="{ handleSubmit, submitDisabled }">
        <btn-save :disabled="submitDisabled" @click="handleSubmit(save)" />
      </template>
    </form-section>
  </modal-wrapper>
</template>

<script>
import { FormSection, BtnSave } from '@/components/generic/form';
import ModalWrapper from './ModalWrapper.vue';

export default {
  name: 'ApiClientModal',

  components: {
    ModalWrapper,
    FormSection,
    BtnSave,
  },

  props: {
    client: {
      type: Object,
      required: false,
      default: null,
    },
  },

  data: () => ({
    name: null,
    description: null,
  }),

  watch: {
    client: {
      immediate: true,
      async handler(client) {
        if (client) {
          this.name = client.name;
          this.description = client.description;
        } else {
          this.name = this.$t('integration.placeholderTitle');
          this.description = '';
        }
      },
    },
  },

  methods: {
    save() {
      this.$emit('save', this.client, {
        name: this.name,
        description: this.description,
      });
      this.close();
    },

    close() {
      this.$emit('close');
    },
  },
};
</script>

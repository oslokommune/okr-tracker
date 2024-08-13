<template>
  <form-section>
    <form-component
      v-model="localUser.displayName"
      name="name"
      :label="$t('fields.name')"
      rules="required"
    />

    <form-component
      v-model="localUser.position"
      input-type="custom-select"
      name="position"
      :label="$t('user.position.title')"
      rules="required"
      value-prop="position"
      label-prop="label"
      :options="positionOptions"
      append-to-body
    />

    <form-component
      v-model="localUser.preferences.lang"
      input-type="custom-select"
      name="language"
      :label="$t('user.language')"
      rules="required"
      value-prop="language"
      label-prop="label"
      :options="languageOptions"
      append-to-body
    />

    <template #actions="{ submit, disabled }">
      <btn-save
        :disabled="disabled || loading"
        @on-click="submit(() => $emit('save', localUser))"
      />
    </template>
  </form-section>
</template>

<script>
import { FormSection, BtnSave } from '@/components/generic/form';
import { jobPositions } from '@/config/jobPositions';

export default {
  name: 'UserProfileForm',

  compatConfig: { MODE: 3 },

  components: {
    FormSection,
    BtnSave,
  },

  props: {
    user: {
      required: true,
      type: Object,
    },
    loading: {
      required: false,
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    localUser: null,
    jobPositions,
  }),

  computed: {
    positionOptions() {
      return this.jobPositions.map((position) => ({
        position,
        label: this.$t(`user.position.${position}`),
      }));
    },
    languages() {
      return Object.keys(this.$i18n.messages);
    },
    languageOptions() {
      return this.languages.map((language) => ({
        language,
        label: this.$t(`languages.${language}`),
      }));
    },
  },

  watch: {
    user: {
      immediate: true,
      handler() {
        if (this.user) {
          this.localUser = { ...this.user, id: this.user.id };
        }
      },
    },
  },
};
</script>

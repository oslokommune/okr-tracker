<template>
  <form-section>
    <form-component
      v-model="localUser.displayName"
      input-type="input"
      name="name"
      :label="$t('fields.name')"
      rules="required"
    />

    <form-component
      v-model="localUser.position"
      input-type="select"
      name="position"
      :label="$t('user.position.title')"
      rules="required"
      select-label="label"
      :select-options="positionOptions"
      :select-reduce="(option) => option.position"
      type="text"
    />

    <form-component
      v-model="localUser.preferences.lang"
      input-type="select"
      name="language"
      :label="$t('user.language')"
      rules="required"
      select-label="label"
      :select-options="languageOptions"
      :select-reduce="(option) => option.language"
      type="text"
    />

    <template #actions="{ handleSubmit, submitDisabled }">
      <btn-save :disabled="submitDisabled || loading" @click="handleSubmit(submitForm)" />
    </template>
  </form-section>
</template>

<script>
import { FormSection, BtnSave } from '@/components/generic/form';
import { jobPositions } from '@/config/jobPositions';

export default {
  name: 'UserProfileForm',

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

  methods: {
    submitForm() {
      this.$emit('save', this.localUser);
    },
  },
};
</script>

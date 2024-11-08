<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { FormSection, BtnSave } from '@/components/generic/form';
import { jobPositions } from '@/config/jobPositions';

const i18n = useI18n();

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    required: false,
    default: false,
  },
});

defineEmits(['save']);

const formData = ref(null);

const positionOptions = computed(() =>
  jobPositions.map((position) => ({
    position,
    label: i18n.t(`user.position.${position}`),
  }))
);

const languageOptions = computed(() =>
  Object.keys(i18n.messages.value).map((language) => ({
    language,
    label: i18n.t(`languages.${language}`),
  }))
);

watch(
  props.user,
  () => {
    const { displayName, position, preferences } = props.user;
    const { lang } = preferences;
    formData.value = {
      displayName,
      position,
      lang,
    };
  },
  { immediate: true }
);
</script>

<template>
  <FormSection>
    <FormComponent
      v-model="formData.displayName"
      name="name"
      :label="$t('fields.name')"
      rules="required"
    />

    <FormComponent
      v-model="formData.position"
      input-type="custom-select"
      name="position"
      :label="$t('user.position.title')"
      rules="required"
      value-prop="position"
      label-prop="label"
      :options="positionOptions"
      :can-clear="false"
      append-to-body
    />

    <FormComponent
      v-model="formData.lang"
      input-type="custom-select"
      name="language"
      :label="$t('user.language')"
      rules="required"
      value-prop="language"
      label-prop="label"
      :options="languageOptions"
      :can-clear="false"
      append-to-body
    />

    <template #actions="{ submit, disabled }">
      <BtnSave
        :disabled="disabled || loading"
        @on-click="submit(() => $emit('save', formData))"
      />
    </template>
  </FormSection>
</template>

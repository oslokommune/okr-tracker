<script setup>
import { ref } from 'vue';
import { email } from '@vee-validate/rules';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toast-notification';
import User from '@/db/User';
import { BtnSave } from '@/components/generic/form';

const toast = useToast();
const i18n = useI18n();

const emit = defineEmits(['close']);

const emails = ref('');
const isLoading = ref(false);

async function save() {
  isLoading.value = true;
  const list = emails.value.trim().split('\n').filter(Boolean).filter(email);

  if (!list.length) {
    toast.error(i18n.t('toaster.error.email'));
    isLoading.value = false;
    return;
  }

  try {
    await User.addUsers(list);
    toast.success(i18n.t('toaster.add.users', list.length, { count: list.length }));
    emit('close');
  } catch (error) {
    toast.error(i18n.t('toaster.error.users', list.length));
    throw new Error(error);
  }

  isLoading.value = false;
}
</script>

<template>
  <slot name="back"></slot>

  <div class="add-users mt-size-16">
    <h2 class="pkt-txt-22 mb-size-16">
      {{ $t('admin.users.registerUsersButton') }}
    </h2>

    <FormSection>
      <FormComponent
        v-model="emails"
        input-type="textarea"
        name="emails"
        rules="required"
        :label="$t('admin.users.registerUsersText')"
        class="add-users__input"
      />

      <template #actions="{ submit, disabled }">
        <BtnSave
          :disabled="disabled || isLoading"
          :text="$t('admin.users.registerUsersButton')"
          @on-click="submit(save)"
        />
      </template>
    </FormSection>
  </div>
</template>

<style lang="scss" scoped>
.add-users {
  padding: 1rem;
  background: var(--color-gray-light);
}
</style>

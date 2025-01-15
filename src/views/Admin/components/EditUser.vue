<script setup>
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toast-notification';
import { useAuthStore } from '@/store/auth';
import { useTrackerStore } from '@/store/tracker';
import { useTrackerUser } from '@/composables/user';
import User from '@/db/User';
import { BtnSave, BtnDelete } from '@/components/generic/form';

const toast = useToast();
const i18n = useI18n();

const props = defineProps({
  userId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['close']);

const { organizations } = storeToRefs(useTrackerStore());
const { user: currentUser, isSuperAdmin } = storeToRefs(useAuthStore());
const { user } = useTrackerUser(props.userId);
const isCurrentUser = computed(
  () => user.value && currentUser.value && user.value.id === currentUser.value.id
);
const formData = ref(null);
const isLoading = ref(false);

watch(
  user,
  () => {
    if (user.value) {
      const { id, displayName, admin, superAdmin } = user.value;

      formData.value = {
        id,
        displayName,
        admin:
          admin && admin.length
            ? admin
                .filter((oid) => organizations.value.map((o) => o.id).includes(oid))
                .map((oid) => ({
                  id: oid,
                  name: organizations.value.find((o) => o.id === oid).name,
                }))
            : [],
        superAdmin: superAdmin || false,
      };
    }
  },
  { immediate: true }
);

async function update() {
  isLoading.value = true;
  try {
    await User.update(user.value, {
      ...formData.value,
      admin: formData.value.admin.map((org) => org.id),
    });
    toast.success(i18n.t('toaster.savedChanges'));
  } catch {
    toast.error(i18n.t('toaster.error.save'));
  }
  isLoading.value = false;
}

async function remove() {
  isLoading.value = true;
  const { displayName } = user.value;
  try {
    await User.remove(user.value);
    toast.success(i18n.t('toaster.delete.user', { user: displayName }));
    emit('close');
  } catch {
    toast.error(i18n.t('toaster.error.user', { user: displayName }));
  }
  isLoading.value = false;
}
</script>

<template>
  <slot name="back"></slot>

  <div class="edit-user mt-size-16">
    <h2 class="pkt-txt-22 mb-size-16">
      {{ $t('admin.users.edit') }}
    </h2>

    <FormSection v-if="user">
      <FormComponent
        v-model="formData.id"
        input-type="input"
        name="id"
        :label="$t('fields.email')"
        rules="required"
        type="email"
        :disabled="true"
      />

      <FormComponent
        v-model="formData.displayName"
        input-type="input"
        name="displayName"
        :label="$t('fields.displayName')"
        rules="required"
        type="text"
      />

      <FormComponent
        v-model="formData.admin"
        input-type="custom-select"
        select-mode="tags"
        name="admin"
        :disabled="!isSuperAdmin"
        :label="$t('general.admin')"
        value-prop="id"
        label-prop="name"
        :store-object="true"
        :options="organizations.map(({ id, name }) => ({ id, name }))"
      />

      <FormComponent
        v-model="formData.superAdmin"
        input-type="switch"
        name="superadmin"
        :label="$t('general.superAdmin')"
        :disabled="isCurrentUser || !isSuperAdmin"
      />

      <template #actions="{ submit, disabled }">
        <BtnDelete :disabled="isCurrentUser || isLoading" @on-click="remove" />
        <BtnSave :disabled="disabled || isLoading" @on-click="submit(update)" />
      </template>
    </FormSection>
  </div>
</template>

<style lang="scss" scoped>
.edit-user {
  padding: 1rem;
  background: var(--color-gray-light);
}
</style>

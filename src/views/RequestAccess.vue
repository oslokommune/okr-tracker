<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toast-notification';
import api from '@/util/api';
import '@oslokommune/punkt-elements/dist/pkt-alert.js';
import '@oslokommune/punkt-elements/dist/pkt-backlink.js';
import { BtnSave } from '@/components/generic/form';
import BuildingsGraphic from '@/components/graphics/BuildingsGraphic.vue';

const router = useRouter();
const i18n = useI18n();
const toast = useToast();

const loading = ref(false);
const errorMessage = ref(null);

async function requestAccess({ email }, resetForm) {
  loading.value = true;
  try {
    const { message } = await api(`/accessRequests/create`, {
      method: 'post',
      body: { email },
    });
    toast.success(i18n.t(message, { user: email }));
    await router.push({ name: 'Login' });
  } catch (error) {
    toast.error(i18n.t(error.message, { user: email }));
    resetForm();
  }
  loading.value = false;
}
</script>

<template>
  <PageLayout breakpoint="phablet">
    <RouterLink v-slot="{ href, navigate }" :to="{ name: 'Login' }" custom>
      <pkt-backlink
        :href="href"
        :text="$t('login.backToLogin')"
        class="mb-size-22"
        @click="navigate"
      />
    </RouterLink>

    <h1 class="title-1">{{ $t('login.requestAccess') }}</h1>

    <pkt-alert v-if="errorMessage" skin="error" class="mb-size-32">
      {{ errorMessage }}
    </pkt-alert>

    <FormSection>
      <FormComponent
        input-type="input"
        name="email"
        :label="$t('login.email')"
        rules="required|email"
        type="email"
      />

      <template #actions="{ submit, reset, disabled }">
        <BtnSave
          variant="label-only"
          :disabled="disabled || loading"
          :text="$t('login.requestButton')"
          size="small"
          @click="submit((values) => requestAccess(values, reset))"
        />
      </template>
    </FormSection>

    <template #footer>
      <BuildingsGraphic skin="dim" />
    </template>
  </PageLayout>
</template>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;

.page {
  background-color: var(--pkt-color-background-subtle);

  @include bp('tablet-up') {
    :deep(.page__main) {
      padding: 1.5rem;
      background: var(--pkt-color-background-default);
    }
  }
}
</style>

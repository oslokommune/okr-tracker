<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useHead } from 'unhead';
import { PktAlert, PktButton } from '@oslokommune/punkt-vue';
import { loginProviderGoogle, loginProviderMS } from '@/config/firebaseConfig';
import { useAuthStore } from '@/store/auth';
import { BtnSave } from '@/components/generic/form';
import LoadingSmall from '@/components/LoadingSmall.vue';

const i18n = useI18n();

useHead({
  title: `${i18n.t('login.login')} | ${i18n.t('general.project')}`,
});

const authStore = useAuthStore();
const { isAuthenticating, authenticationProviders, authenticationError } =
  storeToRefs(authStore);
const { signInWithProvider, signInWithEmail } = authStore;

const showForm = ref(false);

const authenticationErrorMessage = computed(() => {
  switch (authenticationError.value) {
    case 1:
      return i18n.t('login.error.notRegistered');
    case 2:
      return i18n.t('login.error.providerError');
    case 3:
      return i18n.t('login.error.wrongPassword');
    case 4:
      return i18n.t('login.error.userNotFound');
    case 5:
      return i18n.t('login.error.userAbort');
    default:
      return null;
  }
});

async function loginWithProvider(provider) {
  showForm.value = false;
  await signInWithProvider(provider);
}
</script>

<template>
  <page-layout breakpoint="phablet">
    <h1 class="title-1">{{ $t('login.login') }}</h1>

    <div v-if="isAuthenticating && authenticationError === null">
      <LoadingSmall /> {{ $t('login.loading') }}
    </div>

    <PktAlert
      v-else-if="authenticationError"
      skin="error"
      :close-alert="true"
      class="mb-size-32"
    >
      {{ authenticationErrorMessage }}

      <RouterLink v-if="authenticationError === 1" :to="{ name: 'request-access' }">
        {{ $t('login.requestAccess') }}
      </RouterLink>
    </PktAlert>

    <FormSection v-if="showForm" class="login__form">
      <FormComponent
        input-type="input"
        name="email"
        :label="$t('login.email')"
        rules="required|email"
        type="email"
      />

      <FormComponent
        input-type="input"
        name="password"
        :label="$t('login.password')"
        rules="required"
        type="password"
      />

      <template #actions="{ submit, disabled }">
        <BtnSave
          variant="label-only"
          :disabled="disabled || isAuthenticating"
          :text="$t('login.login')"
          @on-click="submit(({ email, password }) => signInWithEmail(email, password))"
        />
      </template>
    </FormSection>

    <div v-if="!isAuthenticating || authenticationError !== null" class="login__footer">
      <PktButton
        v-if="authenticationProviders.includes('microsoft')"
        @on-click="loginWithProvider(loginProviderMS)"
      >
        {{ $t('login.microsoft') }}
      </PktButton>

      <PktButton
        v-if="authenticationProviders.includes('google')"
        @on-click="loginWithProvider(loginProviderGoogle)"
      >
        {{ $t('login.google') }}
      </PktButton>

      <PktButton
        v-if="authenticationProviders.includes('email')"
        skin="secondary"
        @on-click="showForm = true"
      >
        {{ $t('login.loginWithUsername') }}
      </PktButton>

      <RouterLink :to="{ name: 'request-access' }">
        <PktButton skin="secondary">
          {{ $t('login.requestAccess') }}
        </PktButton>
      </RouterLink>
    </div>
  </page-layout>
</template>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;

@include bp('tablet-up') {
  :deep(.page__main) {
    padding: 1.5rem;
    background: var(--color-gray-light);
  }
}

.login__form {
  padding-bottom: 2rem;
  border-bottom: 2px solid var(--color-grayscale-10);
}

.login__footer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem 0.5rem;
  margin-top: 2rem;

  button {
    width: 100%;
  }
}
</style>

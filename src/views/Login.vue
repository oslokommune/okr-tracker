<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useHead } from '@unhead/vue';
import { PktAlert, PktButton, PktLoader } from '@oslokommune/punkt-vue';
import { loginProviderGoogle, loginProviderMS } from '@/config/firebaseConfig';
import { useAuthStore } from '@/store/auth';
import { BtnSave } from '@/components/generic/form';
import BuildingsGraphic from '@/components/graphics/BuildingsGraphic.vue';

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
  <PageLayout breakpoint="phablet">
    <h1 class="title-1">{{ $t('login.login') }}</h1>

    <div v-if="isAuthenticating && authenticationError === null" class="login__loading">
      <PktLoader :message="$t('login.loading')" size="large" variant="blue" inline />
    </div>

    <PktAlert
      v-else-if="authenticationError"
      skin="error"
      :close-alert="true"
      class="mb-size-32"
    >
      {{ authenticationErrorMessage }}

      <RouterLink v-if="authenticationError === 1" :to="{ name: 'RequestAccess' }">
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

    <div
      v-if="!isAuthenticating || authenticationError !== null"
      class="login__providers"
    >
      <PktButton
        v-if="authenticationProviders.includes('microsoft')"
        size="small"
        @on-click="loginWithProvider(loginProviderMS)"
      >
        {{ $t('login.microsoft') }}
      </PktButton>

      <PktButton
        v-if="authenticationProviders.includes('google')"
        size="small"
        @on-click="loginWithProvider(loginProviderGoogle)"
      >
        {{ $t('login.google') }}
      </PktButton>

      <PktButton
        v-if="authenticationProviders.includes('email')"
        size="small"
        skin="secondary"
        @on-click="showForm = true"
      >
        {{ $t('login.loginWithUsername') }}
      </PktButton>

      <div class="login__sep">{{ $t('general.or') }}</div>

      <RouterLink :to="{ name: 'RequestAccess' }">
        <PktButton skin="secondary" size="small">
          {{ $t('login.requestAccess') }}
        </PktButton>
      </RouterLink>
    </div>

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

.login__form {
  padding-bottom: 2rem;
  border-bottom: 2px solid var(--color-grayscale-10);
}

.login__providers {
  display: flex;
  flex-direction: column;
  gap: 0.5rem 0.5rem;
  margin-top: 2rem;

  button {
    width: 100%;
  }
}

.login__sep {
  padding: 0.5rem 0;
  color: var(--pkt-color-grays-gray-500);
  font-style: italic;
  text-align: center;
}

.login__loading {
  text-align: center;
}
</style>

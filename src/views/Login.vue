<template>
  <page-layout breakpoint="phablet">
    <h1 class="title-1">{{ $t('login.login') }}</h1>

    <div v-if="loginLoading && loginError === null">
      <LoadingSmall /> {{ $t('login.loading') }}
    </div>

    <PktAlert v-else-if="loginError" skin="error">
      {{ loginErrorMessage }}

      <RouterLink v-if="loginError === 1" :to="{ name: 'request-access' }">
        {{ $t('login.requestAccess') }}
      </RouterLink>
    </PktAlert>

    <FormSection v-if="showForm" class="login__form">
      <FormComponent
        v-model="email"
        input-type="input"
        name="email"
        :label="$t('login.email')"
        rules="required|email"
        type="email"
      />

      <FormComponent
        v-model="password"
        input-type="input"
        name="password"
        :label="$t('login.password')"
        rules="required"
        type="password"
      />

      <template #actions="{ submit, disabled }">
        <BtnSave
          variant="label-only"
          :disabled="disabled || loginLoading"
          :text="$t('login.login')"
          @on-click="submit(loginWithEmail)"
        />
      </template>
    </FormSection>

    <div v-if="!loginLoading || loginError !== null" class="login__footer">
      <PktButton v-if="providers.includes('microsoft')" @onClick="loginWithMicrosoft">
        {{ $t('login.microsoft') }}
      </PktButton>

      <PktButton v-if="providers.includes('google')" @onClick="loginWithGoogle">
        {{ $t('login.google') }}
      </PktButton>

      <PktButton
        v-if="providers.includes('email')"
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

<script>
import { mapState, mapActions } from 'vuex';
import { PktAlert, PktButton } from '@oslokommune/punkt-vue';
import { auth, loginProviderGoogle, loginProviderMS } from '@/config/firebaseConfig';
import { BtnSave } from '@/components/generic/form';
import LoadingSmall from '@/components/LoadingSmall.vue';

export default {
  name: 'Login',

  components: {
    PktAlert,
    PktButton,
    BtnSave,
    LoadingSmall,
  },

  data: () => ({
    email: '',
    password: '',
    showForm: false,
  }),

  head() {
    return {
      title: ` ${this.$t('general.project')} | ${this.$t('general.owner')}`,
    };
  },

  computed: {
    ...mapState(['user', 'loginError', 'providers', 'loginLoading']),

    loginErrorMessage() {
      if (this.loginError === 1) {
        return this.$t('login.error.notRegistered');
      }
      if (this.loginError === 2) {
        return this.$t('login.error.providerError');
      }
      if (this.loginError === 3) {
        return this.$t('login.error.wrongPassword');
      }
      if (this.loginError === 4) {
        return this.$t('login.error.userNotFound');
      }
      return null;
    },
  },

  methods: {
    ...mapActions(['setLoginLoading', 'setLoginError']),

    async loginWithMicrosoft() {
      this.showForm = false;
      await this.setLoginLoading(true);
      await this.setLoginError(null);

      try {
        const { user } = await auth.signInWithPopup(loginProviderMS);
        this.$toasted.show(
          this.$t('toaster.welcome', { user: user.displayName ? user.displayName : '' })
        );
      } catch (e) {
        console.log(e);
        await this.setLoginError(2);
      }
      await this.setLoginLoading(false);
    },

    async loginWithGoogle() {
      this.showForm = false;
      await this.setLoginLoading(true);
      await this.setLoginError(null);

      try {
        const { user } = await auth.signInWithPopup(loginProviderGoogle);
        this.$toasted.show(
          this.$t('toaster.welcome', { user: user.displayName ? user.displayName : '' })
        );
      } catch (e) {
        await this.setLoginError(2);
      }
      await this.setLoginLoading(false);
    },

    async loginWithEmail() {
      await this.setLoginLoading(true);
      await this.setLoginError(null);

      try {
        await auth.signInWithEmailAndPassword(this.email, this.password);
      } catch (err) {
        console.log(err);
        await this.setLoginLoading(false);
        if (err.code === 'auth/wrong-password') {
          await this.setLoginError(3);
        } else if (err.code === 'auth/user-not-found') {
          await this.setLoginError(4);
        }
      }
    },
  },
};
</script>

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

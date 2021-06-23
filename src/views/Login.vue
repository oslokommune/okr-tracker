<template>
  <div class="main">
    <div class="login">
      <h1 class="title-1">{{ $t('login.login') }}</h1>
      <div v-if="loginLoading && loginError === null">
        <loading-small></loading-small>
        {{ $t('login.loading') }}
      </div>
      <div v-else class="section">
        <div v-if="loginError === 1" class="error">
          {{ $t('login.error.notRegistered') }}
        </div>

        <div v-if="loginError === 2" class="error">
          {{ $t('login.error.googleError') }}
        </div>
      </div>
      <div v-if="showForm" class="login__form">
        <div v-if="loginError === 3" class="error">{{ $t('login.error.wrongPassword') }}</div>

        <div v-if="loginError === 4" class="error">
          {{ $t('login.error.userNotFound') }}
        </div>
        <validation-observer v-slot="{ handleSubmit }">
          <form id="login" @submit.prevent="handleSubmit(loginWithEmail)">
            <form-component
              v-model="email"
              :label="$t('login.email')"
              input-type="input"
              name="email"
              rules="required|email"
              type="email"
              data-cy="login-username-input"
            />

            <form-component
              v-model="password"
              :label="$t('login.password')"
              input-type="input"
              name="password"
              rules="required"
              type="password"
              data-cy="login-username-password"
            />
          </form>
        </validation-observer>
        <button class="btn btn--pri" form="login">{{ $t('login.login') }}</button>
      </div>

      <div v-if="!loginLoading || loginError !== null" class="login__footer">
        <button v-if="providers.includes('google')" class="btn btn--icon btn--pri" @click="loginWithGoogle">
          <i class="icon fab fa-fw fa-google" />
          {{ $t('login.google') }}
        </button>

        <button
          v-if="providers.includes('keycloak')"
          class="btn btn--pri"
          data-cy="login-username"
          @click="loginWithKeycloak"
        >
          {{ getKeycloakText }}
        </button>

        <button
          v-if="providers.includes('email')"
          class="btn btn--ghost"
          data-cy="login-username"
          @click="showForm = true"
        >
          {{ $t('login.loginWithUsername') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { auth, functions, loginProvider } from '@/config/firebaseConfig';
import i18n from '@/locale/i18n';
import LoadingSmall from '@/components/LoadingSmall.vue';

export default {
  name: 'Login',

  components: { LoadingSmall },

  data: () => ({
    email: '',
    password: '',
    showForm: false,
  }),

  metaInfo() {
    return {
      title: ` ${i18n.t('general.project')} | ${i18n.t('general.owner')}`,
    };
  },

  computed: {
    ...mapState(['user', 'loginError', 'providers', 'keycloak', 'authenticated', 'loginLoading']),

    getKeycloakText() {
      if (process.env.VUE_APP_KEYCLOAK_SIGN_IN_TEXT) {
        return this.$t('login.with', { provider: process.env.VUE_APP_KEYCLOAK_SIGN_IN_TEXT });
      }
      return this.$t('login.keycloak');
    },
  },

  watch: {
    authenticated: {
      immediate: true,
      async handler() {
        if (this.providers.includes('keycloak') && this.authenticated) {
          await this.setLoginLoading(true);
          await this.setLoginError(null);
          try {
            const myCall = functions.httpsCallable('createCustomToken');
            const customToken = await myCall(this.keycloak.token);
            await auth.signInWithCustomToken(customToken.data);
            await this.setLoginLoading(false);
            this.$toasted.show(this.$t('toaster.welcome', { user: this.keycloak.idTokenParsed.name }));
          } catch (e) {
            this.keycloak.logout({ redirectUri: `${process.env.VUE_APP_KEYCLOAK_ERROR_URL}${e.code}` });
          }
        }
      },
    },
  },

  methods: {
    ...mapActions(['initKeycloak', 'cleanKeycloak', 'setLoading', 'setLoginLoading', 'setLoginError']),

    async loginWithKeycloak() {
      await this.setLoginLoading(true);
      await this.setLoginError(null);
      try {
        await this.keycloak.login();
      } catch (e) {
        throw new Error(e);
      }
      await this.setLoginLoading(false);
    },

    async loginWithGoogle() {
      await this.setLoginLoading(true);
      await this.setLoginError(null);
      try {
        const { user } = await auth.signInWithPopup(loginProvider);
        this.$toasted.show(this.$t('toaster.welcome', { user: user.displayName ? user.displayName : '' }));
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
@import '../styles/_colors.scss';

.login {
  display: flex;
  flex-direction: column;
  width: span(12);
  padding: 2rem;
  background: white;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba($color-grey-400, 0.3);

  @media screen and (min-width: bp(m)) {
    width: span(4);
  }

  @media screen and (min-width: bp(s)) {
    width: span(6);
  }
}

.login__form {
  padding-bottom: 2rem;
  border-bottom: 1px solid $color-grey-100;
}

.login__footer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem 0.5rem;
  margin-top: 2rem;
}

.login__secondary {
  display: flex;
  flex-wrap: wrap;
  margin: 1.75rem -0.25rem -0.25rem;

  & > .btn {
    margin: 0.25rem;
  }
}

.error {
  margin: 1.5rem 0;
  padding: 1em 1.5em;
  color: black;
  background: rgba($color-red, 0.25);
  border: 1px solid $color-red;
  border-radius: 2px;
}
</style>

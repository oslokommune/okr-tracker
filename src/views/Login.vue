<template>
  <div class="wrapper">
    <div class="login">
      <h1 class="title-1">{{ $t('login.login') }}</h1>
      <div class="sections">
        <div class="section">
          <div v-if="loginError === 1" class="error">
            {{ $t('login.error.notRegistered') }}

            <router-link :to="{ name: 'request-access' }">{{ $t('login.requestAccess') }} </router-link>
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

        <div class="login__footer">
          <button v-if="providers.includes('google')" class="btn btn--icon btn--pri" @click="loginWithGoogle">
            <i class="icon fab fa-fw fa-google" />
            {{ $t('login.google') }}
          </button>

          <div class="login__secondary">
            <button
              v-if="providers.includes('keycloak')"
              class="btn btn--ghost"
              data-cy="login-username"
              @click="loginWithKeycloak"
            >
              {{ 'Login with Keycloak' }}
            </button>
            <button
              v-if="providers.includes('keycloak')"
              class="btn btn--ghost"
              data-cy="login-username"
              @click="logout"
            >
              {{ 'LogOut' }}
            </button>
            <button
              v-if="providers.includes('email')"
              class="btn btn--ghost"
              data-cy="login-username"
              @click="showForm = true"
            >
              {{ $t('login.loginWithUsername') }}
            </button>
            <router-link class="btn btn--ghost" :to="{ name: 'request-access' }" data-cy="login-request">
              {{ $t('login.requestAccess') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState, mapActions } from 'vuex';
import { auth, functions, loginProvider } from '@/config/firebaseConfig';
import i18n from '@/locale/i18n';

export default {
  name: 'Login',

  data: () => ({
    email: '',
    password: '',
    pending: false,
    showForm: false,
  }),

  metaInfo() {
    return {
      title: ` ${i18n.t('general.project')} | ${i18n.t('general.owner')}`,
    };
  },

  computed: {
    ...mapState(['user', 'loginError', 'providers', 'keycloak', 'authenticated']),
  },

  async mounted() {
    if (this.providers.includes('keycloak')) {
      if (this.authenticated) {
        const myCall = functions.httpsCallable('createCustomToken');
        const test = await myCall(this.keycloak.idTokenParsed);
        await auth.signInWithCustomToken(test.data);
      }
    }
  },

  methods: {
    ...mapMutations(['SET_LOGIN_ERROR']),
    ...mapActions(['initKeycloak', 'cleanKeycloak', 'setLoading']),

    async loginWithKeycloak() {
      this.pending = true;
      try {
        await this.keycloak.login();
      } catch (e) {
        throw new Error(e);
      }
    },

    async logout() {
      await this.cleanKeycloak();
    },

    async loginWithGoogle() {
      this.pending = true;
      try {
        const user = await auth.signInWithPopup(loginProvider);
        this.$toasted.show(this.$t('toaster.welcome', { user: user.name ? user.name : '' }));
      } catch (e) {
        this.pending = false;
        this.SET_LOGIN_ERROR(2);
      }
    },

    async loginWithEmail() {
      this.pending = true;

      try {
        await auth.signInWithEmailAndPassword(this.email, this.password);
      } catch (err) {
        console.log(err);
        this.pending = false;
        if (err.code === 'auth/wrong-password') {
          this.SET_LOGIN_ERROR(3);
        } else if (err.code === 'auth/user-not-found') {
          this.SET_LOGIN_ERROR(4);
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
  width: span(10);
  margin-left: span(1, 1);
  padding: 2rem;
  background: white;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba($color-grey-400, 0.3);

  @media screen and (min-width: bp(xs)) {
    width: span(8);
    margin-top: 2rem;
    margin-left: span(2, 1);
  }

  @media screen and (min-width: bp(s)) {
    width: span(6);
    margin-top: 3rem;
    margin-left: 0;
  }

  @media screen and (min-width: bp(m)) {
    width: span(5, 0, span(9));
    margin-top: 5rem;
  }

  @media screen and (min-width: bp(l)) {
    width: span(4, 0, span(10));
  }
}

.login__form {
  padding-bottom: 2rem;
  border-bottom: 1px solid $color-grey-100;
}

.login__footer {
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

<template>
  <div class="wrapper">
    <div class="login">
      <h1 class="title-1">{{ $t('login.login') }}</h1>
      <div class="sections">
        <div class="section">
          <div v-if="loginError === 1" class="error">
            {{ $t('login.error.notRegistered') }}

            <router-link :to="{ name: 'request-access' }">{{ $t('login.requestAccess') }}</router-link
            >.
          </div>

          <div v-if="loginError === 2" class="error">
            {{ $t('login.error.googleError') }}
          </div>
        </div>
        <div class="login__form">
          <div v-if="loginError === 3" class="error">{{ $t('login.error.wrongPassword') }}</div>
          <validation-observer v-slot="{ handleSubmit }">
            <form id="login" @submit.prevent="handleSubmit(loginWithEmail)">
              <validation-provider name="email" rules="required|email" v-slot="{ errors }">
                <label class="form-group">
                  <span class="form-label">{{ $t('login.email') }}</span>
                  <input class="form__field" type="email" v-model="email" />
                </label>
                <div class="form-field--error">{{ errors[0] }}</div>
              </validation-provider>

              <validation-provider name="password" rules="required" v-slot="{ errors }">
                <label class="form-field">
                  <span class="form-label">{{ $t('login.password') }}</span>
                  <input class="form__field" type="password" v-model="password" />
                </label>
                <div class="form-field--error">{{ errors[0] }}</div>
              </validation-provider>
            </form>
          </validation-observer>
          <button class="btn btn--pri" form="login">{{ $t('login.login') }}</button>
        </div>

        <div class="login__footer">
          <button class="btn btn--ghost btn--icon" @click="loginWithGoogle">
            <span class="icon fab fa-fw fa-google"></span>
            {{ $t('login.google') }}
          </button>
          <router-link class="btn btn--pri" :to="{ name: 'request-access' }">{{
            $t('login.requestAccess')
          }}</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import { extend } from 'vee-validate';
import { required, email } from 'vee-validate/dist/rules';
import { auth, loginProvider } from '@/config/firebaseConfig';
import i18n from '@/locale/i18n';

extend('email', email);
extend('required', required);

export default {
  data: () => ({
    email: '',
    password: '',
    pending: false,
  }),

  metaInfo() {
    return {
      title: ` ${i18n.t('general.project')} | ${i18n.t('general.owner')}`,
    };
  },

  computed: {
    ...mapState(['user', 'loginError']),
  },

  methods: {
    ...mapMutations(['SET_LOGIN_ERROR']),
    async loginWithGoogle() {
      this.pending = true;
      try {
        await auth.signInWithPopup(loginProvider);
      } catch (e) {
        console.log(e);
        this.pending = false;
        this.SET_LOGIN_ERROR(2);
      }
    },

    async loginWithEmail() {
      this.pending = true;

      try {
        await auth.signInWithEmailAndPassword(this.email, this.password);
        await this.$router.push({ path: `${this.$route.query.redirectFrom || '/'}` });
      } catch (err) {
        this.pending = false;
        if (err.code === 'auth/wrong-password') {
          this.SET_LOGIN_ERROR(3);
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
  display: flex;
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

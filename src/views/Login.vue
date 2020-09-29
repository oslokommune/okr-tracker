<template>
  <div class="main">
    <div class="login">
      <div class="section">
        <h1 class="title-1">{{ $t('login.notLoggedIn') }}</h1>
      </div>

      <hr />

      <div class="section">
        <h2 class="title title-3">{{ $t('login.google.title') }}</h2>
        <p>{{ $t('login.google.info') }}</p>

        <div v-if="error === 1" class="error">
          {{ $t('login.error.wrongEmail') }}
        </div>
        <div v-if="error === 2" class="error">
          {{ $t('login.error.googleError') }}
        </div>

        <div class="form-field">
          <button class="btn" @click="loginWithGoogle">{{ $t('login.google.btn') }}</button>
        </div>
      </div>
      <hr />
      <div class="section">
        <h2 class="title title-3">{{ $t('login.dashboard.title') }}</h2>
        <p>{{ $t('login.dashboard.info') }}</p>
        <div class="section">
          <div v-if="error === 3" class="error">
            {{ $t('login.error.wrongPassword') }}
          </div>
          <form @submit.prevent="submitPassword()">
            <label class="form-field">
              <span class="form-label">Passord</span>
              <div class="form-login">
                <input class="field" type="password" v-model="password" />
                <button class="btn">
                  {{ $t('login.dashboard.btn') }}
                </button>
              </div>
            </label>
          </form>
        </div>
        <hr />
      </div>

      <div class="section">
        <h2 class="title-2">Request access</h2>
        <router-link :to="{ name: 'request-access' }">Request access</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { auth, loginProvider } from '@/config/firebaseConfig';
import i18n from '@/locale/i18n';

export default {
  data: () => ({
    error: true,
    password: '',
    pending: false,
  }),

  metaInfo() {
    return {
      title: ` ${i18n.t('general.project')} | ${i18n.t('general.owner')}`,
    };
  },

  computed: {
    ...mapState(['user']),
  },

  methods: {
    loginWithGoogle() {
      this.pending = true;
      auth
        .signInWithPopup(loginProvider)
        .then(() => {
          this.$router.push('/');
        })
        .catch(err => {
          this.pending = false;
          this.error = 2;
          this.$errorHandler('login_error', err);
        });
    },

    async submitPassword() {
      this.pending = true;
      let email = process.env.VUE_APP_DASHBOARD_USER;

      if (this.password === process.env.VUE_APP_TESTADMIN_PASSWORD) {
        email = process.env.VUE_APP_TESTADMIN_USER;
      }

      if (this.password === process.env.VUE_APP_TESTUSER_PASSWORD) {
        email = process.env.VUE_APP_TESTUSER_USER;
      }

      await auth.signInWithEmailAndPassword(email, this.password).catch(err => {
        this.pending = false;
        if (err.code === 'auth/wrong-password') {
          this.error = 3;
        }
        this.$errorHandler('login_error', err);
      });
    },
  },

  mounted() {
    this.error = this.$route.params.error;
  },
};
</script>

<style lang="scss" scoped>
@import '../styles/_colors.scss';

.login {
  width: span(12);

  @media screen and (min-width: bp(s)) {
    width: span(6);
  }

  @media screen and (min-width: bp(m)) {
    width: span(4, 0, span(9));
  }

  @media screen and (min-width: bp(l)) {
    width: span(4, 0, span(10));
  }
}

.form-login {
  display: flex;
}

.main {
  display: flex;
  align-items: center;
  padding-top: 2rem;
}

.error {
  margin: 1.5rem 0;
  padding: 1em 1.5em;
  color: black;
  background: rgba($color-red, 0.25);
  border: 2px solid $color-red;
  border-radius: 4px;
}
</style>

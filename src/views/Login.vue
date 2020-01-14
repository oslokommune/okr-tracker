<template>
  <div class="container">
    <div class="login">
      <div class="section">
        <h1 class="title-1">Du er ikke logget inn</h1>
      </div>

      <hr />

      <div class="section">
        <h2 class="title title-3">Google-bruker</h2>
        <p>Logg inn med din registrerte Google-konto for å bruke denne applikasjonen.</p>

        <div v-if="error === 1" class="error">
          Epost-adressen du forsøkte å logge inn med er ikke registrert. Kontakt systemadministrator for å få tilgang.
        </div>
        <div v-if="error === 2" class="error">
          Klarte ikke å logge inn med Google. Kontakt systemadministrator hvis feilen vedvarer.
        </div>

        <div class="form-group">
          <button class="btn" @click="loginWithGoogle">Logg inn med Google</button>
        </div>
      </div>
      <hr />
      <div class="section">
        <h2 class="title title-3">Dashboard-bruker</h2>
        <p>Logg inn med passord for å logge inn med begrenset tilgang.</p>
        <div class="section">
          <div v-if="error === 3" class="error">
            Passordet er feil.
          </div>
          <form @submit.prevent="submitPassword()">
            <label class="form-group">
              <span class="form-label">Passord</span>
              <div class="form-row">
                <input type="password" v-model="password" />
                <button class="btn">
                  Logg inn
                </button>
              </div>
            </label>
          </form>
        </div>
        <hr />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { auth, loginProvider } from '@/config/firebaseConfig';

export default {
  data: () => ({
    error: true,
    password: '',
  }),

  computed: {
    ...mapState(['user']),
  },

  methods: {
    loginWithGoogle() {
      auth
        .signInWithPopup(loginProvider)
        .then(() => {
          this.$router.push('/');
        })
        .catch(() => {
          this.error = 2;
        });
    },

    async submitPassword() {
      const email = process.env.VUE_APP_DASHBOARD_USER;
      const user = await auth.signInWithEmailAndPassword(email, this.password).catch(err => {
        if (err.code === 'auth/wrong-password') {
          this.error = 3;
        }
      });

      if (user) {
        this.$router.push('/');
      } else {
        this.error = 3;
      }
    },
  },

  beforeRouteEnter(to, from, next) {
    if (auth.currentUser) {
      next('/');
    } else {
      next();
    }
  },

  mounted() {
    this.error = this.$route.params.error;
  },
};
</script>

<style lang="scss" scoped>
@import '../styles/_colors.scss';

.login {
  max-width: 500px;
}

.container {
  display: flex;
  align-items: center;
  min-height: calc(80vh - 5rem);
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

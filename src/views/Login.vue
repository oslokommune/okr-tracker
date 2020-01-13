<template>
  <div class="container content">
    <div class="login">
      <div v-if="error === 1" class="error">
        Epost-adressen du forsøkte å logge inn med er ikke registrert. Kontakt systemadministrator for å få tilgang.
      </div>
      <div v-if="error === 2" class="error">
        Klarte ikke å logge inn med Google. Kontakt systemadministrator.
      </div>
      <div v-if="error === 3" class="error">
        Passordet er feil.
      </div>
      <h1 class="title-1">Du er ikke logget inn</h1>
      <p>Logg inn med organisasjonskonto for å bruke denne applikasjonen.</p>
      <button class="btn" @click="submit()">Logg inn med Google</button>
      <div class="content" style="display: flex; flex-direction: column;">
        <input type="password" v-model="password" />
        <button class="btn" @click="submitPassword()">Logg inn med Dashboard</button>
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
    submit() {
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

.container {
  display: flex;
  align-items: center;
  min-height: calc(80vh - 5rem);
}

.btn {
  margin-top: 2rem;
}

.error {
  justify-content: center;
  margin-bottom: 4rem;
  padding: 1em 1.5em;
  color: black;
  background: rgba($color-red, 0.25);
  border: 2px solid $color-red;
  border-radius: 4px;
}
</style>

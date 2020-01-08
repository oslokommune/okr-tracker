<template>
  <div class="container content">
    <div class="login">
      <div v-if="error" class="error">
        Epost-adressen du forsøkte å logge inn med er ikke registrert. Kontakt systemadministrator for å få tilgang.
      </div>
      <h1 class="title-1">Du er ikke logget inn</h1>
      <p>Logg inn med organisasjonskonto for å bruke denne applikasjonen.</p>
      <button class="btn" @click="submit()">Logg inn med Google</button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { auth, loginProvider, updateUserObject } from '@/config/firebaseConfig';

export default {
  data: () => ({
    error: true,
  }),

  computed: {
    ...mapState(['user']),
  },

  methods: {
    submit() {
      auth
        .signInWithPopup(loginProvider)
        .then(res => {
          updateUserObject(res.user);
          this.$router.push('/');
        })
        .catch(err => {
          this.error = err.message;
        });
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

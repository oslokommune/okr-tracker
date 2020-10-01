<template>
  <div class="wrapper">
    <div class="back">
      <router-link class="btn btn--icon btn--ghost" :to="{ name: 'login' }">
        <i class="icon fa-xs fa fa-fw fa-chevron-left"></i>
        {{ $t('login.backToLogin') }}
      </router-link>
    </div>
    <div class="login">
      <h2 class="title-1">{{ $t('login.requestAccess') }}</h2>

      <form @submit.prevent="send">
        <label class="form-field">
          <span class="form-label">{{ $t('login.email') }}</span>
          <div class="form-login">
            <input class="field" type="email" v-model="email" required />
          </div>
        </label>
        <button class="btn btn--pri">{{ $t('login.requestButton') }}</button>
      </form>
    </div>
  </div>
</template>

<script>
import RequestAccess from '@/db/RequestAccess';
import { mapMutations } from 'vuex';

export default {
  data: () => ({
    email: '',
  }),

  mounted() {
    this.SET_LOGIN_ERROR(null);
  },

  methods: {
    ...mapMutations(['SET_LOGIN_ERROR']),
    async send() {
      try {
        await RequestAccess.create({ email: this.email });
        this.$toasted.show('Successfully registered your access request');
        this.$router.push({ name: 'login' });
      } catch {
        this.email = '';
        this.$toasted.error('Could not register your access request');
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

.back {
  margin-left: span(1, 1);

  @media screen and (min-width: bp(xs)) {
    position: absolute;
    margin-left: span(2, 0);
    transform: translateY(-2.5rem);
  }

  @media screen and (min-width: bp(s)) {
    position: absolute;
    margin-left: 0;
    transform: translateY(-3rem);
  }
}
</style>

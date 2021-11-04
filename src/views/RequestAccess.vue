<template>
  <div class="container">
    <div class="login">
      <div class="back">
        <router-link class="btn btn--icon btn--ghost" :to="{ name: 'Login' }">
          <i class="icon fa-xs fa fa-fw fa-chevron-left" />
          {{ $t('login.backToLogin') }}
        </router-link>
      </div>
      <h2 class="title-1">{{ $t('login.requestAccess') }}</h2>

      <form @submit.prevent="send">
        <label class="form-field">
          <span class="form-label">{{ $t('login.email') }}</span>
          <input v-model="email" class="field" type="email" required data-cy="request-input" />
        </label>
        <button class="btn btn--pri" :disabled="loading" data-cy="request-btn">{{ $t('login.requestButton') }}</button>
      </form>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
import { api } from '@/util';

export default {
  name: 'RequestAccess',

  data: () => ({
    email: '',
    loading: false,
  }),

  mounted() {
    this.SET_LOGIN_ERROR(null);
  },

  methods: {
    ...mapMutations(['SET_LOGIN_ERROR']),
    async send() {
      this.loading = true;
      try {
        await api.post(`/access/${this.email}/create`);
        this.$toasted.show(this.$t('toaster.request.requested'));
        await this.$router.push({ name: 'Login', query: { redirectFrom: '/' } });
      } catch (e) {
        console.log(e.response);
        this.email = '';
        this.$toasted.error(this.$t('toaster.request.error'));
      }

      this.loading = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  flex-direction: column;
  width: span(12);
  padding: 2rem;
  background: white;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(var(--color-grey-400-rgb), 0.3);

  @media screen and (min-width: bp(s)) {
    width: span(6);
  }

  @media screen and (min-width: bp(m)) {
    width: span(4);
    margin-left: span(3, 1);
  }

  @media screen and (min-width: bp(l)) {
    width: span(4);
    margin-left: span(2, 1);
  }

  @media screen and (min-width: bp(xl)) {
    width: span(4);
    margin-left: span(3, 1);
  }
}

.back {
  margin-bottom: 1rem;
}
</style>

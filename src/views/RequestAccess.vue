<template>
  <div class="container">
    <div class="main__second">
      <div class="back">
        <router-link class="btn btn--sec btn--icon" :to="{ name: 'Login' }">
          <i class="icon fa-xs fa fa-fw fa-chevron-left" />
          {{ $t('login.backToLogin') }}
        </router-link>
      </div>
      <h2 class="title-1">{{ $t('login.requestAccess') }}</h2>

      <form @submit.prevent="send">
        <label class="form__group">
          <span class="form-label">{{ $t('login.email') }}</span>
          <input v-model="email" class="form__field" type="email" required data-cy="request-input" />
        </label>
        <button class="btn btn--pri" :disabled="loading" data-cy="request-btn">{{ $t('login.requestButton') }}</button>
      </form>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
import { api } from '@/util';
import { showToastMessage } from '@/util/toastUtils';

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
        const res = await api.post(`/accessRequests/create`, { email: this.email });

        showToastMessage({
          msg: res.data,
          type: 'success',
        });

        await this.$router.push({ name: 'Login', query: { redirectFrom: '/' } });
      } catch (e) {
        console.log('E: ', e);
        this.email = '';

        showToastMessage({
          msg: e.response.data,
          type: 'error',
        });
      }

      this.loading = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.back {
  margin-bottom: 1rem;
}
</style>

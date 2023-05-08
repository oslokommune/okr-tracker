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

      <form-section>
        <form-component
          v-model="email"
          input-type="input"
          name="email"
          :label="$t('login.email')"
          rules="required"
          type="email"
        />

        <template #actions="{ handleSubmit, submitDisabled }">
          <btn-save
            :disabled="submitDisabled || loading"
            :label="$t('login.requestButton')"
            :icon="null"
            @click="handleSubmit(send)"
          />
        </template>
      </form-section>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
import api from '@/util/api';
import { showToastMessage } from '@/util/toastUtils';
import { FormSection, BtnSave } from '@/components/generic/form';

export default {
  name: 'RequestAccess',

  components: {
    FormSection,
    BtnSave,
  },

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
        const { message } = await api(`/accessRequests/create`, {
          method: 'post',
          body: {
            email: this.email,
          },
        });

        showToastMessage({
          msg: message,
          msgVars: { user: this.email },
          type: 'success',
        });

        await this.$router.push({
          name: 'Login',
          query: { redirectFrom: '/' },
        });
      } catch (error) {
        showToastMessage({
          msg: error.message,
          msgVars: { user: this.email },
          type: 'error',
        });
      }

      this.email = '';
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

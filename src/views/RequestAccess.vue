<template>
  <page-layout breakpoint="phablet">
    <RouterLink v-slot="{ href }" :to="{ name: 'Login' }" custom>
      <PktBackLink :href="href" :text="$t('login.backToLogin')" />
    </RouterLink>

    <h1 class="title-1">{{ $t('login.requestAccess') }}</h1>

    <form-section>
      <form-component
        v-model="email"
        input-type="input"
        name="email"
        :label="$t('login.email')"
        rules="required|email"
        type="email"
      />

      <template #actions="{ submit, reset, disabled }">
        <btn-save
          variant="label-only"
          :disabled="disabled || loading"
          :text="$t('login.requestButton')"
          @on-click="submit(() => send(reset))"
        />
      </template>
    </form-section>
  </page-layout>
</template>

<script>
import { mapMutations } from 'vuex';
import { PktBackLink } from '@oslokommune/punkt-vue';
import api from '@/util/api';
import { showToastMessage } from '@/util/toastUtils';
import { BtnSave } from '@/components/generic/form';

export default {
  name: 'RequestAccess',

  components: {
    PktBackLink,
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

    async send(resetForm) {
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

      resetForm();
      this.loading = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;

@include bp('tablet-up') {
  :deep(.page__main) {
    padding: 1.5rem;
    background: var(--color-gray-light);
  }
}
</style>

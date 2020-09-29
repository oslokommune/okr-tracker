<template>
  <div class="main">
    <div class="login">
      <h2 class="title-1">Request access</h2>

      <form @submit.prevent="send">
        <label>
          <span>Email address</span>
          <input type="email" v-model="email" />
        </label>
        <button class="btn">Request</button>
      </form>
    </div>
  </div>
</template>

<script>
import i18n from '@/locale/i18n';
import RequestAccess from '@/db/RequestAccess';

export default {
  data: () => ({
    email: '',
  }),

  metaInfo() {
    return {
      title: ` ${i18n.t('general.project')} | ${i18n.t('general.owner')}`,
    };
  },

  methods: {
    send() {
      RequestAccess.create({ email: this.email });
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

.main {
  display: flex;
  align-items: center;
  padding-top: 2rem;
}
</style>

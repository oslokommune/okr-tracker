<template>
  <empty-page :heading="heading" :body="body" skin="warning">
    <router-link v-if="backTo" :to="{ name: backTo }" class="pkt-link">
      <pkt-icon class="pkt-link__icon" name="chevron-left" />
      {{ backText }}
    </router-link>
  </empty-page>
</template>

<script>
import EmptyPage from '@/components/pages/EmptyPage.vue';
import i18n from '@/locale/i18n';

export default {
  name: 'NotFoundPage',

  components: {
    EmptyPage,
  },

  props: {
    heading: {
      type: String,
      required: false,
      default: i18n.t('notFound.title'),
    },
    body: {
      type: String,
      required: false,
      default: i18n.t('notFound.body'),
    },
    backTo: {
      type: String,
      required: false,
      default: null,
    },
    backText: {
      type: String,
      required: false,
      default: i18n.t('notFound.linkText'),
    },
  },
};
</script>

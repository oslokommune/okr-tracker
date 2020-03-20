<template>
  <h1>404</h1>
</template>

<script>
import i18n from '@/locale/i18n';

export default {
  name: 'NotFound',
  metaInfo() {
    return {
      title: `${i18n.t('general.notFound')} | OKR`,
    };
  },
};
</script>

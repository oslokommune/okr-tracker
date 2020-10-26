<template>
  <div>
    <h1 class="title-1">{{ $t('404.title') }}</h1>
  </div>
</template>

<script>
import i18n from '@/locale/i18n';

export default {
  name: 'NotFound',
  metaInfo() {
    return {
      title: `${i18n.t('general.notFound')} | ${i18n.t('general.project')}`,
    };
  },
};
</script>

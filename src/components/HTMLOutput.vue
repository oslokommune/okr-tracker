<template>
  <div v-html="sanitizedHtml" />
</template>

<script>
import { marked } from 'marked';
import dompurify from 'dompurify';

export default {
  name: 'HTMLOutput',

  props: {
    html: {
      type: String,
      required: true,
    },
  },

  data: () => ({
    sanitizedHtml: '',
  }),

  watch: {
    html: {
      deep: true,
      immediate: true,
      async handler(html) {
        this.sanitizedHtml = await dompurify.sanitize(marked(html));
      },
    },
  },
};
</script>

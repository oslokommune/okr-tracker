<template>
  <div class="md" v-html="sanitizedHtml" />
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
        dompurify.addHook('afterSanitizeAttributes', function (node) {
          // set all elements owning target to target=_blank
          if ('target' in node) {
            node.setAttribute('target', '_blank');
          }
        });
        this.sanitizedHtml = await dompurify.sanitize(marked(html));
      },
    },
  },
};
</script>

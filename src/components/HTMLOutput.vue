<script setup>
import { ref, watch } from 'vue';
import { marked } from 'marked';
import dompurify from 'dompurify';

const props = defineProps({
  html: {
    type: String,
    required: true,
  },
});

const sanitizedHtml = ref('');

watch(
  () => props.html,
  (html) => {
    dompurify.addHook('afterSanitizeAttributes', function (node) {
      // set all elements owning target to target=_blank
      if ('target' in node) {
        node.setAttribute('target', '_blank');
      }
    });
    sanitizedHtml.value = dompurify.sanitize(marked(html));
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <div class="md" v-html="sanitizedHtml" />
</template>

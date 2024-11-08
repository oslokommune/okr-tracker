<script setup>
import { onMounted } from 'vue';
import { SwaggerUIBundle } from 'swagger-ui-dist';
import 'swagger-ui-dist/swagger-ui.css';

onMounted(() => {
  SwaggerUIBundle({
    url: './openapi.yaml',
    dom_id: '#swagger-ui',
  });
});
</script>

<template>
  <PageLayout breakpoint="tablet-big">
    <div id="swagger-ui"></div>
  </PageLayout>
</template>

<style lang="scss">
pre > code {
  margin: 0;
  padding: 0;
  background: none;
}
</style>

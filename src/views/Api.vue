<template>
  <page-layout breakpoint="tablet-big">
    <div id="swagger-ui"></div>
  </page-layout>
</template>

<script>
import { SwaggerUIBundle } from 'swagger-ui-dist';
import 'swagger-ui-dist/swagger-ui.css';

export default {
  name: 'Api',

  mounted() {
    SwaggerUIBundle({
      url: './openapi.yaml',
      dom_id: '#swagger-ui',
    });
  },
};
</script>

<style lang="scss">
pre > code {
  margin: 0;
  padding: 0;
  background: none;
}
</style>

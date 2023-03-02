<template>
  <div class="container">
    <div class="main">
      <div id="swagger-ui"></div>
    </div>
  </div>
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

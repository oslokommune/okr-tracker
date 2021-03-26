<template>
  <div class="main">
    <div id="swagger-ui"></div>
  </div>
</template>

<script>
import SwaggerUi from 'swagger-ui';
import 'swagger-ui/dist/swagger-ui.css';

export default {
  name: 'Api',

  mounted() {
    SwaggerUi({
      url: './openapi/v1.1.0.yaml',
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

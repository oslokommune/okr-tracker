<template>
  <div>
    <PageHeader :data="{ name: 'Hjelp', icon: 'user' }" :toc="true" toc-id="toc" toc-first-level="2"></PageHeader>

    <div class="container" v-if="markdown">
      <vue-markdown class="md" :source="markdown"></vue-markdown>
    </div>
  </div>
</template>

<script>
import VueMarkdown from 'vue-markdown';
import PageHeader from '@/components/PageHeader.vue';

export default {
  data: () => ({
    markdown: '',
  }),

  components: {
    VueMarkdown,
    PageHeader,
  },

  async created() {
    fetch('./help.md').then(async response => {
      this.markdown = await response.text();
    });
  },
};
</script>

<style lang="scss" scoped>
.md {
  max-width: 600px;
}

/deep/a[href*='thumbnail'] img {
  float: left;
  width: 6em;
  height: 6em;
  margin: 1rem;
  object-fit: cover;
  border: 1px solid rgba(black, 0.1);
}

.container {
  margin-top: 3rem;
  margin-bottom: 5rem;
}

/deep/.md {
  h2 {
    margin-top: 2rem;
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
  }

  h3 {
    margin-top: 2rem;
    margin-bottom: 0.5rem;
    font-size: 1.15rem;
  }

  ul {
    margin: 1em 0;
    padding-left: 2em;
    list-style-type: disc;
  }

  .table {
    margin-bottom: 2rem;
  }
}
</style>

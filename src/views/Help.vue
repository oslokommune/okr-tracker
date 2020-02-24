<template>
  <div>
    <PageHeader :data="{ name: 'Hjelp', icon: 'user' }" :toc="true" toc-id="toc" toc-first-level="2"></PageHeader>

    <div class="container" v-if="markdown">
      <h2 class="title-2">Innhold</h2>
      <ul class="toc" v-if="toc">
        <li v-for="levelOne in toc.children" :key="levelOne.id">
          <a :href="`#${levelOne.data.id}`">{{ levelOne.data.text }}</a>
          <ul v-if="levelOne.children">
            <li v-for="levelTwo in levelOne.children" :key="levelTwo.id">
              <a :href="`#${levelTwo.data.id}`">{{ levelTwo.data.text }}</a>
              <ul v-if="levelTwo.children">
                <li v-for="levelThree in levelTwo.children" :key="levelThree.id">
                  <a :href="`#${levelThree.data.id}`">{{ levelThree.data.text }}</a>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>

      <div class="md" v-html="markdown"></div>
    </div>
  </div>
</template>

<script>
import marked from 'marked';
import { sanitize } from 'dompurify';
import PageHeader from '@/components/PageHeader.vue';
import toc from '@/util/toc';

marked.setOptions({
  smartypants: true,
});

export default {
  data: () => ({
    markdown: '',
    toc: [],
  }),

  components: {
    PageHeader,
  },

  async created() {
    fetch('./help.md').then(async response => {
      this.markdown = sanitize(marked(await response.text()));
      this.toc = toc(this.markdown);
    });
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors';

.md {
  max-width: 600px;
  font-size: 1rem;
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

.toc {
  margin: 2rem 0 5rem;
  padding: 1.5rem;
  font-size: 1rem;
  background: $color-bg;
  border: 1px solid $color-border;

  li {
    padding: 0.25rem 0;
  }

  ul {
    padding-top: 0.25rem;
    padding-left: 2rem;
  }
}
</style>

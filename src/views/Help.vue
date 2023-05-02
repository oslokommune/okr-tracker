<template>
  <div v-if="markdown" class="container">
    <aside class="aside aside--left">
      <widget>
        <ol v-if="toc" class="toc help__toc">
          <h2 class="title-1">{{ $t('help.toc') }}</h2>
          <li v-for="levelOne in toc.children" :key="levelOne.id">
            <a :href="`#${levelOne.data.id}`">{{ levelOne.data.text }}</a>
            <ol v-if="levelOne.children">
              <li v-for="levelTwo in levelOne.children" :key="levelTwo.id">
                <a :href="`#${levelTwo.data.id}`">{{ levelTwo.data.text }}</a>
                <ol v-if="levelTwo.children">
                  <li v-for="levelThree in levelTwo.children" :key="levelThree.id">
                    <a :href="`#${levelThree.data.id}`">{{ levelThree.data.text }}</a>
                  </li>
                </ol>
              </li>
            </ol>
          </li>
        </ol>
      </widget>
    </aside>

    <main class="main">
      <widget>
        <div class="md" v-html="markdown"></div>
      </widget>
    </main>
  </div>
</template>

<script>
import { marked } from 'marked';
import dompurify from 'dompurify';
import { tableOfContent as toc } from '@/util';
import i18n from '@/locale/i18n';
import WidgetWrapper from '@/components/widgets/WidgetWrapper.vue';

marked.setOptions({
  smartypants: true,
});

export default {
  name: 'Help',

  components: {
    Widget: WidgetWrapper,
  },

  data: () => ({
    markdown: '',
    toc: [],
  }),

  metaInfo() {
    return {
      title: `${i18n.t('general.help')} | ${i18n.t('general.project')}`,
    };
  },

  async created() {
    fetch('./help.md').then(async (response) => {
      this.markdown = dompurify.sanitize(marked(await response.text()));
      this.toc = toc(this.markdown);
    });
  },
};
</script>

<style lang="scss" scoped>
aside,
main {
  line-height: 1.2;
}

.toc {
  li {
    padding: 0.25rem 0;
  }

  ol {
    padding-top: 0.25rem;
    padding-left: 1.5rem;
  }
}

.md :first-child {
  margin-top: 0;
}
</style>

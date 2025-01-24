<script setup>
import { ref } from 'vue';
import { marked } from 'marked';
import dompurify from 'dompurify';
import { useI18n } from 'vue-i18n';
import { useHead } from '@unhead/vue';
import { tableOfContent } from '@/util';
import WidgetWrapper from '@/components/widgets/WidgetWrapper.vue';

marked.setOptions({ smartypants: true });

const i18n = useI18n();

useHead({ title: i18n.t('general.help') });

const markdown = ref('');
const toc = ref([]);

fetch('./help.md').then(async (response) => {
  markdown.value = dompurify.sanitize(marked(await response.text()));
  toc.value = tableOfContent(markdown.value);
});
</script>

<template>
  <PageLayout v-if="markdown" sidebar-position="left" :sidebar-grid="false">
    <template #sidebar>
      <WidgetWrapper>
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
      </WidgetWrapper>
    </template>

    <template #default>
      <WidgetWrapper>
        <div class="md" v-html="markdown"></div>
      </WidgetWrapper>
    </template>
  </PageLayout>
</template>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

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

:deep(code) {
  @include get-text('pkt-txt-14');
  padding: 0 0.3em;
  font-family: 'Monaco', monospace;
  word-break: normal;
  background-color: var(--color-grayscale-10);
}
</style>

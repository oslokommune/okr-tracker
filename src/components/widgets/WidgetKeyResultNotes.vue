<template>
  <Widget v-if="activeKeyResult.notes" title="Notater" icon="pencil-alt">
    <div style="display: flex; flex-direction: column;">
      <div v-if="editNotes" style="margin-bottom: 1rem;">
        <textarea rows="20" @input="dirty = true" v-model="activeKeyResult.notes"></textarea>
      </div>

      <div v-else style="margin-bottom: 1rem;">
        <div class="notes" v-if="markdown" v-html="markdown"></div>
        <em v-else>{{ $t('keyResultPage.notes.empty') }}</em>
      </div>

      <div v-if="editNotes" style="display: flex; flex-direction: row;">
        <button @click="saveNotes" class="btn btn--borderless" :disabled="!dirty">
          {{ $t('keyResultPage.notes.save') }}
        </button>
        <button @click="editNotes = false" class="btn btn--borderless">
          Lukk
        </button>
      </div>
      <button v-else @click="editNotes = !editNotes" class="btn btn--borderless">
        Endre notater
      </button>
    </div>
  </Widget>
</template>

<script>
import { mapState } from 'vuex';
import marked from 'marked';
import { sanitize } from 'dompurify';
import KeyResult from '@/db/KeyResult';

marked.setOptions({
  smartypants: true,
});

export default {
  name: 'WidgetKeyResultNotes',

  data: () => ({
    editNotes: false,
    dirty: false,
  }),

  computed: {
    ...mapState(['activeKeyResult']),

    markdown() {
      console.log(this.activeKeyResult.notes);
      if (!this.activeKeyResult.notes) return null;
      return sanitize(this.activeKeyResult.notes);
    },
  },

  components: {
    Widget: () => import('./Widget.vue'),
  },

  methods: {
    async saveNotes() {
      const { notes, id } = this.activeKeyResult;
      await KeyResult.update(id, { notes });
      this.dirty = false;
      this.editNotes = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

.notes {
  padding: 1rem;
  font-size: 0.9rem;
}
</style>

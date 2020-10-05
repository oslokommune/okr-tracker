<template>
  <Widget v-if="activeKeyResult.notes" title="Notater" icon="pencil-alt">
    <div class="notes">
      <div class="notes--margin-bottom" v-if="editNotes">
        <textarea rows="20" @input="dirty = true" v-model="activeKeyResult.notes"></textarea>
      </div>

      <div class="notes--margin-bottom" v-else>
        <div class="notes__markdown" v-if="markdown" v-html="markdown"></div>
        <em v-else>{{ $t('keyResultPage.notes.empty') }}</em>
      </div>

      <div v-if="editNotes" class="notes__btn">
        <button @click="saveNotes" class="btn btn--ter" :disabled="!dirty">
          {{ $t('keyResultPage.notes.save') }}
        </button>
        <button @click="editNotes = false" class="btn btn--ter">Lukk</button>
      </div>
      <button v-else @click="editNotes = !editNotes" class="btn btn--ter">Endre notater</button>
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
  display: flex;
  flex-direction: column;

  &--margin-bottom {
    margin-bottom: 1rem;
  }

  &__markdown {
    padding: 0.75rem 0.75rem 0.6rem 0.75rem;
  }

  &__btn {
    display: flex;
    flex-direction: row;
  }
}
</style>

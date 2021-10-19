<template>
  <widget :widget-id="widgetId" :title="$t('keyResultsPage.notes.heading')" icon="pencil-alt">
    <div class="notes">
      <div v-if="editNotes" class="notes--margin-bottom">
        <textarea v-model="thisKey.notes" rows="20" @input="dirty = true" />
      </div>

      <div v-else class="notes--margin-bottom">
        <div v-if="md.length" class="notes__markdown md" v-html="md"></div>
        <em v-else>{{ $t('keyResultPage.notes.empty') }}</em>
      </div>

      <div v-if="editNotes" class="notes__btn">
        <button class="btn btn--ter" :disabled="!dirty || loading" @click="saveNotes">
          {{ $t('keyResultPage.notes.save') }}
        </button>
        <button class="btn btn--ter" @click="closeNotes">{{ $t('btn.close') }}</button>
      </div>
      <div v-else>
        <button class="btn btn--ter" @click="editNotes = !editNotes">{{ $t('btn.editNotes') }}</button>
      </div>
    </div>
  </widget>
</template>

<script>
import { mapState } from 'vuex';
import marked from 'marked';
import dompurify from 'dompurify';
import KeyResult from '@/db/KeyResult';

marked.setOptions({
  smartypants: true,
});

export default {
  name: 'WidgetKeyResultNotes',

  components: {
    Widget: () => import('./Widget.vue'),
  },

  props: {
    widgetId: {
      type: String,
      required: true,
    },
  },

  data: () => ({
    editNotes: false,
    dirty: false,
    loading: false,
    thisKey: null,
    md: '',
  }),

  computed: {
    ...mapState(['activeKeyResult']),
  },

  watch: {
    activeKeyResult: {
      immediate: true,
      handler(keyres) {
        this.thisKey = { ...keyres, id: keyres.id };
        this.md = dompurify.sanitize(marked(keyres.notes || ''));
      },
    },
  },

  methods: {
    async saveNotes() {
      this.loading = true;
      const { notes, id } = this.thisKey;

      try {
        await KeyResult.update(id, { notes });
        this.$toasted.show(this.$t('toaster.savedChanges'));
      } catch {
        this.$toasted.error(this.$t('toaster.error.notes'));
      }

      this.dirty = false;
      this.editNotes = false;
      this.loading = false;
    },

    closeNotes() {
      this.editNotes = false;
      this.thisKey.notes = this.activeKeyResult.notes;
    },
  },
};
</script>

<style lang="scss" scoped>
.notes {
  display: flex;
  flex-direction: column;
}

.notes--margin-bottom {
  margin-bottom: 1rem;
}

.notes__markdown {
  padding: 0.75rem 0.75rem 0.6rem 0rem;
}

.notes__btn {
  display: flex;
  flex-direction: row;
}
</style>

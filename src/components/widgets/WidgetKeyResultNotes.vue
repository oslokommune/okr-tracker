<template>
  <Widget :widget-id="widgetId" :title="$t('keyResultsPage.notes.heading')" icon="pencil-alt">
    <div class="notes">
      <div v-if="editNotes" class="notes--margin-bottom">
        <textarea v-model="thisKey.notes" rows="20" @input="dirty = true"></textarea>
      </div>

      <div v-else class="notes--margin-bottom">
        <div v-if="markdown" class="notes__markdown" v-html="markdown"></div>
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
  </Widget>
</template>

<script>
import { mapState } from 'vuex';
import marked from 'marked';
import { sanitize } from 'dompurify';
import KeyResult from '@/db/KeyResult';
import * as Toast from '@/util/toasts';

marked.setOptions({
  smartypants: true,
});

export default {
  name: 'WidgetKeyResultNotes',

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
  }),

  computed: {
    ...mapState(['activeKeyResult']),

    markdown() {
      if (!this.thisKey.notes) return null;
      return sanitize(this.thisKey.notes);
    },
  },

  components: {
    Widget: () => import('./Widget.vue'),
  },

  watch: {
    activeKeyResult: {
      immediate: true,
      handler() {
        this.thisKey = { ...this.activeKeyResult, id: this.activeKeyResult.id };
      },
    },
  },

  methods: {
    async saveNotes() {
      this.loading = true;
      const { notes, id } = this.thisKey;

      try {
        await KeyResult.update(id, { notes });
        Toast.savedChanges();
      } catch {
        Toast.error(this.$t('toaster.error.notes'));
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
@import '@/styles/_colors.scss';

.notes {
  display: flex;
  flex-direction: column;

  &--margin-bottom {
    margin-bottom: 1rem;
  }

  &__markdown {
    padding: 0.75rem 0.75rem 0.6rem 0rem;
  }

  &__btn {
    display: flex;
    flex-direction: row;
  }
}
</style>

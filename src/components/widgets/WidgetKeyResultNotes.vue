<template>
  <Widget :widget-id="widgetId" :title="$t('keyResultsPage.notes.heading')" icon="pencil-alt">
    <div class="notes">
      <div class="notes--margin-bottom" v-if="editNotes">
        <textarea rows="20" @input="dirty = true" v-model="thisKey.notes"></textarea>
      </div>

      <div class="notes--margin-bottom" v-else>
        <div class="notes__markdown" v-if="markdown" v-html="markdown"></div>
        <em v-else>{{ $t('keyResultPage.notes.empty') }}</em>
      </div>

      <div v-if="editNotes" class="notes__btn">
        <button @click="saveNotes" class="btn btn--ter" :disabled="!dirty || loading">
          {{ $t('keyResultPage.notes.save') }}
        </button>
        <button @click="closeNotes" class="btn btn--ter">{{ $t('btn.close') }}</button>
      </div>
      <div v-else>
        <button @click="editNotes = !editNotes" class="btn btn--ter">{{ $t('btn.editNotes') }}</button>
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

  data: () => ({
    editNotes: false,
    dirty: false,
    loading: false,
    thisKey: null,
  }),

  props: {
    widgetId: {
      type: String,
      required: true,
    },
  },

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

  methods: {
    async saveNotes() {
      this.loading = true;
      const { notes, id } = this.thisKey;

      try {
        await KeyResult.update(id, { notes });
        Toast.savedChanges();
      } catch {
        this.$toasted.error(this.$tc('toaster.error.notes'));
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

  watch: {
    activeKeyResult: {
      immediate: true,
      handler() {
        this.thisKey = { ...this.activeKeyResult, id: this.activeKeyResult.id };
      },
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

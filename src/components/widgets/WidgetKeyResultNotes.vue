<template>
  <widget :title="$t('keyResultsPage.notes.heading')" size="small" collapsable>
    <div class="notes">
      <div v-if="editNotes" class="notes--margin-bottom">
        <label>
          <textarea
            v-model="thisKey.notes"
            class="form__field"
            rows="20"
            @input="dirty = true"
          />
        </label>
      </div>

      <div v-else class="notes--margin-bottom">
        <div v-if="md.length" class="notes__markdown md" v-html="md"></div>
        <em v-else>{{ $t('keyResultPage.notes.empty') }}</em>
      </div>

      <div v-if="editNotes" class="notes__btn">
        <btn-save :disabled="!dirty || loading" @click="saveNotes" />
        <pkt-button skin="tertiary" @onClick="closeNotes">
          {{ $t('btn.close') }}
        </pkt-button>
      </div>
      <div v-else>
        <pkt-button skin="secondary" @onClick="editNotes = !editNotes">
          {{ $t('btn.editNotes') }}
        </pkt-button>
      </div>
    </div>
  </widget>
</template>

<script>
import { mapState } from 'vuex';
import { marked } from 'marked';
import { PktButton } from '@oslokommune/punkt-vue2';
import dompurify from 'dompurify';
import { BtnSave } from '@/components/generic/form';
import KeyResult from '@/db/KeyResult';
import Widget from './WidgetWrapper.vue';

marked.setOptions({
  smartypants: true,
});

export default {
  name: 'WidgetKeyResultNotes',

  components: {
    BtnSave,
    PktButton,
    Widget,
  },

  data: () => ({
    editNotes: false,
    dirty: false,
    loading: false,
    thisKey: null,
    md: '',
  }),

  computed: {
    ...mapState('okrs', ['activeKeyResult']),
  },

  watch: {
    activeKeyResult: {
      immediate: true,
      handler(keyResult) {
        this.thisKey = { ...keyResult, id: keyResult.id };
        this.md = dompurify.sanitize(marked(keyResult.notes || ''));
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
  padding: 0.75rem 0.75rem 0.6rem 0;
}

.notes__btn {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}
</style>

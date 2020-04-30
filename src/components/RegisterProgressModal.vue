<template>
  <div class="overlay">
    <div class="modal" @click.stop>
      <div class="modal__header">
        <h2 class="title-2">{{ $t('keyres.registerProgression.register') }}</h2>
        <button class="btn btn--borderless" @click="close" data-cy="close_button">
          <i class="fa fa-times"></i>
        </button>
      </div>

      <main v-if="keyResult" class="modal__main">
        <div class="title">
          <p class="pill">{{ $t('general.keyres') }}</p>
          <h3 class="title-3">{{ keyResult.description }}</h3>
        </div>
        <progress-bar class="progress" :keyres="keyResult"></progress-bar>
        <input
          v-if="!keyResult.auto"
          class="range"
          type="range"
          :min="keyResult.fromValue"
          :max="keyResult.targetValue"
          v-model="newValue"
        />
        <label v-if="!keyResult.auto" class="form-field">
          <span class="form-label">{{ $t('keyres.registerProgression.value') }}</span>
          <input type="number" v-model="newValue" data-cy="value_field" />
        </label>
        <div class="dots">
          <div class="dot" v-for="(dot, i) in keyResults" :key="dot.id" :class="{ active: i === index }"></div>
        </div>
      </main>

      <main v-if="!keyResult" class="modal__empty">
        <h3 class="title-3">{{ $t('keyres.registerProgression.noKeyres') }}</h3>
      </main>

      <div class="modal__footer">
        <button class="btn btn--borderless" @click="previous">{{ $t('keyres.registerProgression.previous') }}</button>
        <button class="btn btn--borderless" @click="skip">{{ $t('keyres.registerProgression.jumpOver') }}</button>
        <button class="btn btn--borderless" @click="save" data-cy="save_button">
          {{ $t('keyres.registerProgression.save') }}
        </button>
      </div>
    </div>

    <AddProgressComment
      v-show="addCommentTo"
      :document-ref="addCommentTo"
      @close="addCommentTo = null"
    ></AddProgressComment>
  </div>
</template>

<script>
import ClickOutside from 'vue-click-outside';
import { mapState } from 'vuex';
import { serializeList } from '@/db/db';
import ProgressBar from '@/components/ProgressBar.vue';
import { addProgress } from '@/db/progressHandler';
import AddProgressComment from '@/components/AddProgressComment.vue';

export default {
  name: 'RegisterProgressModal',

  data: () => ({
    addCommentTo: null,
    index: 0,
    objectives: [],
    keyResults: [],
    unsubscribeObjectives: null,
    unsubscribeKeyResults: null,
    newValue: null,
  }),

  props: {
    document: {
      type: Object,
      required: true,
    },
  },

  computed: {
    ...mapState(['user', 'activePeriod']),

    keyResult() {
      return this.keyResults[this.index];
    },
  },

  watch: {
    keyResult(obj) {
      this.newValue = obj.currentValue || obj.startValue || 0;
    },
  },

  components: {
    ProgressBar,
    AddProgressComment,
  },

  mounted() {
    document.documentElement.style.overflow = 'hidden';
    this.getObjectives();
  },

  beforeDestroy() {
    this.unsubscribeObjectives();
    document.documentElement.style.overflow = 'auto';
  },

  methods: {
    close() {
      this.$emit('close');
    },

    addComment(ref) {
      this.addCommentTo = ref;
    },

    previous() {
      this.index -= 1;
      if (this.index < 0) this.index = this.keyResults.length - 1;
    },

    skip() {
      this.index += 1;
      if (this.index >= this.keyResults.length) this.index = 0;
    },

    async save() {
      await addProgress(this.keyResult, +this.newValue, this.date, this.addComment);

      this.skip();
      if (this.index === 0) this.close();
    },

    getObjectives() {
      if (this.unsubscribeObjectives) this.unsubscribeObjectives();

      this.unsubscribeObjectives = this.document.ref
        .collection('objectives')
        .where('archived', '==', false)
        .where('period', '==', this.activePeriod.ref)
        .onSnapshot(snapshot => {
          if (snapshot.empty) {
            this.objectives = [];
            return;
          }
          this.objectives = serializeList(snapshot);

          this.getKeyResults();
        });
    },

    async getKeyResults() {
      const promises = this.objectives.map(obj => {
        return obj.ref
          .collection('keyResults')
          .get()
          .then(serializeList);
      });
      const keyResults = await Promise.all(promises).catch(err => {
        this.$errorHandler('get_keyres_error', err);
      });
      this.keyResults = keyResults.flat();
    },
  },

  directives: {
    ClickOutside,
  },
};
</script>

<style lang="scss" scoped>
@import '../styles/_colors';
@import '../styles/_modal';

.range {
  display: none;
  grid-area: slider;
  align-items: center;
  align-self: center;

  @media screen and (min-width: 768px) {
    display: block;
  }
}

.title {
  grid-area: title;
  margin-bottom: 1rem;

  &-3 {
    margin: 0;
  }
}

.progress {
  grid-area: progress;
}

.form-field {
  grid-area: slider;
  padding: 0;
  transform: translateY(-0.75rem);

  @media screen and (min-width: 768px) {
    grid-area: input;
  }
}

.dots {
  display: flex;
  grid-area: dots;
  align-self: center;
  justify-content: center;
  padding: 0.75rem 0;
}

.dot {
  width: 9px;
  height: 9px;
  margin: 0 0.3rem;
  background: $color-grey-200;
  border-radius: 5px;
  transition: all 0.2s ease-in-out;

  &.active {
    background: $color-purple;
    transform: scale(1.5);
  }
}

.pill {
  width: auto;
}
</style>

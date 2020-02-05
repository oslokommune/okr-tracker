<template>
  <div class="overlay" @click="close">
    <div class="modal" @click.stop="">
      <div class="modal__header">
        <h2 class="title-2">Registrere progresjon</h2>
        <button class="btn btn--borderless" @click="close"><i class="fa fa-times"></i></button>
      </div>

      <main v-if="key_result" class="modal__main">
        <div class="title">
          <p class="pill">Nøkkelresultat</p>
          <h3 class="title-3">{{ key_result.description }}</h3>
        </div>
        <progress-bar class="progress" :keyres="key_result"></progress-bar>
        <input
          class="range"
          type="range"
          :min="key_result.from_value"
          :max="key_result.targetValue"
          v-model="newValue"
        />
        <label class="form-field">
          <span class="form-label">Verdi</span>
          <input type="number" v-model="newValue" />
        </label>
        <div class="dots">
          <div class="dot" v-for="(dot, i) in keyResults" :key="dot.id" :class="{ active: i === index }"></div>
        </div>
      </main>

      <main v-if="!key_result" class="modal__empty">
        <h3 class="title-3">Ingen nøkkelresultater</h3>
      </main>

      <div class="modal__footer">
        <button class="btn btn--borderless" @click="previous">Forrige</button>
        <button class="btn btn--borderless" @click="skip">Hopp over</button>
        <button class="btn btn--borderless" @click="save">Lagre og gå videre</button>
      </div>
    </div>
  </div>
</template>

<script>
import ClickOutside from 'vue-click-outside';
import { mapState } from 'vuex';
import { serializeDocument } from '../db/db';
import ProgressBar from './ProgressBar.vue';
import Progress from '../db/progressHandler';

export default {
  name: 'RegisterProgressModal',

  data: () => ({
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
    ...mapState(['user', 'quarters']),

    key_result() {
      return this.keyResults[this.index];
    },
  },

  watch: {
    key_result(obj) {
      this.newValue = obj.currentValue || obj.startValue || 0;
    },
  },

  components: {
    ProgressBar,
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

    previous() {
      this.index -= 1;
      if (this.index < 0) this.index = this.keyResults.length - 1;
    },

    skip() {
      this.index += 1;
      if (this.index >= this.keyResults.length) this.index = 0;
    },

    async save() {
      await Progress.addProgress(this.key_result, +this.newValue, this.date);

      this.skip();
      if (this.index === 0) this.close();
    },

    getObjectives() {
      if (this.unsubscribeObjectives) this.unsubscribeObjectives();

      this.unsubscribeObjectives = this.document.ref
        .collection('objectives')
        .where('archived', '==', false)
        .where('quarter', '==', this.quarters[0].name)
        .onSnapshot(snapshot => {
          this.objectives = snapshot.docs.map(serializeDocument);

          this.getKeyResults();
        });
    },

    async getKeyResults() {
      const promises = this.objectives.map(obj => {
        return obj.ref
          .collection('keyResults')
          .get()
          .then(snap => snap.docs.map(serializeDocument));
      });
      const keyResults = await Promise.all(promises).catch(this.$errorHandler);
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

.overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background: rgba(black, 0.2);
}

.modal {
  display: grid;

  grid-template-areas:
    'header'
    'main'
    'footer';

  grid-template-rows: auto 1fr auto;
  grid-template-columns: 100%;
  width: 100%;
  max-width: 50rem;
  margin: 0 0.5rem;
  overflow: hidden;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 0.25rem 0.45rem rgba(black, 0.5);

  @media screen and (min-width: 1024px) {
    width: 70vw;
    min-width: 700px;
    max-width: 850px;
    min-height: 400px;
  }

  &__empty {
    padding: 2.5rem 2rem;
  }

  &__header {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem 0 2rem;
    font-size: 1rem;
    border-bottom: 1px solid $color-border;

    @media screen and (min-width: 1600px) {
      padding: 2rem;
      font-size: 1.5rem;
    }

    .btn {
      margin: 0;
      padding: 0 1.15rem;
    }

    .fa {
      margin: 0;
      font-size: inherit;
    }

    .title-2 {
      display: block;
      margin: 0;
      margin-right: auto;
      font-size: inherit;
    }
  }

  &__main {
    display: grid;
    grid-gap: 0.5rem 0rem;
    grid-template-areas:
      '. title .'
      '. progress .'
      'input slider .'
      'dots dots dots';
    grid-template-rows: minmax(7rem, auto) auto auto auto;
    grid-template-columns: 0 auto 0;
    padding: 1rem 2rem 1rem;

    @media screen and (min-width: 768px) {
      grid-gap: 0.5rem 1.5rem;
      grid-template-columns: 5.5rem auto 5.5rem;
    }

    @media screen and (min-width: 1600px) {
      grid-template-rows: 11rem 2.5rem 6rem 3rem;
      padding: 2.5rem 2rem 2rem;
    }
  }

  &__footer {
    display: flex;
    grid-area: 'footer';
    justify-content: space-evenly;
    padding: 0.25rem 0rem;
    font-size: 12px;
    background: $color-bg;
    border-top: 1px solid $color-border;

    @media screen and (min-width: 768px) {
      font-size: inherit;
    }

    @media screen and (min-width: 1600px) {
      padding: 1rem;
    }

    .btn {
      justify-content: center;
      width: 100%;
      padding: 1em;
      font-size: inherit;
      border-left: 1px solid $color-border;

      &:first-child {
        border-left-color: transparent;
      }
    }
  }
}

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
</style>

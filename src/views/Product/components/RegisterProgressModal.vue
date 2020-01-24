<template>
  <div class="overlay" @click="close">
    <div class="modal" @click.stop="">
      <div class="modal__header">
        <h2 class="title-2">Registrere progresjon</h2>
        <button class="btn btn--borderless" @click="close"><i class="fa fa-times"></i></button>
      </div>

      <main class="modal__main" v-if="key_result">
        <div class="title">
          <p class="pill">Nøkkelresultat</p>
          <h3 class="title-3">{{ key_result.key_result }}</h3>
        </div>
        <progress-bar class="progress" :keyres="key_result"></progress-bar>
        <input
          class="range"
          type="range"
          :min="key_result.from_value"
          :max="key_result.target_value"
          v-model="newValue"
        />
        <label class="form-field">
          <span class="form-label">Verdi</span>
          <input type="number" v-model="newValue" />
        </label>
        <div class="dots">
          <div class="dot" v-for="(dot, i) in key_results" :key="dot.id" :class="{ active: i === index }"></div>
        </div>
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
import { serializeDocument } from '@/util/db';
import ProgressBar from '@/components/ProgressBar.vue';
import * as Toast from '@/util/toasts';
import Audit from '@/util/audit/audit';

export default {
  data: () => ({
    index: 0,
    objectives: [],
    key_results: [],
    unsubscribeObjectives: null,
    unsubscribeKeyResults: null,
    newValue: null,
  }),

  computed: {
    ...mapState(['user', 'product', 'quarters']),

    key_result() {
      return this.key_results[this.index];
    },

    progress() {
      return {
        date: new Date(),
        value: +this.newValue,
        archived: false,
        created: new Date(),
        created_by: this.user.ref,
      };
    },
  },

  watch: {
    key_result(obj) {
      this.newValue = obj.currentValue;
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
      if (this.index < 0) this.index = this.key_results.length - 1;
    },

    skip() {
      this.index += 1;
      if (this.index >= this.key_results.length) this.index = 0;
    },

    async save() {
      await this.key_results[this.index].ref
        .collection('progression')
        .add(this.progress)
        .then(Toast.addedProgression)
        .then(this.updateCurrentValue)
        .catch(this.$errorHandler);

      this.skip();
      if (this.index === 0) this.close();
    },

    async updateCurrentValue() {
      const oldValue = this.key_result.currentValue;
      const newValue = await this.key_result.ref
        .collection('progression')
        .orderBy('date', 'desc')
        .limit(1)
        .get()
        .then(snapshot => snapshot.docs[0].data().value)
        .catch(this.$errorHandler);

      if (oldValue === newValue) return;

      return this.key_result.ref
        .update({ currentValue: newValue })
        .then(() => {
          return Audit.keyResUpdateProgress(this.key_result.ref, this.product.ref, oldValue, newValue);
        })
        .catch(this.$errorHandler);
    },

    getObjectives() {
      if (this.unsubscribeObjectives) this.unsubscribeObjectives();

      this.unsubscribeObjectives = this.product.ref
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
          .collection('key_results')
          .get()
          .then(snap => snap.docs.map(serializeDocument));
      });
      const keyResults = await Promise.all(promises).catch(this.$errorHandler);
      this.key_results = keyResults.flat();
    },
  },

  directives: {
    ClickOutside,
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors';

.overlay {
  position: fixed;
  top: 0;
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
  max-width: 50rem;
  overflow: hidden;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 0.25rem 0.45rem rgba(black, 0.5);

  &__header {
    display: flex;
    align-items: center;
    padding: 2rem;
    border-bottom: 1px solid $color-border;

    .btn {
      margin: 0;
      padding: 0 1.15rem;
    }

    .fa {
      margin: 0;
    }

    .title-2 {
      display: block;
      margin: 0;
      margin-right: auto;
    }
  }

  &__main {
    display: grid;
    grid-gap: 0.6rem 1.5rem;
    grid-template-areas:
      '. title .'
      '. progress .'
      'input slider .'
      'dots dots dots';
    grid-template-rows: 11rem 2.5rem 6rem 3rem;
    grid-template-columns: 5.5rem auto 5.5rem;
    padding: 2.5rem 2rem 2rem;
  }

  &__footer {
    display: flex;
    grid-area: 'footer';
    justify-content: space-evenly;
    padding: 1rem;
    background: $color-bg;
    border-top: 1px solid $color-border;

    .btn {
      justify-content: center;
      width: 100%;
      border-left: 1px solid $color-border;
      // outline: 1px solid green;

      &:first-child {
        border-left-color: transparent;
      }
    }
  }
}

.range {
  grid-area: slider;
  transform: translateY(1.25rem);
}

.title {
  grid-area: title;
  margin-bottom: 1.5rem;

  &-3 {
    margin: 0;
  }
}

.progress {
  grid-area: progress;
}

.form-field {
  grid-area: input;
}

.dots {
  display: flex;
  grid-area: dots;
  align-items: flex-end;
  justify-content: center;
  margin: 0 -0.3rem;
  margin-top: 2rem;
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

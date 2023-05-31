<template>
  <div class="saved-objective">
    <div v-if="data?.objective?.editedBy">
      <h2 class="title-1">{{ $t('objective.updated') }}</h2>
    </div>
    <div v-else>
      <h2 class="title-1">{{ $t('objective.created') }}</h2>
      <div class="saved-objective__button-row">
        <button class="btn btn--ter" @click="close">{{ $t('btn.close') }}</button>
        <button class="btn btn--sec" @click="addKeyResults">
          {{ $t('btn.addKeyResults') }}
        </button>
      </div>
    </div>
    <clapping-hands class="applause"></clapping-hands>
  </div>
</template>
<script>
import ClappingHands from '@/components/ClappingHands.vue';
import { mapMutations } from 'vuex';
import store from '@/store';

export default {
  name: 'SavedObjective',

  components: {
    ClappingHands,
  },

  props: {
    data: {
      type: Object,
      default() {
        return {};
      },
    },
    created: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    ...mapMutations(['TOGGLE_DRAWER']),
    close() {
      store.commit('TOGGLE_DRAWER', '');
    },
    addKeyResults() {
      this.TOGGLE_DRAWER({
        type: 'keyResult',
        show: true,
        data: {
          objective: this.data.objective,
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.saved-objective {
  position: relative;

  .title-1 {
    padding-bottom: 1.5rem;
    padding-left: 2rem;
  }
  .saved-objective__button-row {
    padding-left: 2rem;

    .btn--sec {
      margin-left: 0.5rem;
    }
  }
  .applause {
    position: fixed;
    bottom: 0;
  }
}
</style>

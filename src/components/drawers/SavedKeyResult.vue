<template>
  <div class="saved-key-result">
    <div v-if="data?.keyResult?.editedBy">
      <h2 class="title-1">{{ $t('keyResult.updated') }}</h2>
    </div>
    <div v-else>
      <h2 class="title-1">{{ $t('keyResult.created') }}</h2>
      <div class="saved-key-result__button-row">
        <button class="btn btn--ter" @click="close">{{ $t('btn.close') }}</button>
        <button class="btn btn--sec" @click="addKeyResult">
          {{ $t('btn.addKeyResult') }}
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
  name: 'SavedKeyResult',

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
    addKeyResult() {
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
.saved-key-result {
  position: relative;

  .title-1 {
    padding-bottom: 1.5rem;
    padding-left: 2rem;
  }
  .saved-key-result__button-row {
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

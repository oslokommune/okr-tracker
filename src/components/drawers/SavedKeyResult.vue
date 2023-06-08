<template>
  <div class="saved-key-result">
    <div v-if="!data.newKeyResult">
      <h2 class="title-1">{{ $t('keyResult.updated') }}</h2>
    </div>
    <div v-else>
      <h2 class="title-1">{{ $t('keyResult.created') }}</h2>
      <div class="saved-key-result__button-row">
        <pkt-button
          skin="tertiary"
          class="btn-close"
          @onClick="$emit('click', close())"
          >{{ $t('btn.close') }}</pkt-button
        >
        <pkt-button skin="secondary" @onClick="$emit('click', addKeyResults())">
          {{ $t('btn.addKeyResults') }}
        </pkt-button>
      </div>
    </div>
    <clapping-hands class="applause"></clapping-hands>
  </div>
</template>
<script>
import ClappingHands from '@/components/ClappingHands.vue';
import { PktButton } from '@oslokommune/punkt-vue2';
import { mapMutations } from 'vuex';
import store from '@/store';

export default {
  name: 'SavedKeyResult',

  components: {
    ClappingHands,
    PktButton,
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
.saved-key-result {
  position: relative;

  .title-1 {
    padding-bottom: 1.5rem;
    padding-left: 2rem;
  }
  .saved-key-result__button-row {
    padding-left: 2rem;

    .btn-close {
      margin-right: 1rem;
    }
  }
  .applause {
    position: fixed;
    bottom: 0;
    z-index: -1;
  }
}
</style>

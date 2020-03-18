<template>
  <div class="modal-wrapper">
    <div class="sidebar-nav__item" @click="openModal">
      <i v-if="loading" class="fa fas fa-fw fa-spinner"></i>
      <i v-else class="fa fas fa-fw fa-users"></i>
      <span v-if="loading">
        {{ $t('general.loading') }}
      </span>
      <span v-else>
        {{ $t('document.showMembers') }}
      </span>
    </div>
    <div class="overlay" v-show="open">
      <div class="modal" v-click-outside="closeModal">
        <div class="modal__header">
          <h2 class="title-2">{{ $t('document.members') }}</h2>
          <button class="btn btn--borderless" @click="closeModal">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="modal__main">
          <svg ref="svg"></svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ClickOutside from 'vue-click-outside';
import { getDepartmentMembers } from '@/db/db';
import ForceGraph from '@/util/forceGraph';

export default {
  data: () => ({
    open: false,
    graph: null,
    loading: false,
  }),

  methods: {
    closeModal() {
      this.open = false;
      this.loading = false;

      if (this.graph) this.graph.destroy();
    },
    async openModal() {
      this.loading = true;
      const tree = await getDepartmentMembers(this.document);
      this.graph = new ForceGraph(this.$refs.svg, tree, this.document.name);
      this.open = true;
      this.loading = false;
    },
  },

  props: {
    document: {
      type: Object,
      required: true,
    },
  },

  directives: {
    ClickOutside,
  },
};
</script>

<style lang="scss" scoped>
@import '../styles/_modal';

.modal-wrapper {
  position: relative;
  z-index: 100;
}
</style>

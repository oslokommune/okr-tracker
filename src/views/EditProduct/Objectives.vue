<template>
  <div class="container container--sidebar">
    <aside class="content--sidebar">
      <div class="add-object-modal-wrapper" v-click-outside="closeModal">
        <button class="btn btn--ghost btn--fw" @click="openModal" :disabled="modalIsOpen">
          <i class="fa far fa-plus fa-fw"></i>Legg til nytt mål
        </button>
        <add-objective
          v-if="modalIsOpen"
          @close-menu="closeModal"
          style="width:300px;"
          :productref="docref"
          :selected-quarter="selectedQuarter"
        ></add-objective>
      </div>
    </aside>
    <main class="content--main content--padding section">
      <div class="content-header">
        <h2 class="title-2">Administrer mål</h2>
        <span class="quarter-selector__label">Velg kvartal</span>
        <v-select
          v-if="quarters"
          label="name"
          class="quarter-selector__selector"
          :options="quarters"
          v-model="selectedQuarter"
        ></v-select>
      </div>

      <div class="content">
        <transition-group name="grid-animation" tag="div" class="grid-3">
          <edit-objective
            v-for="ref in objectiveRefs"
            :key="ref.id"
            :objective-ref="ref"
            class="grid-animation-item"
          ></edit-objective>
        </transition-group>
      </div>
    </main>
  </div>
</template>

<script>
import ClickOutside from 'vue-click-outside';

import { mapState } from 'vuex';
import AddObjective from '@/components/Objective/addObjective.vue';
import EditObjective from '@/components/Objective/editObjective.vue';

export default {
  components: {
    AddObjective,
    EditObjective,
  },

  data: () => ({
    modalIsOpen: false,
    objectiveRefs: [],
    selectedQuarter: null,
  }),

  computed: {
    ...mapState(['quarters']),
  },

  watch: {
    selectedQuarter(quarter) {
      this.docref
        .collection('objectives')
        .where('quarter', '==', quarter.name)
        .where('archived', '==', false)
        .onSnapshot(snapshot => {
          this.objectiveRefs = snapshot.docs;
        });
    },
  },

  mounted() {
    const [firstQuarter] = this.quarters;
    this.selectedQuarter = firstQuarter;
  },

  methods: {
    openModal() {
      this.modalIsOpen = true;
    },
    closeModal() {
      this.modalIsOpen = false;
    },
  },

  directives: {
    ClickOutside,
  },

  props: {
    docref: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.grid-animation-item {
  display: inline-block;
  transform: scaleX(1);
  transition: all 0.5s;
}
.grid-animation-enter, .grid-animation-leave-to
/* .list-complete-leave-active below version 2.1.8 */ {
  transform: scaleX(0);
  opacity: 0;
}
.grid-animation-leave-active {
  position: absolute;
}
</style>

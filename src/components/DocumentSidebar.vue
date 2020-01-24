<template>
  <aside class="content--sidebar">
    <nav class="sidebar-nav">
      <template v-if="hasEditPermissions">
        <router-link
          :to="{
            name: type === 'department' ? 'edit-department' : 'edit-product',
            params: { slug: $route.params.slug },
          }"
          class="sidebar-nav__item"
        >
          <i class="fa fas fa-fw fa-edit"></i>Endre produkt
        </router-link>
        <div class="add-object-menu-wrapper" v-click-outside="closeAddObjective">
          <div class="sidebar-nav__item" @click="expandAddObjective = true">
            <i class="fa fas fa-fw fa-plus"></i>Legg til mål
          </div>

          <add-objective
            v-if="expandAddObjective"
            :productref="document.ref"
            @close-menu="expandAddObjective = false"
          ></add-objective>
        </div>

        <div class="add-object-menu-wrapper" v-click-outside="closeAddKeyres">
          <div class="sidebar-nav__item" @click="expandAddKeyRes = true">
            <i class="fa fas fa-fw fa-plus"></i>Nytt nøkkelresultat
          </div>
          <add-keyres
            v-if="expandAddKeyRes"
            @close-menu="expandAddKeyRes = false"
            :productref="document.ref"
            :selected-quarter-name="activeQuarter.name"
          ></add-keyres>
        </div>

        <div class="register-progress-wrapper">
          <div class="sidebar-nav__item" @click="expandRegisterProgress = true">
            <i class="fa fas fa-fw fa-chart-line"></i>Oppdater data
          </div>
          <register-progress-modal
            v-if="expandRegisterProgress"
            @close="closeRegisterProgress"
            :document="document"
          ></register-progress-modal>
        </div>
      </template>
      <div class="sidebar-nav__item"><i class="fa fas fa-fw fa-dashboard"></i>Dashboard</div>
      <div class="sidebar-nav__item"><i class="fa fas fa-fw fa-photo"></i>Eksporter grafikk</div>
    </nav>
  </aside>
</template>
<script>
import ClickOutside from 'vue-click-outside';
import AddKeyres from './KeyRes/addKeyres.vue';
import AddObjective from './Objective/addObjective.vue';
import RegisterProgressModal from './RegisterProgressModal.vue';

export default {
  name: 'DocumentSidebar',

  components: { AddKeyres, AddObjective, RegisterProgressModal },

  data: () => ({
    expandAddObjective: false,
    expandAddKeyRes: false,
    expandRegisterProgress: false,
  }),

  props: {
    hasEditPermissions: {
      type: Boolean,
      required: false,
      default: false,
    },
    document: {
      type: Object,
      required: true,
    },
    activeQuarter: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },

  methods: {
    closeAddObjective() {
      this.expandAddObjective = false;
    },
    closeAddKeyres() {
      this.expandAddKeyRes = false;
    },
    closeRegisterProgress() {
      this.expandRegisterProgress = false;
    },
  },

  directives: {
    ClickOutside,
  },
};
</script>
<style lang="scss" scoped>
@import '../styles/colors';

.add-object-menu-wrapper {
  position: relative;
}
</style>

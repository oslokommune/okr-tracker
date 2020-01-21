<template>
  <aside class="content--sidebar">
    <nav class="sidebar-nav">
      <template v-if="hasEditPermissions">
        <router-link :to="{ name: 'edit-product', params: { slug: $route.params.slug } }" class="sidebar-nav__item">
          <i class="fa fas fa-fw fa-edit"></i>Endre produkt</router-link
        >
        <div class="add-object-menu-wrapper" v-click-outside="closeAddObjective">
          <div class="sidebar-nav__item" @click="expandAddObjective = true">
            <i class="fa fas fa-fw fa-plus"></i>Legg til mål
          </div>

          <add-objective
            v-if="expandAddObjective"
            :productref="product.ref"
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
            :productref="product.ref"
            :selected-quarter-name="activeQuarter.name"
          ></add-keyres>
        </div>

        <div class="register-progress-wrapper">
          <div class="sidebar-nav__item" @click="expandRegisterProgress = true">
            <i class="fa fas fa-fw fa-chart-line"></i>Oppdater data
          </div>
          <RegisterProgressModal v-if="expandRegisterProgress" @close="closeRegisterProgress"></RegisterProgressModal>
        </div>
      </template>
      <div class="sidebar-nav__item"><i class="fa fas fa-fw fa-dashboard"></i>Dashboard</div>
      <div class="sidebar-nav__item"><i class="fa fas fa-fw fa-photo"></i>Eksporter grafikk</div>
    </nav>
  </aside>
</template>

<script>
import ClickOutside from 'vue-click-outside';
import AddObjective from '@/components/Objective/addObjective.vue';
import AddKeyres from '@/components/KeyRes/addKeyres.vue';
import RegisterProgressModal from './RegisterProgressModal.vue';

export default {
  data: () => ({
    expandAddObjective: false,
    expandAddKeyRes: false,
    expandRegisterProgress: false,
  }),

  components: {
    AddObjective,
    AddKeyres,
    RegisterProgressModal,
  },

  props: {
    hasEditPermissions: {
      type: Boolean,
      required: false,
      default: false,
    },
    product: {
      type: Object,
      required: true,
    },
    activeQuarter: {
      type: Object,
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
.add-object-menu-wrapper {
  position: relative;
}
</style>

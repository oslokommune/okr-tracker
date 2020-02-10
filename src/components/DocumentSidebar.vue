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
          v-tooltip.right="`Endre detaljer og team`"
        >
          <i class="fa fas fa-fw fa-edit"></i>Endre produkt
        </router-link>
        <div class="add-object-menu-wrapper" v-click-outside="closeAddObjective">
          <div class="sidebar-nav__item" @click="expandAddObjective = true" v-tooltip.right="`Legg til et nytt mål`">
            <i class="fa fas fa-fw fa-plus"></i>Legg til mål
          </div>

          <add-objective
            v-if="expandAddObjective"
            :productref="document.ref"
            @close-menu="expandAddObjective = false"
          ></add-objective>
        </div>

        <div class="add-object-menu-wrapper" v-click-outside="closeAddKeyres">
          <div
            class="sidebar-nav__item"
            @click="expandAddKeyRes = true"
            v-tooltip.right="`Legg til nytt nøkkelresultat for eksisterende mål`"
          >
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
          <div
            class="sidebar-nav__item"
            @click="expandRegisterProgress = true"
            v-tooltip.right="`Registrere nye verdier til nøkkelresultatene`"
          >
            <i class="fa fas fa-fw fa-chart-line"></i>Oppdater data
          </div>
          <register-progress-modal
            v-if="expandRegisterProgress"
            @close="closeRegisterProgress"
            :document="document"
          ></register-progress-modal>
        </div>
      </template>
      <router-link :to="{ name: 'dashboard' }" class="sidebar-nav__item" v-tooltip.right="`Gå til dashboard-visning`">
        <i class="fa fas fa-fw fa-dashboard"></i>Dashboard
      </router-link>
      <div class="sidebar-nav__item" v-tooltip.right="`Eksporter skjermbilder til presentasjoner (1920x1080)`">
        <i class="fa fas fa-fw fa-photo"></i>Eksporter grafikk
      </div>
    </nav>
    <div class="edited edited--mt" v-tooltip="prettyDate">Endret {{ edited }}</div>
  </aside>
</template>
<script>
import ClickOutside from 'vue-click-outside';
import AddKeyres from './KeyRes/addKeyres.vue';
import AddObjective from './Objective/addObjective.vue';
import RegisterProgressModal from './RegisterProgressModal.vue';
import { timeFromNow, datePretty } from '../util/utils';

export default {
  name: 'DocumentSidebar',

  components: { AddKeyres, AddObjective, RegisterProgressModal },

  data: () => ({
    expandAddObjective: false,
    expandAddKeyRes: false,
    expandRegisterProgress: false,
  }),

  computed: {
    edited() {
      const timestamp = this.document.edited || this.document.created;
      if (!timestamp) return null;
      return timeFromNow(timestamp.toDate());
    },
    prettyDate() {
      const timestamp = this.document.edited || this.document.created;
      if (!timestamp) return null;
      return datePretty(timestamp.toDate());
    },
  },

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

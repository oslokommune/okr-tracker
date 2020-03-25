<template>
  <aside class="content--sidebar">
    <nav class="sidebar-nav">
      <template v-if="hasEditPermissions">
        <router-link
          :to="{
            name: editLinkName,
            params: { slug: $route.params.slug },
          }"
          class="sidebar-nav__item"
          v-tooltip.right="$t('tooltip.changeDetailsAndTeam')"
        >
          <i class="fa fas fa-fw fa-edit"></i>
          {{ $t('document.changeProduct') }}
        </router-link>
        <div class="add-object-menu-wrapper" v-click-outside="closeAddObjective">
          <div
            class="sidebar-nav__item"
            @click="expandAddObjective = true"
            v-tooltip.right="$t('tooltip.addObjective')"
          >
            <i class="fa fas fa-fw fa-plus"></i>
            {{ $t('document.addObjective') }}
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
            v-tooltip.right="$t('tooltip.addKeyresToObjective')"
          >
            <i class="fa fas fa-fw fa-plus"></i>
            {{ $t('document.newKeyres') }}
          </div>
          <add-keyres
            v-if="expandAddKeyRes"
            @close-menu="expandAddKeyRes = false"
            :productref="document.ref"
          ></add-keyres>
        </div>

        <div class="register-progress-wrapper">
          <div
            class="sidebar-nav__item"
            @click="expandRegisterProgress = true"
            v-tooltip.right="$t('tooltip.updateKeyres')"
          >
            <i class="fa fas fa-fw fa-chart-line"></i>
            {{ $t('document.updateData') }}
          </div>
          <register-progress-modal
            v-if="expandRegisterProgress"
            @close="closeRegisterProgress"
            :document="document"
          ></register-progress-modal>
        </div>
      </template>
      <router-link
        v-if="type === 'product'"
        :to="{ name: 'dashboard' }"
        class="sidebar-nav__item"
        v-tooltip.right="$t('tooltip.dashboard')"
      >
        <i class="fa fas fa-fw fa-tachometer-alt"></i>
        {{ $t('general.dashboard') }}
      </router-link>

      <membersModal v-if="type === 'department'" class="members-wrapper" :document="document"></membersModal>
      <!-- <div class="sidebar-nav__item" v-tooltip.right="$t('tooltip.export')">
        <i class="fa fas fa-fw fa-image"></i>{{$t('document.export')}}
      </div>-->
    </nav>
    <div class="edited edited--mt" v-tooltip="prettyDate">{{ $tc('document.edited', null, { date: edited }) }}</div>
  </aside>
</template>
<script>
import ClickOutside from 'vue-click-outside';
import AddKeyres from '@/components/KeyRes/addKeyres.vue';
import AddObjective from '@/components/Objective/addObjective.vue';
import RegisterProgressModal from '@/components/RegisterProgressModal.vue';
import MembersModal from '@/components/MembersModal.vue';
import { timeFromNow, datePretty } from '@/util/utils';

export default {
  name: 'DocumentSidebar',

  components: { AddKeyres, AddObjective, RegisterProgressModal, MembersModal },

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
    editLinkName() {
      if (!this.type) return;
      return `edit-${this.type}`;
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
.add-object-menu-wrapper {
  position: relative;
}
</style>

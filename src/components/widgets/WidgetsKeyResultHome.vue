<template>
  <aside v-if="activeKeyResult" class="wrapper">
    <div class="keyresult" v-if="editRights">
      <router-link
        class="btn btn--ter btn--icon"
        :to="{ name: 'ItemAdminOKRs', query: { type: 'keyResult', id: activeKeyResult.id } }"
      >
        <i class="icon fa fa-edit"></i>
        Endre nøkkelresultat
      </router-link>
    </div>

    <div class="widgets" v-if="activeKeyResult">
      <widget-key-result-details></widget-key-result-details>
      <widget-key-result-notes></widget-key-result-notes>
      <widget-key-result-weights></widget-key-result-weights>
    </div>
  </aside>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'WidgetsKeyResultHome',

  computed: {
    ...mapState(['activeKeyResult', 'user']),
    editRights() {
      if (this.user.admin) return true;
      const { team } = this.activeKeyResult.parent;
      if (!team) return false;
      return team.includes(this.user.ref.path);
    },
  },
  components: {
    WidgetKeyResultDetails: () => import('./WidgetKeyResultDetails.vue'),
    WidgetKeyResultNotes: () => import('./WidgetKeyResultNotes.vue'),
    WidgetKeyResultWeights: () => import('./WidgetKeyResultWeights.vue'),
  },
};
</script>

<style lang="scss" scoped>
.wrapper {
  position: relative;
  width: span(12);
  margin-top: 0.5rem;

  @media screen and (min-width: bp(l)) {
    width: span(3, 0, span(10));
    margin-left: span(0, 1, span(10));
  }

  @media screen and (min-width: bp(xl)) {
    width: span(3, 0, span(10));
    margin-left: span(1, 2, span(10));
  }
}
.keyresult {
  display: flex;
  width: 100%;
  margin: 1.75rem 0 1rem;

  & > .btn {
    width: 100%;
  }
}
</style>

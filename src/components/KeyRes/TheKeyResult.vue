<template>
  <div class="keyres">
    <router-link
      class="keyres__text"
      :to="{ name: 'key-result', params: { keyresid: keyres.id } }"
      v-tooltip.left="`Vis detaljer`"
    >
      <i class="fa fa-check-square row-icon" v-if="percentage === '100%'"></i>
      <div class="keyres__name">
        {{ keyres.key_result }}
      </div>
      <div class="keyres__edited edited">Sist oppdatert {{ edited }}</div>
    </router-link>

    <button
      v-if="hasEditPermissions"
      class="btn btn--borderless keyres__toggle"
      v-tooltip="editMode ? `Lukk` : `Oppdater verdi for nøkkelresultat`"
      @click="editMode = !editMode"
    >
      <i class="fa fa-fw" :class="{ 'fa-times': editMode, 'fa-wrench': !editMode }"></i>
    </button>

    <div v-if="!editMode" class="keyres__bar" v-tooltip.right="`${percentage}`">
      <progress-bar :keyres="keyres"></progress-bar>
    </div>

    <div v-if="editMode && hasEditPermissions">
      <form class="keyres__edit" @submit.prevent="saveNewProgress">
        <input
          type="number"
          v-model="value"
          v-tooltip="{ content: 'Ny verdi', trigger: 'focus', hideOnTargetClick: false }"
        />
        <button class="btn" v-tooltip="`Lagre`"><i class="fa fa-check"></i></button>
      </form>
    </div>
  </div>
</template>

<script>
import { scaleLinear, format } from 'd3';
import { mapState } from 'vuex';
import ProgressBar from '../ProgressBar.vue';
import { timeFromNow } from '../../util/utils';
import { isTeamMemberOfProduct, registerNewProgress } from '../../util/db';

export default {
  name: 'TheKeyResult',

  data: () => ({
    editMode: false,
    hasEditPermissions: false,
    value: 0,
  }),

  computed: {
    ...mapState(['user']),
    edited() {
      if (!this.keyres) return null;
      const timestamp = this.keyres.edited || this.keyres.created;
      return timeFromNow(timestamp.toDate());
    },

    percentage() {
      const scale = scaleLinear().domain([this.keyres.start_value, this.keyres.target_value]);
      const percentage = scale(this.keyres.currentValue || 0);

      return format('.0%')(percentage);
    },
  },

  props: {
    keyres: {
      type: Object,
      required: true,
    },
  },

  methods: {
    async saveNewProgress() {
      await registerNewProgress(this.keyres, +this.value, this.user.ref);
      this.editMode = false;
    },
  },

  watch: {
    keyres(keyres) {
      this.value = keyres.currentValue || keyres.start_value || 0;
    },
  },

  async created() {
    this.hasEditPermissions = await isTeamMemberOfProduct(this.$route.params.slug);
    this.value = this.keyres.currentValue || this.keyres.start_value || 0;
  },

  components: {
    ProgressBar,
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors';

.keyres {
  position: relative;
  display: grid;
  grid-gap: 0 1rem;
  grid-template-columns: 1fr auto 300px;
  align-content: center;
  align-items: center;
  padding: 0.5rem 0;
  border-top: 1px solid $color-border;

  &:last-child {
    border-bottom: 1px solid $color-border;
  }

  &__text {
    grid-row: 1;
    align-content: center;
    margin-left: -0.5rem;
    padding-right: 1rem;
    padding-left: 0.5rem;
  }

  &__toggle {
    grid-column: 2;
    align-self: center;
    color: $color-grey-300;

    .fa {
      margin: 0;
      padding: 0;
    }
  }

  &__edited {
    grid-row: 2;
    grid-column: 1;
    padding-top: 0.15rem;
  }

  &__edit {
    display: flex;
    align-items: center;
    height: 3.5rem;

    .fa {
      margin: 0;
      padding: 0;
    }
  }

  &__bar {
    grid-row: 1 / span all;
    grid-column: 3;
    align-self: center;
    height: 3.5rem;
    padding: 0.25rem 0;
  }
}

.row-icon {
  position: absolute;
  top: calc(50% - 1.15rem);
  left: -1.5rem;
  color: $color-yellow;
  font-size: 1.15rem;
}
</style>

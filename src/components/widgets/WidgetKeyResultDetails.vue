<template>
  <widget v-if="activeKeyResult" :title="$t('general.details')" size="small" collapsable>
    <div class="details">
      <div v-if="activeObjective" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('keyResult.belongsTo') }}</h3>
        <div class="details__item-body">
          <div class="details__item-value">
            <router-link
              :to="{
                name: 'ObjectiveHome',
                params: { objectiveId: activeObjective.id },
              }"
            >
              {{ activeObjective.name }}
            </router-link>
          </div>
        </div>
      </div>

      <div
        v-if="activeObjective && formattedPeriod(activeObjective)"
        class="details__item"
      >
        <h3 class="title-3 details__item-heading">{{ $t('objective.period') }}</h3>
        <div class="details__item-body">
          <div class="details__item-value">
            {{ formattedPeriod(activeObjective) }}
          </div>
        </div>
      </div>

      <div v-if="activeKeyResult.created" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('objective.created') }}</h3>
        <div class="details__item-body">
          <div class="details__item-value">{{ formatDate(activeKeyResult.created) }}</div>
        </div>
      </div>

      <div v-if="activeKeyResult.createdBy" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('objective.createdBy') }}</h3>

        <div class="details__item-body">
          <div class="details__item-value">
            <div class="details__item-value user">
              <a
                v-if="activeKeyResult.createdBy.id"
                @click="openProfileModal(activeKeyResult.createdBy.id)"
              >
                <span>{{ createdBy }}</span>
              </a>
              <span v-else>{{ activeKeyResult.createdBy }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeKeyResult.edited" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('objective.edited') }}</h3>
        <div class="details__item-body">
          <div class="details__item-value">{{ formatDate(activeKeyResult.edited) }}</div>
        </div>
      </div>

      <div v-if="activeKeyResult.editedBy" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('objective.editedBy') }}</h3>

        <div class="details__item-body">
          <div class="details__item-value user">
            <a
              v-if="activeKeyResult.editedBy.id"
              @click="openProfileModal(activeKeyResult.editedBy.id)"
            >
              <span>{{ editedBy }}</span>
            </a>
            <span v-else>{{ activeKeyResult.editedBy }}</span>
          </div>
        </div>
      </div>

      <div v-if="activeKeyResult.startValue !== undefined" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('keyResult.startValue') }}</h3>
        <div class="details__item-body">
          <span class="details__item-icon">#</span>
          <div class="details__item-value">{{ activeKeyResult.startValue }}</div>
        </div>
      </div>

      <div v-if="activeKeyResult.targetValue !== undefined" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('keyResult.targetValue') }}</h3>
        <div class="details__item-body">
          <span class="details__item-icon">#</span>
          <div class="details__item-value">{{ activeKeyResult.targetValue }}</div>
        </div>
      </div>

      <div v-if="activeKeyResult.unit" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('keyResult.unit') }}</h3>
        <div class="details__item-body">
          <div class="details__item-value">{{ activeKeyResult.unit }}</div>
        </div>
      </div>
    </div>

    <profile-modal
      v-if="showProfileModal"
      :id="chosenProfileId"
      @close="closeProfileModal"
    />
  </widget>
</template>

<script>
import { mapState } from 'vuex';
import { db } from '@/config/firebaseConfig';
import { dateLong } from '@/util';
import { formattedPeriod } from '@/util/okr';
import ProfileModal from '@/components/modals/ProfileModal.vue';
import Widget from './WidgetWrapper.vue';

export default {
  name: 'WidgetKeyResultDetails',

  components: {
    Widget,
    ProfileModal,
  },

  data: () => ({
    progress: [],
    showProfileModal: false,
    chosenProfileId: null,
  }),

  computed: {
    ...mapState('okrs', ['activeObjective', 'activeKeyResult']),
    createdBy() {
      return (
        this.activeKeyResult.createdBy.displayName || this.activeKeyResult.createdBy.id
      );
    },
    editedBy() {
      return (
        this.activeKeyResult.editedBy.displayName || this.activeKeyResult.editedBy.id
      );
    },
  },

  watch: {
    activeKeyResult: {
      immediate: true,
      async handler(keyResult) {
        if (!keyResult) {
          return;
        }
        await this.$bind(
          'progress',
          db.collection(`keyResults/${keyResult.id}/progress`)
        );
      },
    },
  },

  methods: {
    formattedPeriod,

    formatDate(date) {
      return dateLong(date.toDate());
    },

    openProfileModal(profileId) {
      this.showProfileModal = true;
      this.chosenProfileId = profileId;
    },

    closeProfileModal() {
      this.showProfileModal = false;
      this.chosenProfileId = null;
    },
  },
};
</script>

<style lang="scss" scoped>
.user {
  padding: 0.2rem;
  cursor: pointer;

  &:hover {
    background: rgba(var(--color-grayscale-50-rgb), 0.1);
  }
}

.details__item-icon {
  margin-top: 0;
  font-weight: 900;
  user-select: none;
}
</style>

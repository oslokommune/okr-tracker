<template>
  <widget v-if="activeKeyResult" :title="$t('general.details')">
    <div class="details">
      <div v-if="activeKeyResult.objective" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('keyResult.belongsTo') }}</h3>
        <div class="details__item-body">
          <div class="details__item-value">
            <router-link
              :to="{
                name: 'ObjectiveHome',
                params: { objectiveId: activeKeyResult.objective.id },
              }"
            >
              {{ activeKeyResult.objective.name }}
            </router-link>
          </div>
        </div>
      </div>

      <div v-if="activePeriod && activePeriod.startDate" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('objective.period') }}</h3>
        <div class="details__item-body">
          <div class="details__item-value">
            {{ activePeriod.name }} ({{ formatPeriodDates(activePeriod) }})
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
          <div class="details__item-icon fa fa-hashtag"></div>
          <div class="details__item-value">{{ activeKeyResult.startValue }}</div>
        </div>
      </div>

      <div v-if="activeKeyResult.targetValue !== undefined" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('keyResult.targetValue') }}</h3>
        <div class="details__item-body">
          <div class="details__item-icon fa fa-hashtag"></div>
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
import { periodDates, dateShort, dateLong } from '@/util';

export default {
  name: 'WidgetKeyResultDetails',

  components: {
    Widget: () => import('./WidgetWrapper.vue'),
    ProfileModal: () => import('@/components/modals/ProfileModal.vue'),
  },

  data: () => ({
    progress: [],
    showProfileModal: false,
    chosenProfileId: null,
  }),

  computed: {
    ...mapState(['activeKeyResult', 'activePeriod']),
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
        if (!keyResult) return;
        await this.$bind(
          'progress',
          db.collection(`keyResults/${keyResult.id}/progress`)
        );
      },
    },
  },

  methods: {
    formatPeriodDates(period) {
      return periodDates(period, dateShort);
    },

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
    background: rgba(var(--color-grey-500-rgb), 0.1);
  }
}
</style>

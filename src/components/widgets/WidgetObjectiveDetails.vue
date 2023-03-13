<template>
  <widget v-if="activeObjective" :title="$t('general.details')" size="small">
    <div class="details">
      <div
        v-if="activeObjective.period && activeObjective.period.startDate"
        class="details__item"
      >
        <h3 class="title-3 details__item-heading">{{ $t('objective.period') }}</h3>
        <div class="details__item-body">
          <div class="details__item-value">
            {{ activeObjective.period.name }} ({{
              formatPeriodDates(activeObjective.period)
            }})
          </div>
        </div>
      </div>

      <div v-if="activeObjective.created" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('objective.created') }}</h3>
        <div class="details__item-body">
          <div class="details__item-value">{{ formatDate(activeObjective.created) }}</div>
        </div>
      </div>

      <div v-if="activeObjective.createdBy" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('objective.createdBy') }}</h3>

        <div class="details__item-body">
          <div class="details__item-value">
            <div class="details__item-value user">
              <a
                v-if="activeObjective.createdBy.id"
                @click="openProfileModal(activeObjective.createdBy.id)"
              >
                <span>{{ createdBy }}</span>
              </a>
              <span v-else>{{ activeObjective.createdBy }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeObjective.edited" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('objective.edited') }}</h3>
        <div class="details__item-body">
          <div class="details__item-value">{{ formatDate(activeObjective.edited) }}</div>
        </div>
      </div>

      <div v-if="activeObjective.editedBy" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('objective.editedBy') }}</h3>

        <div class="details__item-body">
          <div class="details__item-value user">
            <a
              v-if="activeObjective.editedBy.id"
              @click="openProfileModal(activeObjective.editedBy.id)"
            >
              <span>{{ editedBy }}</span>
            </a>
            <span v-else>{{ activeObjective.editedBy }}</span>
          </div>
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
import { periodDates, dateShort, dateLong } from '@/util';

export default {
  name: 'WidgetObjectiveDetails',

  components: {
    Widget: () => import('./WidgetWrapper.vue'),
    ProfileModal: () => import('@/components/modals/ProfileModal.vue'),
  },

  data: () => ({
    showProfileModal: false,
    chosenProfileId: null,
  }),

  computed: {
    ...mapState(['activeObjective']),
    createdBy() {
      return (
        this.activeObjective.createdBy.displayName || this.activeObjective.createdBy.id
      );
    },
    editedBy() {
      return (
        this.activeObjective.editedBy.displayName || this.activeObjective.editedBy.id
      );
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
    background: rgba(var(--color-grayscale-50-rgb), 0.1);
  }
}
</style>

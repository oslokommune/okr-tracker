<template>
  <div class="progress-history-table">
    <table v-if="historyRecords.length" class="table">
      <thead>
        <tr>
          <th>{{ $t('widget.history.date') }}</th>
          <th>{{ $t('widget.history.value') }}</th>
          <th v-if="hasAnyChangedBy">
            {{ $t('widget.history.changedBy') }}
          </th>
          <th v-if="hasAnyComments" class="table__comments">
            <span v-if="showComments">{{ $t('widget.history.comment') }}</span>
            <pkt-button
              v-tooltip="
                !showComments
                  ? $t('widget.history.showComments')
                  : $t('widget.history.hideComments')
              "
              skin="tertiary"
              variant="icon-only"
              :icon-name="showComments ? 'close' : 'eye'"
              @onClick="showComments = !showComments"
            />
          </th>
          <th v-if="hasEditRights" style="width: 1rem">
            {{ $t('widget.history.actions') }}
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="record in historyRecords" :key="record.id">
          <td>
            <slot name="date-cell" :record="record">{{ record.timestamp.toDate() }}</slot>
          </td>
          <td>
            <slot name="value-cell" :record="record">{{ record.value }}</slot>
          </td>
          <td v-if="hasAnyChangedBy">
            <user-link
              v-if="record.editedBy || record.createdBy"
              :user="record.editedBy || record.createdBy"
              @open-user-modal="openProfileModal"
            />
          </td>
          <td v-if="hasAnyComments" style="max-width: 200px; padding: 0.25rem 0.5rem">
            <span v-if="record.comment && showComments" class="record__comment">
              {{ record.comment }}
            </span>
            <v-popover v-if="record.comment && !showComments" placement="top">
              <pkt-button
                v-tooltip="$t('widget.history.showComment')"
                class="record__comment-icon"
                size="small"
                skin="tertiary"
                variant="icon-only"
                icon-name="feedback"
              />
              <template slot="popover">
                {{ record.comment }}
              </template>
            </v-popover>
          </td>
          <td v-if="hasEditRights">
            <div class="record__actions">
              <pkt-button
                v-tooltip="$t('tooltip.editProgress')"
                size="small"
                skin="tertiary"
                variant="icon-only"
                icon-name="edit"
                @onClick="$emit('edit-record', record)"
              />
              <btn-delete
                v-tooltip="$t('tooltip.deleteProgress')"
                size="small"
                variant="icon-only"
                @click="$emit('delete-record', record)"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="isLoading" class="progress-history-table__loading">
      <loading-small />
      {{ $t('general.loading') }}
    </div>

    <empty-state
      v-else-if="!historyRecords.length"
      icon="history"
      :heading="$t('widget.history.empty.heading')"
      :body="noValuesMessage"
    />

    <div class="progress-history-table__footer">
      <pkt-button
        v-if="!isLoading && isLimited"
        skin="secondary"
        @onClick="$emit('load-more')"
      >
        {{ $t('btn.showMore') }}
      </pkt-button>
    </div>

    <profile-modal
      v-if="showProfileModal"
      :id="chosenProfileId"
      @close="closeProfileModal"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { PktButton } from '@oslokommune/punkt-vue2';
import { BtnDelete } from '@/components/generic/form/buttons';
import EmptyState from '@/components/EmptyState.vue';
import LoadingSmall from '@/components/LoadingSmall.vue';
import ProfileModal from '@/components/modals/ProfileModal.vue';
import UserLink from './UserLink.vue';

export default {
  name: 'ProgressHistoryTable',

  components: {
    EmptyState,
    PktButton,
    ProfileModal,
    LoadingSmall,
    UserLink,
    BtnDelete,
  },

  props: {
    historyRecords: {
      type: Array,
      required: true,
    },
    isLoading: {
      type: Boolean,
      required: true,
    },
    isLimited: {
      type: Boolean,
      required: false,
      default: false,
    },
    noValuesMessage: {
      type: String,
      required: false,
      default: null,
    },
  },

  data: () => ({
    showComments: true,
    showProfileModal: false,
    chosenProfileId: null,
  }),

  computed: {
    ...mapGetters(['hasEditRights']),

    hasAnyComments() {
      return this.historyRecords.find(({ comment }) => comment) !== undefined;
    },

    hasAnyChangedBy() {
      return (
        this.historyRecords.find(({ createdBy, editedBy }) => createdBy || editedBy) !==
        undefined
      );
    },
  },

  methods: {
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
.progress-history-table {
  &__loading {
    padding: 0.65rem 0;
    text-align: center;
  }

  &__footer {
    text-align: center;
  }
}

.record__comment {
  white-space: pre-line;
}

.record__comment-icon {
  padding: 0.75rem;
}

.record__actions {
  display: flex;
}

.table__comments {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

td {
  overflow-wrap: break-word;
}
</style>

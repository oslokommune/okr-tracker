<template>
  <div class="progress-history-table">
    <table v-if="historyRecords.length" class="table">
      <thead>
        <tr>
          <th>{{ $t('widget.history.value') }}</th>
          <th>{{ $t('widget.history.date') }}</th>
          <th v-if="hasAnyChangedBy">
            {{ $t('widget.history.changedBy') }}
          </th>
          <th v-if="hasAnyComments">
            <span v-if="showComments">{{ $t('widget.history.comment') }}</span>
            <button class="btn btn--icon btn--ter" @click="showComments = !showComments">
              <span
                v-tooltip="
                  !showComments
                    ? $t('widget.history.showComments')
                    : $t('widget.history.hideComments')
                "
                class="fa"
                :class="!showComments ? 'fa-eye' : 'fa-eye-slash'"
              ></span>
            </button>
          </th>
          <th v-if="hasEditRights" style="width: 1rem">
            {{ $t('widget.history.actions') }}
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="record in historyRecords" :key="record.id">
          <td>
            <slot name="value-cell" :record="record">{{ record.value }}</slot>
          </td>
          <td>
            <slot name="date-cell" :record="record">{{ record.timestamp.toDate() }}</slot>
          </td>
          <td v-if="hasAnyChangedBy">
            <user-link
              v-if="record.editedBy || record.createdBy"
              :user="record.editedBy || record.createdBy"
              @open-user-modal="openProfileModal"
            />
          </td>
          <td v-if="hasAnyComments" style="max-width: 200px; padding: 0.25rem 0.5rem">
            <span v-if="record.comment && showComments">
              {{ record.comment }}
            </span>
            <v-popover v-if="record.comment && !showComments" placement="top">
              <i
                v-tooltip="$t('widget.history.showComment')"
                class="fa fa-comment-alt record__comment-icon"
              />
              <template slot="popover">
                {{ record.comment }}
              </template>
            </v-popover>
          </td>
          <td v-if="hasEditRights">
            <div class="record__actions">
              <btn
                v-tooltip="$t('tooltip.editProgress')"
                icon="edit"
                :label="$t('tooltip.editProgress')"
                :hide-label="true"
                variant="tertiary"
                @click="$emit('edit-record', record)"
              />
              <btn-delete
                v-tooltip="$t('tooltip.deleteProgress')"
                :hide-label="true"
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
      <button
        v-if="!isLoading && isLimited"
        class="btn btn--sec"
        @click="$emit('load-more')"
      >
        {{ $t('btn.showMore') }}
      </button>
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
import LoadingSmall from '@/components/LoadingSmall.vue';
import { Btn, BtnDelete } from '@/components/generic/form/buttons';
import UserLink from './UserLink.vue';

export default {
  name: 'ProgressHistoryTable',

  components: {
    EmptyState: () => import('@/components/EmptyState.vue'),
    ProfileModal: () => import('@/components/modals/ProfileModal.vue'),
    LoadingSmall,
    UserLink,
    Btn,
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

.btn--icon,
.record__comment-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  border-radius: 3px;

  &:hover {
    background: rgba(var(--color-grayscale-50-rgb), 0.1);
  }
}

.record__actions {
  display: flex;
}

td {
  overflow-wrap: break-word;
}
</style>
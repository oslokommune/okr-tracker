<template>
  <div class="widget__history">
    <h2 class="title-2">{{ $t('widget.history.title') }}</h2>

    <div class="main__table">
      <v-spinner v-if="isLoading" />

      <empty-state
        v-else-if="!progress.length || progress.length === 0"
        :icon="'history'"
        :heading="$t('widget.history.empty.heading')"
        :body="noValuesMessage || $t('widget.history.empty.body')"
      />

      <table v-else class="table">
        <thead>
          <tr>
            <th>{{ $t('widget.history.value') }}</th>
            <th>{{ $t('widget.history.date') }}</th>
            <th v-if="hasAnyChangedBy">
              {{ $t('widget.history.changedBy') }}
            </th>
            <th v-if="hasAnyComments">
              <span v-if="showComments">{{ $t('widget.history.comment') }}</span>
              <button
                class="btn btn--icon btn--ter"
                @click="showComments = !showComments"
              >
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
          <tr v-for="record in limitedProgress" :key="record.id">
            <td>{{ valueFormatter(record.value) }}</td>
            <td>{{ dateFormatter(record.timestamp.toDate()) }}</td>
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
                  @click="openValueModal(record)"
                />
                <btn-delete
                  v-tooltip="$t('tooltip.deleteProgress')"
                  :hide-label="true"
                  @click="$emit('delete-record', record.id)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <button
      v-if="progress.length > 10 && historyLimit !== null"
      class="btn btn--sec"
      style="align-self: center"
      @click="historyLimit = null"
    >
      {{ $t('btn.showMore') }}
    </button>

    <component
      :is="valueModal"
      v-if="valueModal && showValueModal"
      :record="chosenProgressRecord"
      @close="closeValueModal"
      @update-record="(id, data, close) => $emit('update-record', id, data, close)"
    />

    <profile-modal
      v-if="showProfileModal"
      :id="chosenProfileId"
      @close="closeProfileModal"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { dateTimeShort } from '@/util';
import { formatValue } from '@/util/keyResultProgress';
import { Btn, BtnDelete } from '@/components/generic/form/buttons';
import UserLink from './UserLink.vue';

export default {
  name: 'KeyResultHome',

  components: {
    EmptyState: () => import('@/components/EmptyState.vue'),
    ProfileModal: () => import('@/components/modals/ProfileModal.vue'),
    ProgressModal: () => import('@/components/modals/ProgressModal.vue'),
    UserLink,
    Btn,
    BtnDelete,
  },

  props: {
    isLoading: {
      type: Boolean,
      required: true,
    },
    progress: {
      type: Array,
      required: true,
    },
    valueFormatter: {
      type: Function,
      required: false,
      default: formatValue,
    },
    dateFormatter: {
      type: Function,
      required: false,
      default: dateTimeShort,
    },
    noValuesMessage: {
      type: String,
      required: false,
      default: null,
    },
  },

  data: () => ({
    historyLimit: 10,
    showComments: true,
    showProfileModal: false,
    valueModal: null,
    showValueModal: false,
    chosenProgressRecord: null,
    chosenProfileId: null,
  }),

  computed: {
    ...mapGetters(['hasEditRights']),

    hasAnyComments() {
      return this.progress.find(({ comment }) => comment) !== undefined;
    },
    hasAnyChangedBy() {
      return (
        this.progress.find(({ createdBy, editedBy }) => createdBy || editedBy) !==
        undefined
      );
    },
    limitedProgress() {
      return this.historyLimit
        ? this.progress.slice(0, this.historyLimit)
        : this.progress;
    },
  },

  mounted() {
    if (this.$route.name === 'KpiHome') {
      this.valueModal = () => import('@/components/modals/KPIProgressModal.vue');
    } else {
      this.valueModal = () => import('@/components/modals/ProgressModal.vue');
    }
  },

  methods: {
    dateTimeShort,

    openProfileModal(profileId) {
      this.showProfileModal = true;
      this.chosenProfileId = profileId;
    },

    closeProfileModal() {
      this.showProfileModal = false;
      this.chosenProfileId = null;
    },

    openValueModal(record) {
      this.chosenProgressRecord = record;
      this.showValueModal = true;
    },

    closeValueModal() {
      this.showValueModal = false;
      this.chosenProgressRecord = null;
    },
  },
};
</script>

<style lang="scss" scoped>
.main__table {
  width: 100%;
  overflow: auto;
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
</style>

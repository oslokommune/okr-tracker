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
            <th v-if="hasCreatedBy">
              {{ $t('widget.history.registeredBy') }}
            </th>
            <th v-if="hasComments">
              <span v-if="showComments">{{
                $t('widget.history.comment')
              }}</span>
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
            <th v-if="hasEditRights" style="width: 1rem"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in limitedProgress" :key="record.id">
            <td>{{ record.value }}</td>
            <td>{{ dateTimeShort(record.timestamp.toDate()) }}</td>
            <td v-if="hasCreatedBy">
              <a
                v-if="record.createdBy && record.createdBy.id"
                class="record__user-link"
                @click="openProfileModal(record.createdBy.id)"
              >
                <span>{{
                  record.createdBy.displayName || record.createdBy.id
                }}</span>
              </a>
              <span v-else>{{ record.createdBy }}</span>
            </td>
            <td
              v-if="hasComments"
              style="max-width: 200px; padding: 0.25rem 0.5rem"
            >
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
                <button
                  v-tooltip="$t('tooltip.editProgress')"
                  class="btn btn--icon btn--ter"
                  @click="openValueModal(record)"
                >
                  <i class="fa fa-edit" />
                </button>
                <v-popover offset="0" placement="top">
                  <button
                    v-tooltip="$t('tooltip.deleteProgress')"
                    class="btn btn--icon btn--ter"
                  >
                    <i class="fa fa-trash" />
                  </button>

                  <template slot="popover">
                    <button
                      class="btn btn--ter btn--negative"
                      @click="$emit('delete-record', record.id)"
                    >
                      {{ $t('btn.confirmDeleteProgress') }}
                    </button>
                  </template>
                </v-popover>
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

    <progress-modal
      v-if="showValueModal"
      :record="chosenProgressRecord"
      @close="closeValueModal"
      @update-record="
        (id, data, close) => $emit('update-record', id, data, close)
      "
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
import { VPopover } from 'v-tooltip';
import { dateTimeShort } from '@/util';

export default {
  name: 'KeyResultHome',

  components: {
    EmptyState: () => import('@/components/EmptyState.vue'),
    ProfileModal: () => import('@/components/ProfileModal.vue'),
    ProgressModal: () => import('@/components/modals/ProgressModal.vue'),
    VPopover,
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
    showValueModal: false,
    chosenProgressRecord: null,
    chosenProfileId: null,
  }),

  computed: {
    ...mapGetters(['hasEditRights']),

    hasComments() {
      return this.progress.find(({ comment }) => comment) !== undefined;
    },
    hasCreatedBy() {
      return this.progress.find(({ createdBy }) => createdBy) !== undefined;
    },
    limitedProgress() {
      return this.historyLimit
        ? this.progress.slice(0, this.historyLimit)
        : this.progress;
    },
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
    background: rgba(var(--color-grey-500-rgb), 0.1);
  }
}

.record__user-link {
  display: flex;
  align-items: center;
  color: var(--color-text);
  text-decoration: none;
  cursor: pointer;
}

.record__actions {
  display: flex;
}
</style>

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
          <tr
            v-for="{
              id,
              value,
              timestamp,
              comment,
              createdBy,
            } in limitedProgress"
            :key="id"
          >
            <td>{{ value }}</td>
            <td>{{ dateTimeShort(timestamp.toDate()) }}</td>
            <td v-if="hasCreatedBy">
              <a
                v-if="createdBy && createdBy.id"
                class="record__user-link"
                @click="openProfileModal(createdBy.id)"
              >
                <span>{{ createdBy.displayName || createdBy.id }}</span>
              </a>
              <span v-else>{{ createdBy }}</span>
            </td>
            <td
              v-if="hasComments"
              style="max-width: 200px; padding: 0.25rem 0.5rem"
            >
              <span v-if="comment && showComments">
                {{ comment }}
              </span>
              <v-popover v-if="comment && !showComments" placement="top">
                <i
                  v-tooltip="$t('widget.history.showComment')"
                  class="fa fa-comment-alt record__comment-icon"
                />
                <template slot="popover">
                  {{ comment }}
                </template>
              </v-popover>
            </td>
            <td v-if="hasEditRights">
              <div class="record__actions">
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
                      @click="$emit('delete-record', id)"
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

    <profile-modal
      v-if="showProfileModal"
      :id="chosenProfileId"
      @close="closeProfileModal"
    />
  </div>
</template>

<script>
import { VPopover } from 'v-tooltip';
import { dateTimeShort } from '@/util';

export default {
  name: 'KeyResultHome',

  components: {
    EmptyState: () => import('@/components/EmptyState.vue'),
    ProfileModal: () => import('@/components/ProfileModal.vue'),
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
    hasEditRights: {
      type: Boolean,
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
    chosenProfileId: null,
  }),

  computed: {
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

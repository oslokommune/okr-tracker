<template>
  <div class="key-result-values-list">
    <table class="key-result-values-list__table">
      <thead>
        <tr>
          <th>{{ $t('widget.history.value') }}</th>
          <th>{{ $t('widget.history.date') }}</th>
          <th>{{ $t('widget.history.comment') }}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in progress" :key="record.id">
          <td>
            {{ formatValue(record.value) }}
          </td>
          <td>
            {{ dateExtraShort(record.timestamp.toDate()) }}
          </td>
          <td>
            <div>
              <p v-if="record.comment">{{ record.comment }}</p>
              <div>
                <user-link
                  v-if="record.editedBy || record.createdBy"
                  :user="record.editedBy || record.createdBy"
                  @open-user-modal="openProfileModal"
                />
                <pkt-button
                  v-if="hasEditRights"
                  v-tooltip="$t('tooltip.editProgress')"
                  size="small"
                  skin="tertiary"
                  variant="icon-only"
                  icon-name="edit"
                  @onClick="$emit('edit-value', record)"
                />
              </div>
            </div>
          </td>
          <td>
            <div>
              <user-link
                v-if="record.editedBy || record.createdBy"
                :user="record.editedBy || record.createdBy"
                @open-user-modal="openProfileModal"
              />
              <pkt-button
                v-if="hasEditRights"
                v-tooltip="$t('tooltip.editProgress')"
                size="small"
                skin="tertiary"
                variant="icon-only"
                icon-name="edit"
                @onClick="$emit('edit-value', record)"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <profile-modal
      v-if="showProfileModal"
      :id="chosenProfileId"
      @close="closeProfileModal"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { dateExtraShort } from '@/util';
import { formatValue } from '@/util/keyResultProgress';
import { PktButton } from '@oslokommune/punkt-vue2';
import ProfileModal from '@/components/modals/ProfileModal.vue';
import UserLink from '@/components/widgets/WidgetProgressHistory/UserLink.vue';

export default {
  name: 'KeyResultValuesList',

  components: {
    PktButton,
    ProfileModal,
    UserLink,
  },

  props: {
    progress: {
      type: Array,
      required: true,
    },
  },

  data: () => ({
    showProfileModal: false,
    chosenProfileId: null,
  }),

  computed: {
    ...mapGetters(['hasEditRights']),
  },

  methods: {
    formatValue,
    dateExtraShort,

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
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

@mixin table-cell-desktop-up {
  display: none;

  @include bp('desktop-up') {
    display: table-cell;
  }
}

.key-result-values-list__table {
  border-spacing: 0 0.5rem;

  th {
    padding: 0 2rem;
    text-align: left;
    @include get-text('pkt-txt-14-medium');

    &:nth-child(1),
    &:nth-child(2) {
      text-align: center;
    }

    &:nth-child(4) {
      @include table-cell-desktop-up;
    }
  }

  td {
    padding: 1rem 2rem;
    text-align: left;
    background-color: var(--color-white);
    @include get-text('pkt-txt-14');

    &:nth-child(1) {
      @include get-text('pkt-txt-16-bold');
      color: var(--color-yellow-100);
      text-align: center;
      text-wrap: nowrap;
      background: var(--color-yellow-50);
    }

    &:nth-child(2) {
      padding-right: 1rem;
      text-align: center;
    }

    &:nth-child(3) {
      padding-left: 1rem;

      > div {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        > p {
          @include get-text('pkt-txt-14-light');
        }

        > div {
          display: flex;
          gap: 1rem;
          align-items: center;

          .pkt-btn {
            margin-left: auto;
          }

          @include bp('desktop-up') {
            display: none;
          }
        }
      }
    }

    &:nth-child(4) {
      @include table-cell-desktop-up;

      > div {
        display: flex;
        gap: 0.5rem;
        align-items: center;

        .pkt-btn {
          margin-left: auto;
        }
      }
    }
  }
}
</style>

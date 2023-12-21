<template>
  <div class="key-result-values-list">
    <table class="key-result-values-list__table">
      <thead>
        <tr>
          <th>{{ $t('widget.history.value') }}</th>
          <th>{{ $t('general.details') }}</th>
          <th>{{ $t('widget.history.comment') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in progress" :key="record.id">
          <td>
            {{ formatValue(record.value) }}
          </td>
          <td>
            <span>
              {{ dateTimeShort(record.timestamp.toDate()) }}
            </span>
            <div v-if="addedBy(record)" class="mt-size-8">
              {{ addedBy(record) }}
            </div>
          </td>
          <td>
            <p v-if="record.comment" :class="{ 'mr-size-40': canEdit }">
              {{ record.comment }}
            </p>
            <pkt-button
              v-if="canEdit"
              v-tooltip="$t('tooltip.editProgress')"
              size="small"
              skin="tertiary"
              variant="icon-only"
              icon-name="edit"
              @onClick="$emit('edit-value', record)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { dateTimeShort } from '@/util';
import { formatValue } from '@/util/keyResultProgress';
import { PktButton } from '@oslokommune/punkt-vue2';

export default {
  name: 'KeyResultValuesList',

  components: {
    PktButton,
  },

  props: {
    progress: {
      type: Array,
      required: true,
    },

    canEdit: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  methods: {
    formatValue,
    dateTimeShort,

    addedBy(record) {
      const user = record.editedBy || record.createdBy;
      return user ? user.displayName || user.id : null;
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
    padding: 0 1rem;
    text-align: left;
    @include get-text('pkt-txt-12-medium');
  }

  td {
    padding: 1rem;
    text-align: left;
    text-wrap: balance;
    vertical-align: top;
    background-color: var(--color-white);
    @include get-text('pkt-txt-14-light');

    &:nth-child(1) {
      text-wrap: nowrap;
      border-left: 0.25rem solid var(--color-blue-dark);
    }

    &:nth-child(2) {
      @include bp('phablet-up') {
        min-width: 10rem;
      }
    }

    &:nth-child(3) {
      position: relative;
      width: 100%;
      white-space: pre-line;

      .pkt-btn {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
      }
    }
  }
}
</style>

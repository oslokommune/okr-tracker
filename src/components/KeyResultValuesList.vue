<template>
  <div class="key-result-values-list">
    <table class="key-result-values-list__table">
      <thead>
        <tr>
          <th>{{ $t('widget.history.value') }}</th>
          <th>{{ $t('widget.history.date') }}</th>
          <th>{{ $t('widget.history.comment') }}</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in progress" :key="record.id">
          <td>
            {{ formatValue(record.value) }}
          </td>
          <td>
            <span v-tooltip="addedBy(record)">
              {{ dateExtraShort(record.timestamp.toDate()) }}
            </span>
          </td>
          <td>
            <p v-if="record.comment">{{ record.comment }}</p>
          </td>
          <td>
            <span v-if="addedBy(record)">{{ addedBy(record) }}</span>
          </td>
          <td>
            <pkt-button
              v-if="hasEditRights"
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
import { mapGetters } from 'vuex';
import { dateExtraShort } from '@/util';
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
  },

  computed: {
    ...mapGetters(['hasEditRights']),
  },

  methods: {
    formatValue,
    dateExtraShort,

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
    padding: 1rem;
    text-align: left;
    text-wrap: balance;
    background-color: var(--color-white);
    @include get-text('pkt-txt-14');

    &:nth-child(1) {
      @include get-text('pkt-txt-16-bold');
      padding: 1rem 2rem;
      color: var(--color-yellow-100);
      text-align: center;
      text-wrap: nowrap;
      background: var(--color-yellow-50);
    }

    &:nth-child(2) {
      padding-left: 2rem;
      text-align: center;
    }

    &:nth-child(3) {
      width: 100%;
    }

    &:nth-child(4) {
      @include table-cell-desktop-up;
      min-width: 10rem;
    }

    &:nth-child(5) {
      padding-left: 0;
    }
  }
}
</style>

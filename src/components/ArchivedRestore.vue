<template>
  <pkt-alert :title="$t('archived.heading')" skin="warning" class="archived-alert">
    <div class="archived-alert__body">
      <p v-if="text">{{ text }}</p>
      <p v-else>
        {{ $t(`archived.body.${objectType}`) }} {{ $t('archived.restoreText') }}
      </p>

      <pkt-button
        v-if="hasEditRights"
        skin="secondary"
        variant="icon-left"
        icon-name="arrow-circle"
        @onClick="restore"
      >
        {{ $t('btn.restore') }}
      </pkt-button>
    </div>
  </pkt-alert>
</template>

<script>
import { mapGetters } from 'vuex';
import { PktAlert, PktButton } from '@oslokommune/punkt-vue2';

export default {
  name: 'ArchivedRestore',

  components: {
    PktAlert,
    PktButton,
  },

  props: {
    restore: {
      type: Function,
      required: true,
    },
    objectType: {
      type: String,
      required: false,
      default: null,
    },
    text: {
      type: String,
      required: false,
      default: null,
    },
  },

  computed: {
    ...mapGetters(['hasEditRights']),
  },
};
</script>

<style lang="scss" scoped>
.archived-alert__body {
  display: flex;
  flex-direction: column;

  .pkt-btn {
    align-self: end;
    margin-top: 1rem;
  }
}
</style>

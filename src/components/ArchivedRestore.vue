<template>
  <div class="archived">
    <i class="archived__icon fa fa-file-archive" />
    <div class="archived__body">
      <h3 class="title-2">{{ $t('archived.heading') }}</h3>
      <p>{{ $t('archived.body', {objectType:objectType}) }}</p>

      <pkt-button
        skin="secondary"
        variant="icon-left"
        icon-name="arrow-circle"
        @onClick="restore"
      >
        {{ $t('btn.restore') }}
      </pkt-button>
    </div>
  </div>
</template>

<script>
import { PktButton } from '@oslokommune/punkt-vue2';

export default {
  name: 'ArchivedRestore',

  components: {
    PktButton,
  },

  props: {
    restore: {
      type: Function,
      required: true,
    },
    objectType: {
      type: String,
      default: "objekt",
      required: false
    }
  },
};
</script>

<style lang="scss" scoped>
.archived {
  display: flex;
  margin-bottom: 1rem;
  padding: 1.5rem 1rem;
  background: rgba(var(--color-yellow-rgb), 0.25);
  border-radius: 3px;
}

.archived__icon {
  flex-shrink: 0;
  width: 2rem;
  margin-right: 0.5rem;
  font-size: 1.5rem;
  text-align: center;
}

.archived__body {
  display: flex;
  flex-direction: column;

  .pkt-btn {
    align-self: end;
    margin-top: 1rem;
  }
}
</style>

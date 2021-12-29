<template>
  <div class="archived">
    <i class="archived__icon fa fa-file-archive" />
    <div>
      <h3 class="title-2">{{ $t('archived.heading') }}</h3>
      <p>{{ $t('archived.body') }}</p>

      <div class="button-row">
        <button class="btn btn--icon btn--sec" @click="restore">
          <i class="icon fa fa-trash-restore-alt" />
          {{ $t('btn.restore') }}
        </button>
        <button class="btn btn--icon btn--danger" @click="deleteDeep">
          <i class="icon fa fa-exclamation-triangle" />
          {{ $t('btn.deletePermanently') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ArchivedRestore',

  props: {
    restore: {
      type: Function,
      required: true,
    },
    deleteDeep: {
      type: Function,
      required: true,
    },
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
</style>

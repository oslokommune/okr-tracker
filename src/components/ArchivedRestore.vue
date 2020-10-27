<template>
  <div class="archived">
    <span class="archived__icon fa fa-file-archive"></span>
    <div class="archived__content">
      <h3 class="title-2 archived__title">{{ $t('archived.heading') }}</h3>
      <p>{{ $t('archived.body') }}</p>

      <div class="button-row">
        <button class="btn btn--icon btn--sec" @click="restore">
          <span class="icon fa fa-trash-restore-alt"></span>{{ $t('btn.restore') }}
        </button>
        <button class="btn btn--icon btn--danger" @click="deleteDeep">
          <span class="icon fa fa-exclamation-triangle"></span>{{ $t('btn.deletePermanently') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
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
@import '@/styles/_colors.scss';

.archived {
  display: flex;
  margin-bottom: 1rem;
  padding: 1.5rem 1rem;
  background: rgba($color-yellow, 0.25);
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

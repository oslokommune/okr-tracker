<template>
  <div class="details">
    <content-loader>

    </content-loader>
  </div>
</template>

<script>
export default {
  name: 'ContentLoaderItemAdminOKRDetails',
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

.details {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba($color-grey-400, 0.3);

  @media screen and (min-width: bp(l)) {
    align-self: flex-start;
    width: span(3, 0, span(10));
    margin-top: 0;
    margin-left: span(0, 1, span(10));
  }

  @media screen and (min-width: bp(xl)) {
    width: span(3, 0, span(10));
    margin-left: span(1, 2, span(10));
  }
}
</style>

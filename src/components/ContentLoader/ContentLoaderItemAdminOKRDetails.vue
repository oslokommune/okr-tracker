<template>
  <div class="details">
    <content-loader
      width="100%"
      :height="350"
    >
      <rect x="10" y="15" rx="5" ry="5" width="20%" height="10" />
      <rect x="10" y="32" rx="5" ry="5" width="100%" height="10" />
      <rect x="10" y="75" rx="5" ry="5" width="100%" height="10" />
      <rect x="10" y="128" rx="5" ry="5" width="100%" height="20" />
      <rect x="10" y="195" rx="5" ry="5" width="100%" height="10" />
      <rect x="10" y="252" rx="5" ry="5" width="25%" height="10" />
      <rect x="10" y="60" rx="5" ry="5" width="20%" height="10" />
      <rect x="10" y="108" rx="5" ry="5" width="20%" height="10" />
      <rect x="10" y="179" rx="5" ry="5" width="20%" height="10" />
      <rect x="10" y="236" rx="5" ry="5" width="20%" height="10" />
      <rect x="154" y="253" rx="5" ry="5" width="25%" height="10" />
      <rect x="156" y="235" rx="5" ry="5" width="20%" height="10" />
      <rect x="10" y="287" rx="5" ry="5" width="20%" height="10" />
      <rect x="10" y="306" rx="5" ry="5" width="25%" height="10" />
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

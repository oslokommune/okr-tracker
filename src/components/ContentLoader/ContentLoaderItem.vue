<template>
  <ul class="content-loader-item-container content-loader-item-container--hover">
    <li class="content-loader-item__objective">
      <div class="objective">
        <content-loader class="objective__header title-2" height="33" width="790">
          <rect x="0" y="2" ry="3" rx="3" width="780" height="20" />
        </content-loader>
      </div>
      <ul>
        <li class="content-loader-item__key-res">
          <content-loader height="33" width="790">
            <rect x="0" y="2" ry="3" rx="3" width="780" height="18" />
          </content-loader>
        </li>
      </ul>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'ContentLoaderItem',
};
</script>

<style lang="scss" scoped>
.content-loader-item__key-res {
  margin-top: 0.2rem;

  &:first-child {
    margin-top: 0;
  }
}

.content-loader-item-container {
  display: block;
}

.content-loader-item-container--hover {
  position: relative;
  bottom: 2rem;
}

.content-loader-item__objective {
  margin: 0 1rem 1rem 1rem;
  padding-bottom: 1rem;
  background: white;
  box-shadow: -2px 1px 5px 2px rgb(147 147 153 / 30%);
}

.objective {
  display: grid;
  grid-gap: 0.25rem;
  grid-template-rows: auto auto;
  grid-template-columns: 1fr;
  align-items: center;
  padding: 1.5rem 1.75rem;
  color: var(--color-text);
  text-decoration: none;
}
</style>

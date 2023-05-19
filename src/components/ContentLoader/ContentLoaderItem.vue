<template>
  <ul class="content-loader-item-container">
    <li class="content-loader-item__objective-container">
      <div class="content-loader-item__objective">
        <content-loader class="objective__header title-2" height="20" width="790">
          <rect x="0" y="2" ry="3" rx="3" width="780" height="20" />
        </content-loader>
      </div>
      <ul>
        <li class="content-loader-item__keyResult-container">
          <div class="content-loader-item__keyResult">
            <div class="content-loader-item__keyResult--info">
              <content-loader height="15" width="700">
                <rect x="0" y="2" ry="3" rx="3" width="700" height="15" />
              </content-loader>
            </div>
            <div class="content-loader-item__keyResult--progress">
              <content-loader height="15" width="320">
                <rect x="0" y="8" ry="0" rx="0" width="320" height="15" />
              </content-loader>
            </div>
          </div>
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
.content-loader-item__objective-container {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border: 2px solid var(--color-border);
}

.content-loader-item__objective {
  padding: 1.6rem 1.75rem;
}

.content-loader-item__keyResult-container {
  margin-top: 0.2rem;

  &:first-child {
    margin-top: 0;
  }
}

.content-loader-item__keyResult {
  display: grid;
  grid-row-gap: 0.5rem;
  grid-template-columns: 1fr auto;
}

.content-loader-item__keyResult--info {
  grid-column: 1;
  padding: 0.5rem 1.75rem 0 1.75rem;
  color: var(--color-grayscale-80);
  text-decoration: none;
  background-color: var(--color-secondary);
}

.content-loader-item__keyResult--progress {
  grid-column: 2;
  width: 320px;
  padding: 0.5rem 1.75rem 0.5rem 1.75rem;
  background-color: var(--color-primary);
}
</style>

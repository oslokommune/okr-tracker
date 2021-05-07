<template>
  <ul class="content-loader-item-container content-loader-item-container--hover">
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
              <content-loader height="15" width="350">
                <rect x="0" y="8" ry="0" rx="0" width="350" height="15" />
              </content-loader>
            </div>
          </div>
        </li>
      </ul>
    </li>
  </ul>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'ContentLoaderItem',

  computed: {
    ...mapState(['user']),
  },
};
</script>

<style lang="scss" scoped>
.content-loader-item-container {
  display: block;
}

.content-loader-item-container--hover {
  position: relative;
  bottom: 2rem;
}

.content-loader-item__objective-container {
  margin: 0 1rem 1rem 1rem;
  padding-bottom: 1rem;
  background: white;
  box-shadow: -2px 1px 5px 2px rgb(147 147 153 / 30%);
}

.content-loader-item__objective {
  padding: 1.5rem 1.75rem;
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
  grid-template-columns: 1fr span(2, 0, span(6));
}

.content-loader-item__keyResult--info {
  grid-column: 1;
  padding: 1.5rem 1.75rem 1.5rem 1.75rem;
  color: var(--color-grey-800);
  text-decoration: none;
  background-color: var(--color-secondary);
}

.content-loader-item__keyResult--progress {
  grid-column: 2;
  padding: 1.1rem 1.75rem 0.5rem 1.75rem;
  background-color: var(--color-primary);
}
</style>

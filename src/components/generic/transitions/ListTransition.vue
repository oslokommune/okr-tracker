<template>
  <TransitionGroup name="list" tag="div">
    <slot></slot>
  </TransitionGroup>
</template>

<style lang="scss">
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
}
</style>

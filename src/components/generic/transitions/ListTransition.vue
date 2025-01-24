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
  transform: translateX(30px);
  opacity: 0;
}

.list-leave-active {
  position: absolute;
}
</style>

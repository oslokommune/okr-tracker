<template>
  <div class="ok-spinner" aria-hidden="true">
    <div class="circle"></div>
    <div class="circle"></div>
    <div class="circle"></div>
  </div>
</template>

<script>
export default {
  name: 'LoadingSmall',
};
</script>

<style lang="scss" scoped>
@use 'sass:math';

$size: 1.25rem;
$dura: 1.5s;
$circ: math.div($size, 3);

.ok-spinner {
  position: relative;
  display: inline-block;
  width: $size;
  height: $size;
  margin: 0 0.5rem;
  transform: translateY(math.div($size, 5));
}

.circle {
  position: absolute;
  top: $circ;
  left: 0;
  width: $circ;
  height: $circ;
  background: var(--color-primary);
  border-radius: math.div($circ, 2);
  animation: loader $dura;
  animation-timing-function: linear;
  animation-iteration-count: infinite;

  @for $i from 1 through 3 {
    &:nth-child(3n + #{$i}) {
      left: $circ * ($i - 1);
      animation-delay: math.div($dura, $i);
    }
  }
}

@keyframes loader {
  25%,
  75% {
    transform: scale(0.8) translateY(0);
  }
  35% {
    transform: translateY(-$circ);
  }
  65% {
    transform: translateY($circ);
  }
}
</style>

<template>
  <div>
    <transition name="fade-in">
      <div class="spinner__wrapper">
        <div class="lds-default">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'TheSpinner',
};
</script>

<style lang="scss" scoped>
@import '../styles/_colors.scss';

.spinner__wrapper {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background: rgba($color-grey-300, 0.7);
}

.fade-in-enter-active {
  transition: all 0.2s ease;
  transition-delay: 1s;
}

.fade-in-enter {
  opacity: 0;
}

.fade-in-enter-to {
  opacity: 1;
}

.fade-in-leave-active {
  transition: all 0.5s ease;
}
.fade-in-leave-to {
  opacity: 0;
}

.lds-default {
  position: relative;
  display: inline-block;
  width: 80px;
  height: 80px;
}
.lds-default div {
  position: absolute;
  width: 6px;
  height: 6px;
  background: $color-purple;
  border-radius: 50%;
  animation: lds-default 1.2s linear infinite;
}
.lds-default div:nth-child(1) {
  top: 37px;
  left: 66px;
  animation-delay: 0s;
}
.lds-default div:nth-child(2) {
  top: 22px;
  left: 62px;
  animation-delay: -0.1s;
}
.lds-default div:nth-child(3) {
  top: 11px;
  left: 52px;
  animation-delay: -0.2s;
}
.lds-default div:nth-child(4) {
  top: 7px;
  left: 37px;
  animation-delay: -0.3s;
}
.lds-default div:nth-child(5) {
  top: 11px;
  left: 22px;
  animation-delay: -0.4s;
}
.lds-default div:nth-child(6) {
  top: 22px;
  left: 11px;
  animation-delay: -0.5s;
}
.lds-default div:nth-child(7) {
  top: 37px;
  left: 7px;
  animation-delay: -0.6s;
}
.lds-default div:nth-child(8) {
  top: 52px;
  left: 11px;
  animation-delay: -0.7s;
}
.lds-default div:nth-child(9) {
  top: 62px;
  left: 22px;
  animation-delay: -0.8s;
}
.lds-default div:nth-child(10) {
  top: 66px;
  left: 37px;
  animation-delay: -0.9s;
}
.lds-default div:nth-child(11) {
  top: 62px;
  left: 52px;
  animation-delay: -1s;
}
.lds-default div:nth-child(12) {
  top: 52px;
  left: 62px;
  animation-delay: -1.1s;
}
@keyframes lds-default {
  0%,
  20%,
  80%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.5);
  }
}
</style>

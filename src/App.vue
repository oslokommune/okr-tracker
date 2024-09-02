<script setup>
import AppLayout from './components/AppLayout.vue';
</script>

<template>
  <div class="app">
    <AppLayout />
  </div>
</template>

<script>
// Using a class on body to determine how to style focus states
document.body.addEventListener('mousedown', () => {
  document.body.classList.add('using-mouse');
});
document.body.addEventListener('keydown', () => {
  document.body.classList.remove('using-mouse');
});

/*
 * The swagger-ui package loads zenscroll, which overrides scolling behavior of
 * *every* anchor tag on every page by placing a nasty click event listener on
 * the main `html` element. In order to disable this, we have to do the
 * following before the swagger-ui package even loads.
 */
window.noZensmooth = true;
</script>

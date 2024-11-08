<script setup>
defineProps({
  text: {
    type: String,
    required: false,
    default: null,
  },
  strong: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>

<template>
  <li :class="['nav-menu-text', { 'nav-menu-text--strong': strong }]">
    <div class="nav-menu-text__inner">
      <slot>
        {{ text }}
      </slot>
    </div>
  </li>
</template>

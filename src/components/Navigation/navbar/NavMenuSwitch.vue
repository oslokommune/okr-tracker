<script setup>
import { computed, ref } from 'vue';
import { useMenuItem } from './menuItem.js';

const props = defineProps({
  text: {
    type: String,
    required: false,
    default: null,
  },
});

const model = defineModel({ type: Boolean });

const icon = computed(() => (model.value ? 'alert-success' : 'placeholder-icon'));

const menuItem = ref(null);
const { attrs, listeners } = useMenuItem(props, menuItem);

function toggle() {
  model.value = !model.value;
}
</script>

<template>
  <li ref="menuItem" class="nav-menu-switch">
    <div
      class="nav-menu-switch__inner"
      v-bind="attrs"
      role="menuitemcheckbox"
      @keyup.enter.capture.stop="toggle"
      @click.capture.stop="toggle"
      v-on="listeners"
    >
      <Transition name="fade" mode="out-in">
        <PktIcon :key="new Date().getTime()" class="nav-menu-item__icon" :name="icon" />
      </Transition>
      <span v-if="text" class="">{{ text }}</span>
    </div>
  </li>
</template>

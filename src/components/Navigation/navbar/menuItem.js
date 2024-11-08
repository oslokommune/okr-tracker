import { computed, inject, nextTick, ref, toRef } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';

export function useMenuItem(props, element, emit) {
  const isDropdown = toRef(props.dropdown);
  const isOpen = ref(false);

  const attrs = computed(() => {
    const additionalAriaAttrs = props.aria
      ? Object.fromEntries(Object.entries(props.aria).map(([k, v]) => [`aria-${k}`, v]))
      : {};

    return {
      role: props.role,
      tabIndex: 0,
      ariaHasPopup: isDropdown.value || null,
      ariaExpanded: isDropdown.value ? isOpen.value : null,
      ...additionalAriaAttrs,
    };
  });

  const isVertical = inject('isVerticalMenu', false);
  const closeParent = inject('closeNavMenuDropdown', false);

  const listeners = computed(() => ({
    click: activate,
    keyup: async (e) => {
      if (e.key === 'Enter' || e.code === 'Space') {
        await activate(e);
      } else if (e.key === 'ArrowDown' && (isVertical || isDropdown.value)) {
        if (isDropdown.value) {
          if (!isOpen.value) {
            await open();
          }
          // Focus first `menuitem*` in the dropdown (if any)
          const dropdown = element.value.querySelector('.nav-menu-item__content');
          if (dropdown) {
            dropdown.querySelector('[role^=menuitem]')?.focus();
          }
          return;
        }

        focusNext();
      } else if (e.key === 'ArrowUp' && isVertical) {
        focusPrev();
      } else if (e.key === 'ArrowRight' && !isVertical) {
        focusNext();
      } else if (e.key === 'ArrowLeft' && !isVertical) {
        focusPrev();
      } else if (e.key === 'Escape') {
        close();
      }
    },
  }));

  const menuItem = computed(() => element.value.querySelector('[role^=menuitem]'));

  async function activate(e, routeHandler) {
    if (isDropdown.value) {
      // Toggle the dropdown menu
      await toggle();
    } else if (routeHandler) {
      // Call VueRouter navigation handler
      await routeHandler(e);

      // Close any open parent after navigation
      if (closeParent) {
        closeParent();
      }
    } else {
      emit('click', e);
    }
  }

  function focusNext() {
    // Focus next `menuitem*` in current `menu` (if any)
    element.value.parentNode
      .querySelectorAll('[role^=menuitem]')
      .forEach((item, index, items) => {
        if (menuItem.value === item) {
          const nextItem = items?.[index + 1];
          if (nextItem) {
            nextItem.focus();
          } else {
            items[0].focus();
          }
        }
      });
  }

  function focusPrev() {
    // Focus previouse `menuitem*` in current `menu` (if any)
    element.value.parentNode
      .querySelectorAll('[role^=menuitem]')
      .forEach((item, index, items) => {
        if (menuItem.value === item) {
          const prevItem = items?.[index - 1];
          if (prevItem) {
            prevItem.focus();
          } else {
            items[items.length - 1].focus();
          }
        }
      });
  }

  const { activate: activateFocusTrap, deactivate: deactivateFocusTrap } = useFocusTrap(
    element,
    {
      immediate: false,
      allowOutsideClick: true,
      delayInitialFocus: true,
    }
  );

  async function open() {
    await nextTick();
    isOpen.value = true;
    setTimeout(() => {
      activateFocusTrap();
    }, 1000);
  }

  function close() {
    deactivateFocusTrap();
    isOpen.value = false;
  }

  async function toggle() {
    if (!isOpen.value) {
      await open();
    } else {
      close();
    }
  }

  onClickOutside(element, close, {
    ignore: ['.ignore-click-outside'],
  });

  return {
    attrs,
    listeners,
    open,
    close,
    toggle,
    isDropdown,
    isOpen,
  };
}

export default useMenuItem;

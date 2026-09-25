import { computed, toValue } from 'vue';
import { useRouter } from 'vue-router';

/**
 * Resolve breadcrumb router locations to URLs for `<pkt-breadcrumbs>` and
 * handle its `navigate` event through the router.
 */
export function useRouterBreadcrumbs(breadcrumbs) {
  const router = useRouter();

  return {
    breadcrumbs: computed(() =>
      toValue(breadcrumbs).map(({ href, ...rest }) =>
        href ? { ...rest, href: router.resolve(href).href } : rest
      )
    ),
    navigate(event) {
      event.preventDefault();
      router.push(event.detail.item.href);
    },
  };
}

export default useRouterBreadcrumbs;

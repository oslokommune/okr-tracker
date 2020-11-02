import Vue from 'vue';
import i18n from '@/locale/i18n';

export function toastArchiveAndRevert(obj) {
  const { name, callback } = obj;

  const options = {
    duration: 4000,
    action: [
      {
        text: i18n.t('toaster.action.regret'),
        onClick: callback,
      },
      {
        text: i18n.t('btn.close'),
        onClick: (e, toastObject) => {
          toastObject.goAway(0);
        },
      },
    ],
  };

  if (name) {
    Vue.toasted.show(i18n.t('toaster.delete.object', { name }), options);
  } else {
    Vue.toasted.show(i18n.t('toaster.deleted'), options);
  }
}

export default { toastArchiveAndRevert };

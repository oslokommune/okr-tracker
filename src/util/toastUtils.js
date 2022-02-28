import Vue from 'vue';
import i18n from '@/locale/i18n';

export const showToastMessage = (opts) => {
  const { msg, msgVars, type, ...toastOpts } = opts;

  Vue.toasted.show(i18n.t(msg, msgVars), { type, ...toastOpts });
};

export default function toastArchiveAndRevert(obj) {
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

  showToastMessage({
    msg: name ? 'toaster.delete.object' : 'toaster.deleted',
    msgVars: { name },
    toastOpts: options,
  });
}

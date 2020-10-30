export function deletedRegret(obj) {
  const { name, ref, callback } = obj;

  if (!ref && !callback) return;

  const options = {
    duration: 4000,
    action: [
      {
        text: i18n.tc('toaster.action.regret'),
        onClick: callback || unDelete.bind(null, ref),
      },
      {
        text: i18n.tc('btn.close'),
        onClick: close,
      },
    ],
  };

  if (name) {
    return show(i18n.tc('toaster.delete.object', null, { name }), options);
  }
  return show(i18n.tc('toaster.deleted'), options);
}

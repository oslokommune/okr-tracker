export default function (props, data) {
  Object.entries(props).forEach(([prop, { type }]) => {
    // eslint-disable-next-line valid-typeof
    if (Object.hasOwnProperty.call(data, prop) && typeof data[prop] !== type) {
      throw new TypeError(`"${prop}" must be ${type}.`);
    }
  });
}

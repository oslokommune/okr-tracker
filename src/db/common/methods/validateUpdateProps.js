import { firestore } from 'firebase';

/* eslint-disable valid-typeof */
export default function (props, data) {
  Object.entries(props).forEach(([prop, { type }]) => {
    // eslint-disable-next-line valid-typeof
    if (Object.hasOwnProperty.call(data, prop)) {
      // ... check that the referenced document exists
      if (type === 'reference') {
        if (!(data[prop] instanceof firestore.DocumentReference)) {
          throw new TypeError(`${prop} is not a valid reference`);
        }
      } else if (type === 'array') {
        if (!Array.isArray(data[prop])) {
          throw new TypeError(`${prop} is not a valid array`);
        }
      } else if (type === 'date') {
        // Verify date objects
        if (Object.prototype.toString.call(data[prop]) !== '[object Date]') {
          throw new TypeError(`${prop} is not a valid Date object`);
        }

        // ... otherwise check its type
      } else if (typeof data[prop] !== type) {
        throw new TypeError(`"${prop}" must be ${type}.`);
      }
    }
  });
}

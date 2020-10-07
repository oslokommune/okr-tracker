import { firestore } from 'firebase';

/* eslint-disable valid-typeof */
export default function (props, data) {
  return new Promise((resolve, reject) => {
    Object.entries(props).forEach(async ([prop, { type, required }]) => {
      // Check existence
      if (required && !Object.hasOwnProperty.call(data, prop)) {
        reject(new Error(`Cannot create ${name}. Missing required property "${prop}".`));
      }

      // If property is included
      if (Object.hasOwnProperty.call(data, prop)) {
        // ... check that the referenced document exists
        if (type === 'reference') {
          if (!(data[prop] instanceof firestore.DocumentReference)) {
            reject(new TypeError(`${prop} is not a valid reference`));
          }
        } else if (type === 'date') {
          // Verify date objects
          if (Object.prototype.toString.call(data[prop]) !== '[object Date]') {
            reject(new TypeError(`${prop} is not a valid Date object`));
          }

          // ... otherwise check its type
        } else if (typeof data[prop] !== type) {
          reject(new TypeError(`"${prop}" must be ${type}.`));
        }
      }
    });
    resolve(true);
  });
}

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

/* eslint-disable valid-typeof */
export default function validateCreateProps(props, data) {
  Object.entries(props).forEach(async ([prop, { type, required }]) => {
    // Check existence
    if (required && !Object.hasOwnProperty.call(data, prop)) {
      throw new Error(`Cannot create ${data.name}. Missing required property "${prop}".`);
    }

    // If property is included
    if (Object.hasOwnProperty.call(data, prop)) {
      // ... check that the referenced document exists
      if (type === 'reference') {
        if (!(data[prop] instanceof firebase.firestore.DocumentReference)) {
          throw new TypeError(`${prop} is not a valid reference`);
        }
      } else if (type === 'array') {
        if (!Array.isArray(data[prop])) {
          throw new TypeError(`${prop} is not a valid array`);
        }
      } else if (type === 'number') {
        if (Number.isNaN(data[prop])) {
          throw new TypeError(`${prop} is not a valid number`);
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
  return true;
}

/* eslint-disable valid-typeof */

export default async function (props, data) {
  try {
    Object.entries(props).forEach(async ([prop, { type, required }]) => {
      // Check existence
      if (required && !Object.hasOwnProperty.call(data, prop)) {
        throw new Error(`Cannot create ${name}. Missing required property "${prop}".`);
      }

      // If property is included
      if (Object.hasOwnProperty.call(data, prop)) {
        // ... check that the referenced document exists
        if (type === 'reference') {
          try {
            await data[prop].get();
          } catch {
            throw new Error(`Cannot find "${prop}" at ${data[prop].path}`);
          }

          // ... otherwise check its type
        } else if (typeof data[prop] !== type) {
          throw new TypeError(`"${prop}" must be ${type}.`);
        }
      }
    });
  } catch (err) {
    throw new Error(err);
  }

  return true;
}

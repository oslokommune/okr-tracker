import * as sheetOptions from '@/config/sheetOptions';

/**
 * Takes an multidimensional array and generates
 * an array of objects using the values in the first
 * index as keys
 */
export function arraysToObjects(arr) {
  let jsonObj = [];
  let headers = arr[0];
  for (let i = 1; i < arr.length; i++) {
    const data = arr[i];
    let obj = {};
    for (let j = 0; j < data.length; j++) {
      obj[headers[j].trim()] = data[j].trim();
    }
    jsonObj.push(obj);
  }
  return jsonObj;
}

/**
 * Takes an array of grouped data and returns a nested object
 */
export function nest(data) {
  const keyres = data.KeyRes;

  const objectives = data.Objectives.map(objective => {
    objective.children = keyres.filter(keyresult => keyresult.objective_id === objective.id);
    return objective;
  });

  const products = data.Products.map(product => {
    product.children = objectives.filter(objective => objective.product_id === product.id);
    return product;
  });

  const depts = data.Depts.map(dept => {
    dept.children = products.filter(product => product.department_id === dept.id);
    return dept;
  });

  const orgs = data.Orgs.map(org => {
    org.children = depts.filter(dept => dept.organisation_id === org.id);
    return org;
  });

  return orgs;
}

/**
 * Options for the values.append() call
 */
export function generateAppendDataOptions(sheetName) {
  return {
    spreadsheetId: sheetOptions.sheetid,
    valueInputOption: 'RAW',
    insertDataOption: 'OVERWRITE',
    range: `'${sheetName}'!A1`,
  };
}

/**
 * Options for the values.update() call
 */
export function generateUpdateDataOptions(sheetName, rowNumber) {
  return {
    spreadsheetId: sheetOptions.sheetid,
    valueInputOption: 'RAW',
    range: `'${sheetName}'!A${rowNumber}`,
  };
}

import { scaleTime, scaleLinear, mean } from 'd3';
import { endOfQuarter } from 'date-fns';
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
  const values = data.KeyResTracker;

  const keyres = data.KeyRes.map(keyres => {
    keyres.children = values.filter(val => val.key_result_id === keyres.id);
    keyres.current_value = findCurrentValue(keyres.children) || keyres.start_value;
    return keyres;
  });

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

/**
 * Method to store state-object in localstorage
 * @param obj object to store in localstorage
 */
export function storeObjectInLocalStorage(obj) {
  localStorage.setItem('okr-data', JSON.stringify(obj));
}

function findCurrentValue(list) {
  if (!list || !list.length) return false;
  list.sort((a, b) => (a.timestamp > b.timestamp ? -1 : a.timestamp < b.timestamp ? 1 : 0));
  return list[0].value;
}

export function getDateSpanFromQuarter(quarter) {
  const year = quarter.split(' ')[0];
  const q = +quarter.split('Q')[1];

  const startDate = new Date(year, (q - 1) * 3, 1);
  const endDate = endOfQuarter(startDate);

  return { startDate, endDate };
}

export function getTimeProgression(quarter) {
  const { startDate, endDate } = getDateSpanFromQuarter(quarter);

  const timeScale = scaleTime()
    .domain([startDate, endDate])
    .clamp(true);

  return timeScale(new Date());
}

export function getProgression(objectives) {
  if (!objectives) return 0;

  return (
    mean(
      objectives
        .map(objective => objective.children)
        .flat()
        .map(keyres => {
          const scale = scaleLinear().domain([+keyres.start_value, +keyres.target_value]);
          return scale(+keyres.current_value);
        })
    ) || 0
  );
}

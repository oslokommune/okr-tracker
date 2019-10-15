import * as sheetOptions from "@/config/sheetOptions";

/**
 * Takes an multidimensional array and generates
 * an array of objects using the values in the first
 * index as keys
 */
export function arraysToObjects(arr) {
  var jsonObj = [];
  var headers = arr[0];
  for (var i = 1; i < arr.length; i++) {
    var data = arr[i];
    var obj = {};
    for (var j = 0; j < data.length; j++) {
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
  const products = data.Products;

  const teams = data.Teams.map(team => {
    team.products = products.find(prod => prod.team_id === team.id);
    return team;
  });

  const depts = data.Depts.map(dept => {
    dept.teams = teams.find(team => team.department_id === dept.id);
    return dept;
  });

  const orgs = data.Orgs.map(org => {
    org.departments = depts.find(dept => dept.organisation_id === org.id);
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
    valueInputOption: "RAW",
    insertDataOption: "OVERWRITE",
    range: `'${sheetName}'!A1`
  };
}

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

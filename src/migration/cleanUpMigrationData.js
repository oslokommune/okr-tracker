import slugify from '../util/slugify';

export default function cleanUpDataTree(tree) {
  tree.forEach(cleanUpOrg);
  return tree;
}

function cleanUpOrg(org) {
  org.missionStatement = org.mission_statement;
  org.name = org.organisation;
  delete org.organisation;
  delete org.mission_statement;
  delete org.id;
  org.children.forEach(cleanUpDept);
  return org;
}

function cleanUpDept(dept) {
  dept.missionStatement = dept.mission_statement;
  dept.name = dept.department;
  dept.slug = slugify(dept.name);
  delete dept.mission_statement;
  delete dept.id;
  delete dept.organisation_id;
  delete dept.department;
  dept.children.forEach(cleanUpProd);
}

function cleanUpProd(prod) {
  prod.missionStatement = prod.mission_statement;
  prod.name = prod.product;
  prod.slug = slugify(prod.name);
  delete prod.mission_statement;
  delete prod.id;
  delete prod.department_id;
  delete prod.team_members;
  delete prod.product;
  delete prod.product_image;
  prod.children.forEach(cleanUpObjective);
}

function cleanUpObjective(obj) {
  obj.name = obj.objective_title;
  obj.description = obj.objective_body;
  obj.icon = 'trophy';
  delete obj.objective_title;
  delete obj.objective_body;
  delete obj.id;
  delete obj.archived;
  delete obj.product_id;

  obj.quarter = obj.quarter
    .split(' ')
    .reverse()
    .join(' ');

  obj.children.forEach(cleanUpKeyResults);
}

function cleanUpKeyResults(keyres) {
  const children = keyres.children.sort(sortByTimestamp);
  if (children.length && children[0].value) {
    keyres.currentValue = +children[0].value;
  }

  keyres.startValue = +keyres.start_value;
  keyres.targetValue = +keyres.target_value;
  keyres.description = keyres.key_result;
  delete keyres.id;
  delete keyres.objective_id;
  delete keyres.archived;
  delete keyres.start_value;
  delete keyres.target_value;
  delete keyres.target_type;
  delete keyres.key_result;

  keyres.children.forEach(cleanUpProgress);
}

function cleanUpProgress(progress) {
  delete progress.id;
  delete progress.archived;
  delete progress.key_result_id;
  progress.value = +progress.value;
  progress.timestamp = new Date(progress.timestamp);
}

function sortByTimestamp(a, b) {
  const timeA = new Date(a.timestamp);
  const timeB = new Date(b.timestamp);

  if (timeA > timeB) {
    return -1;
  }
  if (timeB > timeA) {
    return 1;
  }
  return 0;
}

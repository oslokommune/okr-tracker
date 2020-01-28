import { csvParse } from 'd3';
import cleanUpDataTree from './cleanUpMigrationData';
import writeMigrationData from './writeMigrationData';

export default async function(fileList) {
  if (!validateFileList(fileList)) {
    throw new Error('Cannot process these files');
  }

  const data = await parseFileList(fileList)
    .then(list => list.map(parseFileContent))
    .then(list => list.map(cleanUpData))
    .then(createDataTree)
    .then(cleanUpDataTree);

  await data.map(writeMigrationData);
  console.log('SUCCESS!!!');
}

// Use this to validate (Boolean) if the fileList
// contains the correct files (names, formats, number of files etc)
function validateFileList(fileList) {
  const allowedFileNames = [
    'OKR-tracker-data - Depts.csv',
    'OKR-tracker-data - Orgs.csv',
    'OKR-tracker-data - Objectives.csv',
    'OKR-tracker-data - Products.csv',
    'OKR-tracker-data - KeyRes.csv',
    'OKR-tracker-data - KeyResTracker.csv',
  ];

  if (fileList.length < allowedFileNames.length) {
    throw new Error('Missing some files');
  }
  if (fileList.length > allowedFileNames.length) {
    throw new Error('Too many files');
  }

  fileList.forEach(file => {
    if (file.type !== 'text/csv') {
      throw new Error('Only CSV files are allowed');
    }
    if (!allowedFileNames.includes(file.name)) {
      throw new Error('Unknown file. Make sure that all the files are allowed.');
    }
  });

  return true;
}

// Use the FileReader to read the contents of the file
async function processFile(file) {
  const Reader = new FileReader();
  Reader.filename = file.name;

  return new Promise((resolve, reject) => {
    Reader.onload = fileContent => {
      resolve(fileContent.target);
    };
    Reader.onerror = error => {
      reject(error);
    };
    Reader.readAsText(file);
  });
}

// Parse the CSV string into an array
function parseFileContent(input) {
  return {
    data: csvParse(input.result),
    type: input.filename.split(' - ')[1].split('.')[0],
  };
}

// Process all the files in turn and return once all
// the files have been processed by the FileReader
async function parseFileList(fileList) {
  const promises = [];
  fileList.forEach(async file => {
    promises.push(processFile(file));
  });
  return Promise.all(promises);
}

// Remove deleted rows
function cleanUpData(input) {
  input.data = input.data.filter(row => !row.archived);
  return input;
}

// Converts the list of data arrays into a tree
function createDataTree(list) {
  const orgs = list.find(d => d.type === 'Orgs').data;
  const depts = list.find(d => d.type === 'Depts').data;
  const prods = list.find(d => d.type === 'Products').data;
  const objs = list.find(d => d.type === 'Objectives').data;
  const keyres = list.find(d => d.type === 'KeyRes').data;
  const tracker = list.find(d => d.type === 'KeyResTracker').data;

  keyres.forEach(kr => {
    kr.children = tracker.filter(d => d.key_result_id === kr.id);
  });

  objs.forEach(obj => {
    obj.children = keyres.filter(d => d.objective_id === obj.id);
  });

  prods.forEach(prod => {
    prod.children = objs.filter(d => d.product_id === prod.id);
  });

  depts.forEach(dept => {
    dept.children = prods.filter(d => d.department_id === dept.id);
  });

  orgs.forEach(org => {
    org.children = depts.filter(d => d.organisation_id === org.id);
  });

  return orgs;
}

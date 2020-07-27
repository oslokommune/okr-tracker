const functions = require('firebase-functions');
const firebaseAdmin = require('firebase-admin');

const secret = 'UZPmJ9gOXHmb6RRttAyURi4JdkvDq8';
const db = firebaseAdmin.firestore();
const archived = false;
const created = new Date();
let allUsers;

module.exports = functions.https.onRequest(async (req, res) => {
  if (!req.query.secret) {
    res.status(401).send('401: Unauthorized');
  }
  if (req.query.secret !== secret) {
    res.status(401).send('401: Unauthorized');
  }

  if (!req.body || !req.body.users || !req.body.users.length) {
    res.status(422).send('422: Unprocessable entity');
  }

  // prettier-ignore
  const collectionsAreEmpty = [
    await db.collection('users').get().then(snapshot => snapshot.empty),
    await db.collection('orgs').get().then(snapshot => snapshot.empty),
  ];

  if (collectionsAreEmpty.includes(false)) {
    console.error('All collections must be empty');
    res.status(500).send('All collection must be empty');
    return;
  }

  allUsers = req.body.users;

  try {
    await populateUsers(req.body.users);
    await populateOrgs(req.body.orgs);
  } catch (err) {
    res.status(500).send('Something went wrong');
    throw new Error(err);
  }

  res.status(200).send('Success');
});

async function populateUsers(users) {
  if (!users || !users.length) return;

  users.forEach(async user => {
    const { id, displayName, admin, slug } = user;

    const userData = {
      id,
      admin,
      email: id,
    };

    if (displayName) {
      userData.displayName = displayName;
    }

    if (slug) {
      userData.slug = slug;
    }

    await db.collection('users').doc(id).set(userData);
  });
}

async function populateOrgs(orgs) {
  if (!orgs || !orgs.length) return;

  orgs.forEach(async org => {
    const { name, missionStatement, departments, periods } = org;
    const slug = slugify(name);
    const { path } = await db.collection('orgs').add({ name, archived, slug, missionStatement });
    await populateDepartments(departments, path);
    await populatePeriods(periods, path);
  });
}

async function populateDepartments(departments, parentPath) {
  if (!departments || !departments.length) return;

  departments.forEach(async dept => {
    const { name, missionStatement, products, periods } = dept;
    const slug = slugify(name);
    const { path } = await db
      .collection(`${parentPath}/departments`)
      .add({ name, archived, slug, created, missionStatement });
    await populateProducts(products, path);
    await populatePeriods(periods, path);
  });
}

async function populateProducts(products, parentPath) {
  if (!products || !products.length) return;

  products.forEach(async prod => {
    const { name, missionStatement, periods, kpis } = prod;
    const slug = slugify(name);
    const { path } = await db
      .collection(`${parentPath}/products`)
      .add({ name, archived, slug, created, missionStatement });
    await populatePeriods(periods, path);
    await populateKPIs(kpis, path);
  });
}

async function populateKPIs(kpis, parentPath) {
  /* eslint-disable */
  for (const kpi in kpis) {
    if (!kpi) return;

    const { description, sheet, progress } = kpis[kpi];
    const name = kpi.split('/')[1];

    const documentReference = await db.collection(`${parentPath}/kpis`).add({
      description,
      sheet,
      name,
    });

    progress.forEach(prog => {
      documentReference.collection('progress').add({
        created: new Date(prog.created),
        value: prog.value,
      });
    });
  }
  /* eslint-enable */
}

async function populatePeriods(periods, parentPath) {
  if (!periods || !periods.length) return;

  periods.forEach(async period => {
    const { name, startDate, endDate, objectives } = period;

    const { id } = await db.collection(`${parentPath}/periods`).add({
      name,
      archived,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      created,
    });

    await populateObjectives(objectives, parentPath, id);
  });
}

async function populateObjectives(objectives, parentPath, periodId) {
  if (!objectives || !objectives.length) return;

  objectives.forEach(async objective => {
    const { name, description, icon, keyResults } = objective;

    const period = db.doc(`${parentPath}/periods/${periodId}`);

    const { path } = await db.collection(`${parentPath}/objectives`).add({
      name,
      description,
      icon,
      archived,
      created,
      period,
    });

    await populateKeyResults(keyResults, path);
  });
}

async function populateKeyResults(keyResults, parentPath) {
  if (!keyResults || !keyResults.length) return;

  keyResults.forEach(async keyres => {
    const { description, longDescription, startValue, targetValue, auto, unit, progress } = keyres;

    const { path } = await db.collection(`${parentPath}/keyResults`).add({
      description,
      longDescription,
      startValue,
      targetValue,
      currentValue: startValue,
      auto,
      unit,
      created,
      archived,
    });

    await populateProgress(progress, path);
  });
}

async function populateProgress(progressList, parentPath) {
  if (!progressList || !progressList.length) return;

  await new Promise(resolve => setTimeout(resolve, 1000));

  progressList.forEach(async progress => {
    const { comment, value, timestamp } = progress;

    const randomUserId = allUsers[Math.floor(Math.random() * allUsers.length)].id;
    const createdBy = db.doc(`users/${randomUserId}`);

    await db.collection(`${parentPath}/progress`).add({
      comment: comment || '',
      value,
      archived,
      created: new Date(),
      createdBy,
      timestamp: new Date(timestamp),
    });
  });
}

function slugify(string) {
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;';
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------';
  const p = new RegExp(a.split('').join('|'), 'g');

  /*eslint-disable */
  return string
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-og-') // Replace & with 'og'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

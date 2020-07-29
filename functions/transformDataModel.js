const functions = require('firebase-functions');
const firebaseAdmin = require('firebase-admin');

const db = firebaseAdmin.firestore();

module.exports = functions.https.onRequest(async (req, res) => {
  db.collection('orgs')
    .get()
    .then(snapshot => {
      snapshot.forEach(handleOrg);
    });

  res.status(200).send('Success');
});

async function handleOrg(doc) {
  const { id, ref } = doc;

  // save organization data
  await db.collection('organizations').doc(id).set(doc.data());

  // Save period data
  await ref
    .collection('periods')
    .get()
    .then(snapshot => {
      snapshot.forEach(handlePeriods);
    });

  // Save objective data
  await ref
    .collection('objectives')
    .get()
    .then(snapshot => {
      snapshot.forEach(handleObjective);
    });

  // Save departments data
  await ref
    .collection('departments')
    .get()
    .then(snapshot => {
      snapshot.forEach(handleDepartments);
    });
}

async function handleProducts(doc) {
  const { id, ref } = doc;

  const data = {
    organization: db.collection('organizations').doc(ref.parent.parent.parent.parent.id),
    department: db.collection('departments').doc(ref.parent.parent.id),
    ...doc.data(),
  };

  // save departments data
  await db.collection('products').doc(id).set(data);

  // Save period data
  await ref
    .collection('periods')
    .get()
    .then(snapshot => {
      snapshot.forEach(handlePeriods);
    });

  // Save objective data
  await ref
    .collection('objectives')
    .get()
    .then(snapshot => {
      snapshot.forEach(handleObjective);
    });

  // Save kpi data
  await ref
    .collection('kpis')
    .get()
    .then(snapshot => {
      snapshot.forEach(handleKpis);
    });
}

async function handleKpis(doc) {
  const { id, ref } = doc;

  const data = {
    parent: getParentRef(ref),
    ...doc.data(),
  };

  await db.collection('kpis').doc(id).set(data);

  await ref
    .collection('progress')
    .get()
    .then(snapshot => {
      snapshot.forEach(progressDoc => {
        db.collection(`kpis/${id}/progress`).add(progressDoc.data());
      });
    });
}

async function handleDepartments(doc) {
  const { id, ref } = doc;

  const data = {
    organization: db.collection('organizations').doc(ref.parent.parent.id),
    ...doc.data(),
  };

  // save departments data
  await db.collection('departments').doc(id).set(data);

  // Save period data
  await ref
    .collection('periods')
    .get()
    .then(snapshot => {
      snapshot.forEach(handlePeriods);
    });

  // Save objective data
  await ref
    .collection('objectives')
    .get()
    .then(snapshot => {
      snapshot.forEach(handleObjective);
    });

  // Handle products
  await ref
    .collection('products')
    .get()
    .then(snapshot => {
      snapshot.forEach(handleProducts);
    });
}

async function handleObjective(doc) {
  const { id, ref } = doc;

  const data = {
    parent: getParentRef(ref),
    ...doc.data(),
  };

  data.period = db.collection('periods').doc(data.period.id);

  await db.collection('objectives').doc(id).set(data);

  // Save objective data
  await ref
    .collection('keyResults')
    .get()
    .then(snapshot => {
      snapshot.forEach(handleKeyResults);
    });
}

async function handlePeriods(doc) {
  const { id, ref } = doc;

  const data = {
    parent: getParentRef(ref),
    ...doc.data(),
  };

  await db.collection('periods').doc(id).set(data);
}

async function handleKeyResults(doc) {
  const { id, ref } = doc;

  const objective = db.collection('objectives').doc(ref.parent.parent.path.split('/').pop());
  const parent = getParentRef(ref);

  const data = {
    parent,
    objective,
    ...doc.data(),
  };

  data.name = data.description;
  data.description = data.longDescription;

  delete data.longDescription;

  await db.collection('keyResults').doc(id).set(data);

  await ref
    .collection('progress')
    .get()
    .then(snapshot => {
      snapshot.forEach(progressDoc => {
        db.collection(`keyResults/${id}/progress`).add(progressDoc.data());
      });
    });
}

function getParentRef(ref) {
  const parts = ref.path.split('/');

  if (parts.includes('products')) {
    return db.collection('products').doc(parts[5]);
  }
  if (parts.includes('departments')) {
    return db.collection('departments').doc(parts[3]);
  }
  if (parts.includes('orgs')) {
    return db.collection('organizations').doc(parts[1]);
  }
}

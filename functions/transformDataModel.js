const functions = require('firebase-functions');
const firebaseAdmin = require('firebase-admin');
const { handleKeyResultProgress } = require('./progress/handleKeyResultProgress');
const config = require('./config');

const db = firebaseAdmin.firestore();

exports.transformOnPubsub = function () {
  return functions
    .region(config.region)
    .pubsub.topic('transform-data-model')
    .onPublish(async () => {
      await handleTransform();
    });
};

exports.transformOnRequest = functions.region(config.region).https.onRequest(async (req, res) => {
  await handleTransform();

  res.status(200).send('Success');
});

async function handleTransform() {
  console.log('\n\n--- STARTING MIGRATION --- \n\n');

  try {
    console.log('\n\nTRANSFORMING USERS ...\n');
    await db
      .collection('users')
      .get()
      .then(snapshot => {
        snapshot.forEach(handleUser);
      });
    console.log('\nFINISHED TRANSFORMING USERS\n\n');
  } catch (error) {
    console.error('Could not migrate users');
    throw new Error(error);
  }

  try {
    console.log('\n\nTRANSFORMING DATA ...\n');
    await db
      .collection('orgs')
      .get()
      .then(snapshot => {
        return Promise.all(snapshot.docs.map(handleOrg));
      });
    console.log('\n\nFINISHED TRANSFORMING DATA\n');
  } catch (error) {
    console.error('Could not migrate data');
    throw new Error(error);
  }

  try {
    console.log('\n\nCALCULATING PROGRESSION ...\n');
    await db
      .collection('keyResults')
      .get()
      .then(snapshot => {
        return Promise.all(
          snapshot.docs.map(keyres => {
            return handleKeyResultProgress(null, { params: { keyResultId: keyres.id } });
          })
        );
      });
    console.log('\n\nFINISHED CALCULATING PROGRESSION\n');
  } catch (error) {
    console.error('Could process progressions');
    throw new Error(error);
  }

  console.log('\n\n\n--- MIGRATION COMPLETE --- \n\n');
  return true;
}

async function handleUser({ ref }) {
  const preferences = {
    view: 'compact',
    startPage: null,
    widgets: {
      itemHome: {
        progression: true,
        missionStatement: true,
        team: true,
        children: false,
      },
      objectiveHome: {
        progression: true,
        details: false,
        weights: false,
      },
      keyResultHome: {
        details: false,
        notes: true,
        weights: true,
      },
    },
  };

  try {
    return ref.update({ preferences });
  } catch (error) {
    console.error('Could not update user', ref);
    throw new Error(error);
  }
}

async function handleOrg(doc) {
  const { id, ref } = doc;

  // save organization data
  try {
    await db.collection('organizations').doc(id).set(doc.data());
  } catch (error) {
    console.error('Could not migrate organizations');
    throw new Error(error);
  }

  // Save period data
  try {
    await ref
      .collection('periods')
      .get()
      .then(snapshot => {
        return Promise.all(snapshot.docs.map(handlePeriods));
      });
  } catch (error) {
    console.error('Could not migrate organization period');
    throw new Error(error);
  }

  // Save objective data
  try {
    await ref
      .collection('objectives')
      .get()
      .then(snapshot => {
        return Promise.all(snapshot.docs.map(handleObjective));
      });
  } catch (error) {
    console.error('Could not migrate organization objectives');
    throw new Error(error);
  }

  // Save departments data
  try {
    await ref
      .collection('departments')
      .get()
      .then(snapshot => {
        return Promise.all(snapshot.docs.map(handleDepartments));
      });
  } catch (error) {
    console.error('Could not migrate departments');
    throw new Error(error);
  }
}

async function handleProducts(doc) {
  const { id, ref } = doc;

  const data = {
    organization: db.collection('organizations').doc(ref.parent.parent.parent.parent.id),
    department: db.collection('departments').doc(ref.parent.parent.id),
    ...doc.data(),
    archived: doc.data().archived || false,
  };

  delete data.ref;

  // save product data
  try {
    await db.collection('products').doc(id).set(data);
  } catch (error) {
    console.error('Could not set product data');
    throw new Error(error);
  }

  // Save period data
  try {
    await ref
      .collection('periods')
      .get()
      .then(snapshot => {
        return Promise.all(snapshot.docs.map(handlePeriods));
      });
  } catch (error) {
    console.error('Could not migrate product periods');
    throw new Error(error);
  }

  // Save objective data
  try {
    await ref
      .collection('objectives')
      .get()
      .then(snapshot => {
        return Promise.all(snapshot.docs.map(handleObjective));
      });
  } catch (error) {
    console.error('Could not migrate product objectives');
    throw new Error(error);
  }

  // Save kpi data
  try {
    await ref
      .collection('kpis')
      .get()
      .then(snapshot => {
        return Promise.all(snapshot.docs.map(handleKpis));
      });
  } catch (error) {
    console.error('Could not migrate product kpi');
    throw new Error(error);
  }
}

async function handleKpis(doc) {
  const { id, ref } = doc;

  const data = {
    parent: getParentRef(ref),
    ...doc.data(),
    archived: doc.data().archived || false,
  };

  delete data.ref;

  try {
    await db.collection('kpis').doc(id).set(data);
  } catch (error) {
    console.error('Could not set kpi data');
    throw new Error(error);
  }

  try {
    await ref
      .collection('progress')
      .get()
      .then(snapshot => {
        snapshot.forEach(progressDoc => {
          db.collection(`kpis/${id}/progress`).add(progressDoc.data());
        });
      });
  } catch (error) {
    console.error('Could not migrate kpi progress');
    throw new Error(error);
  }
}

async function handleDepartments(doc) {
  const { id, ref } = doc;

  const data = {
    organization: db.collection('organizations').doc(ref.parent.parent.id),
    ...doc.data(),
    archived: doc.data().archived || false,
  };

  delete data.ref;

  // save departments data
  try {
    await db.collection('departments').doc(id).set(data);
  } catch (error) {
    console.error('Could not set department data');
    throw new Error(error);
  }

  // Save period data
  try {
    await ref
      .collection('periods')
      .get()
      .then(snapshot => {
        return Promise.all(snapshot.docs.map(handlePeriods));
      });
  } catch (error) {
    console.error('Could not migrate department period');
    throw new Error(error);
  }

  // Save objective data
  try {
    await ref
      .collection('objectives')
      .get()
      .then(snapshot => {
        return Promise.all(snapshot.docs.map(handleObjective));
      });
  } catch (error) {
    console.error('Could not migrate department objectives');
    throw new Error(error);
  }

  // Handle products
  try {
    await ref
      .collection('products')
      .get()
      .then(snapshot => {
        return Promise.all(snapshot.docs.map(handleProducts));
      });
  } catch (error) {
    console.error('Could not migrate products');
    throw new Error(error);
  }
}

async function handleObjective(doc) {
  const { id, ref } = doc;

  const data = {
    parent: getParentRef(ref),
    weight: 1,
    ...doc.data(),
    progression: 0,
    archived: doc.data().archived || false,
  };

  delete data.ref;

  data.period = db.collection('periods').doc(data.period.id);

  try {
    await db.collection('objectives').doc(id).set(data);
  } catch (error) {
    console.error('Could not migrate objective', id);
    throw new Error(error);
  }

  // Save objective data
  try {
    await ref
      .collection('keyResults')
      .get()
      .then(snapshot => {
        return Promise.all(snapshot.docs.map(handleKeyResults));
      });
  } catch (error) {
    console.error('Could not migrate key results');
    throw new Error(error);
  }
}

async function handlePeriods(doc) {
  const { id, ref } = doc;

  const data = {
    parent: getParentRef(ref),
    ...doc.data(),
    archived: doc.data().archived || false,
    progression: 0,
  };

  delete data.ref;

  try {
    await db.collection('periods').doc(id).set(data);
  } catch (error) {
    console.error('Could not set periode data', id);
    throw new Error(error);
  }
}

async function handleKeyResults(doc) {
  const { id, ref } = doc;

  const objective = db.collection('objectives').doc(ref.parent.parent.path.split('/').pop());
  const parent = getParentRef(ref);

  const data = {
    parent,
    objective,
    weight: 1,
    ...doc.data(),
    progression: 0,
    archived: doc.data().archived || false,
  };

  data.name = data.description;

  if (data.longDescription) {
    data.description = data.longDescription;
  } else {
    delete data.description;
  }

  delete data.longDescription;
  delete data.ref;

  try {
    await db.collection('keyResults').doc(id).set(data);
  } catch (error) {
    console.error('Could not set key res data', data);
    throw new Error(error);
  }

  try {
    await ref
      .collection('progress')
      .get()
      .then(snapshot => {
        return Promise.all(
          snapshot.docs.map(progressDoc => {
            return db.collection(`keyResults/${id}/progress`).add(progressDoc.data());
          })
        );
      });
  } catch (error) {
    console.error('Could not migrate key result progress');
    throw new Error(error);
  }
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

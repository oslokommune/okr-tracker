import { doc, collection, query, where, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import ObjectiveContributors from '@/db/ObjectiveContributors';

async function getKeyResultOwners(objectiveId) {
  const objectiveRef = doc(db, 'objectives', objectiveId);
  const keyResults = await getDocs(
    query(
      collection(db, 'keyResults'),
      where('objective', '==', objectiveRef),
      where('archived', '==', false)
    )
  )
    .then((snapshot) => snapshot.docs)
    .then((docs) => docs.map((d) => d.data()));

  const keyResultNames = await Promise.all(
    keyResults.map(async (owner) => {
      return {
        ref: owner.parent,
        name: (await getDoc(owner.parent)).data().name,
      };
    })
  );

  return keyResultNames;
}

async function getObjectiveContributors(objectiveId) {
  const objectiveRef = doc(db, 'objectives', objectiveId);
  const objectiveContributors = await getDocs(
    query(
      collection(db, 'objectiveContributors'),
      where('objective', '==', objectiveRef),
      where('archived', '==', false)
    )
  )
    .then((snapshot) => snapshot.docs)
    .then((docs) => docs.map((d) => d.data()));

  const contributors = await Promise.all(
    objectiveContributors.map(async (contributor) => {
      return {
        ref: contributor.item,
        name: (await getDoc(contributor.item)).data().name,
      };
    })
  );
  return contributors;
}

function createObjectiveContributor(itemRef, objectiveId) {
  const objectiveRef = doc(db, 'objectives', objectiveId);
  ObjectiveContributors.create(itemRef, objectiveRef);
}

function removeObjectiveContributor(itemRef, objectiveId) {
  const objectiveRef = doc(db, 'objectives', objectiveId);
  return ObjectiveContributors.remove(itemRef, objectiveRef);
}

async function syncObjectiveContributors(objectiveId) {
  const keyResultOwners = await getKeyResultOwners(objectiveId);
  const contributors = await getObjectiveContributors(objectiveId);

  let redundantContributors = [...contributors];
  let keyResWithNoContributor = [...keyResultOwners];

  // Filter out already present links
  contributors.forEach((c) => {
    keyResultOwners.forEach((k) => {
      if (c.name === k.name) {
        redundantContributors = redundantContributors.filter(
          (con) => con.name !== c.name
        );
        keyResWithNoContributor = keyResWithNoContributor.filter(
          (kr) => kr.name !== k.name
        );
      }
    });
  });

  // We only need one contributor element per unique keyRes parent (here mapped by name)
  const uniqueKeyResWithNoContributor = keyResWithNoContributor.filter(
    (value, index, self) => index === self.findIndex((t) => t.name === value.name)
  );

  // Add missing contributor
  uniqueKeyResWithNoContributor.forEach((k) => {
    createObjectiveContributor(k.ref, objectiveId);
  });

  // Remove redundant contributors
  redundantContributors.forEach((c) => {
    removeObjectiveContributor(c.ref, objectiveId);
  });
}

export default syncObjectiveContributors;

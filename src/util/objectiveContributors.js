import { db } from '@/config/firebaseConfig';
import getActiveItemType from '@/util/getActiveItemType';
import ObjectiveContributors from '@/db/ObjectiveContributors';

async function getKeyResultOwners(objectiveId) {
  const objectiveRef = await db.doc(`objectives/${objectiveId}`);
  const keyResults = await db
    .collection('keyResults')
    .where('objective', '==', objectiveRef)
    .where('archived', '==', false)
    .get()
    .then((snapshot) => snapshot.docs)
    .then((docs) => docs.map((d) => d.data()));

  const keyResultNames = await Promise.all(
    keyResults.map(async (owner) => {
      return {
        ref: await owner.parent.get(),
        name: await owner.parent.get().then((snapshot) => snapshot.data().name),
      };
    })
  );
  return keyResultNames;
}

async function getObjectiveContributors(objectiveId) {
  const objectiveRef = await db.doc(`objectives/${objectiveId}`);
  const objectiveContributors = await db
    .collection('objectiveContributors')
    .where('objective', '==', objectiveRef)
    .where('archived', '==', false)
    .get()
    .then((snapshot) => snapshot.docs)
    .then((docs) => docs.map((d) => d.data()));

  const contributors = await Promise.all(
    objectiveContributors.map(async (con) => {
      return {
        ref: await con.item.get(),
        name: await con.item.get().then((snapshot) => snapshot.data().name),
      };
    })
  );
  return contributors;
}

function createObjectiveContributor(item, objectiveId) {
  const itemType = getActiveItemType(item.data());
  const itemRef = db.doc(`${itemType}s/${item.id}`);
  const objectiveRef = db.doc(`objectives/${objectiveId}`);
  ObjectiveContributors.create(itemRef, objectiveRef);
}

function removeObjectiveContributor(item, objectiveId) {
  const itemType = getActiveItemType(item.data());
  const itemRef = db.doc(`${itemType}s/${item.id}`);
  const objectiveRef = db.doc(`objectives/${objectiveId}`);
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

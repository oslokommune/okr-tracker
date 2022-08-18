import Collection from './Collection';
import booleanInCondition from './utils/booleanInCondition';

class KeyResultsCollection extends Collection {
  constructor(firestore) {
    super(firestore, 'keyResults');
  }

  getKeyResultsByObjectiveRef(objectiveRef, includeArchived = false) {
    return this.collectionRef
      .where('objective', '==', objectiveRef)
      .where(...booleanInCondition('archived', includeArchived))
      .orderBy('name');
  }
}

export default KeyResultsCollection;

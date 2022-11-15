import Collection from './Collection';

class ObjectivesCollection extends Collection {
  constructor(firestore) {
    super(firestore, 'objectives');
  }
}

export default ObjectivesCollection;

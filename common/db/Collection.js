class Collection {
  constructor(firestore, collectionName) {
    this.collectionRef = firestore.collection(collectionName);
  }

  getCollection() {
    return this.collectionRef;
  }

  getDocumentRef(id) {
    return this.collectionRef.doc(id);
  }
}

export default Collection;

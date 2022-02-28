class AccessRequestCollection {
  constructor(firestore) {
    this.collectionRef = firestore.collection('requestAccess');
  }

  getCollection() {
    return this.collectionRef;
  }

  getDocumentRef(id) {
    return this.collectionRef.doc(id);
  }

  async addDocument(document) {
    return this.collectionRef.add({ created: Date.now(), ...document });
  }

  deleteDocument(id) {
    return this.collectionRef.doc(id).delete();
  }
}

export default AccessRequestCollection;

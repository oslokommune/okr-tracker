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
    const docRef = this.collectionRef.doc(document.email);

    if ((await docRef.get()).exists) {
      throw new Error('toaster.request.requestExists');
    }

    return docRef.set({ created: Date.now(), ...document });
  }

  deleteDocument(id) {
    return this.collectionRef.doc(id).delete();
  }
}

export default AccessRequestCollection;

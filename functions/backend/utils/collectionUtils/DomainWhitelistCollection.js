class DomainWhitelistCollection {
  constructor(firestore) {
    this.collection = firestore.collection('domainWhitelist');
  }

  getDocumentById(id) {
    return this.collection.doc(id).get();
  }
}

export default DomainWhitelistCollection;

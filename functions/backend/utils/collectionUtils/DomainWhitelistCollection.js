class DomainWhitelistCollection {
  constructor(firestore) {
    this.collection = firestore.collection('domainWhitelist');
  }

  listDocuments() {
    return this.collection.listDocuments();
  }
}

export default DomainWhitelistCollection;

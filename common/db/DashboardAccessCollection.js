import Collection from './Collection';

class DashboardAccessCollection extends Collection {
  constructor(firestore) {
    super(firestore, 'dashboardAccess');
  }
}

export default DashboardAccessCollection;

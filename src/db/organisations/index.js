import { db } from '@/config/firebaseConfig';

import update from './update';
import archive from './archive';
import restore from './restore';

export default class Organisation {
  constructor(id) {
    if (!id) throw new Error('Invalid data');
    this.ref = db.collection('orgs').doc(id);
  }
}

Organisation.prototype.update = update;
Organisation.prototype.archive = archive;
Organisation.prototype.restore = restore;

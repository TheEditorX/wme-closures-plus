import Dexie, { EntityTable } from 'dexie';
import { ClosurePreset } from '../interfaces';

const db = new Dexie(__SCRIPT_ID__) as Dexie & {
  closurePresets: EntityTable<ClosurePreset, 'id'>;
};

db.version(1).stores({
  closurePresets: '++id, name, createdAt, updatedAt',
});

export { db };

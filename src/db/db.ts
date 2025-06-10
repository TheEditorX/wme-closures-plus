import Dexie, { EntityTable } from 'dexie';
import { ClosurePreset } from '../interfaces';

const db = new Dexie(__SCRIPT_ID__) as Dexie & {
  closurePresets: EntityTable<ClosurePreset, 'id'>;
};

db.version(2)
  .stores({
    closurePresets: '++id, name, createdAt, updatedAt',
  })
  .upgrade((transaction) => {
    return transaction
      .table('closurePresets')
      .toCollection()
      .modify((closurePreset: ClosurePreset) => {
        if (closurePreset.closureDetails.end.type !== 'FIXED') return;
        closurePreset.closureDetails.end.postponeBy = 0;
      });
  });

db.version(3)
  .stores({
    closurePresets: '++id, name, createdAt, updatedAt',
  })
  .upgrade((transaction) => {
    return transaction
      .table('closurePresets')
      .toCollection()
      .modify((closurePreset: ClosurePreset) => {
        if (closurePreset.closureDetails.end.type !== 'DURATIONAL') return;
        // Initialize roundUpTo as undefined for existing durational presets
        closurePreset.closureDetails.end.roundUpTo = undefined;
      });
  });

export { db };
